const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

exports.createPost = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const {
    authorId,
    type,
    content,
    mediaUrls,
    caption,
    tags,
    visibility
  } = data;

  const userId = context.auth.uid;

  // Validate required fields
  if (!type || !content) {
    throw new functions.https.HttpsError('invalid-argument', 'Type and content are required.');
  }

  // Verify the authorId matches the authenticated user
  if (authorId !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'You can only create posts for yourself.');
  }

  // Validate post type
  const validTypes = ["text", "image", "video", "challenge_update", "dare_proof", "story"];
  if (!validTypes.includes(type)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid post type.');
  }

  // Validate visibility
  const validVisibilities = ["public", "friends", "private"];
  if (visibility && !validVisibilities.includes(visibility)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid visibility setting.');
  }

  try {
    const now = admin.firestore.FieldValue.serverTimestamp();

    // Create the post document
    const postRef = db.collection('posts').doc();
    const postData = {
      authorId: userId,
      type,
      content,
      mediaUrls: mediaUrls || [],
      caption: caption || "",
      tags: tags || [],
      visibility: visibility || "public",
      createdAt: now,
      updatedAt: now,
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
      },
      stoneReward: {
        baseReward: 10, // Base reward for creating a post
        engagementBonus: 0,
        totalEarned: 10,
        claimed: false,
      },
      moderation: {
        status: "pending", // Posts go through moderation initially
        flaggedReason: "",
        approvedAt: null,
      }
    };

    await postRef.set(postData);

    // Also create an activity entry for the post
    await db.collection('activities').add({
      type: 'post',
      actorId: userId,
      postId: postRef.id,
      text: type === 'text' ? content : null,
      mediaUrl: type === 'image' ? mediaUrls?.[0] : null,
      hashtags: tags,
      createdAt: now,
    });

    // Creation rewards are now handled by the rewardsEngine triggers

    return {
      success: true,
      postId: postRef.id,
      post: {
        id: postRef.id,
        ...postData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      message: 'Post created successfully.'
    };

  } catch (error) {
    console.error('Error creating post:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create post.');
  }
});

exports.getPosts = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { filters, limit = 50, offset = 0 } = data;
  const userId = context.auth.uid;

  try {
    let query = db.collection('posts')
      .where('moderation.status', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    // Apply visibility filters
    if (filters?.visibility) {
      query = query.where('visibility', '==', filters.visibility);
    } else {
      // Default to public posts and posts from friends/following
      // For now, show public posts only
      query = query.where('visibility', '==', 'public');
    }

    // Apply user filter if specified
    if (filters?.authorId) {
      query = query.where('authorId', '==', filters.authorId);
    }

    // Apply type filter if specified
    if (filters?.type) {
      query = query.where('type', '==', filters.type);
    }

    const snapshot = await query.get();
    const posts = [];

    for (const doc of snapshot.docs) {
      const postData = doc.data();

      // Get engagement counts
      const [likesCount, commentsCount, sharesCount] = await Promise.all([
        db.collection('posts').doc(doc.id).collection('likes').get(),
        db.collection('posts').doc(doc.id).collection('comments').get(),
        db.collection('posts').doc(doc.id).collection('shares').get()
      ]);

      // Check if user liked this post
      const userLikedSnapshot = await db.collection('posts').doc(doc.id).collection('likes').doc(userId).get();

      posts.push({
        id: doc.id,
        ...postData,
        engagement: {
          likes: likesCount.size,
          comments: commentsCount.size,
          shares: sharesCount.size,
          views: postData.engagement?.views || 0,
        },
        liked: userLikedSnapshot.exists,
      });
    }

    return {
      success: true,
      posts,
      message: 'Posts fetched successfully.'
    };

  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch posts.');
  }
});

exports.likePost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { postId } = data;
  const userId = context.auth.uid;

  try {
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Post not found.');
    }

    const likeRef = postRef.collection('likes').doc(userId);
    const likeDoc = await likeRef.get();

    const now = admin.firestore.FieldValue.serverTimestamp();

    if (!likeDoc.exists) {
      // Add like
      await likeRef.set({ createdAt: now });
      await postRef.update({
        'engagement.likes': admin.firestore.FieldValue.increment(1)
      });
    } else {
      // Remove like
      await likeRef.delete();
      await postRef.update({
        'engagement.likes': admin.firestore.FieldValue.increment(-1)
      });
    }

    return {
      success: true,
      message: 'Like toggled successfully.'
    };

  } catch (error) {
    console.error('Error toggling like:', error);
    throw new functions.https.HttpsError('internal', 'Failed to toggle like.');
  }
});

exports.commentOnPost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { postId, comment } = data;
  const userId = context.auth.uid;

  if (!comment || comment.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Comment cannot be empty.');
  }

  try {
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Post not found.');
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    // Add comment
    await postRef.collection('comments').add({
      userId,
      comment: comment.trim(),
      createdAt: now,
    });

    // Update comment count
    await postRef.update({
      'engagement.comments': admin.firestore.FieldValue.increment(1)
    });

    return {
      success: true,
      message: 'Comment added successfully.'
    };

  } catch (error) {
    console.error('Error adding comment:', error);
    throw new functions.https.HttpsError('internal', 'Failed to add comment.');
  }
});

exports.deletePost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { postId } = data;
  const userId = context.auth.uid;

  try {
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Post not found.');
    }

    const postData = postDoc.data();

    // Check if user is the author
    if (postData.authorId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'You can only delete your own posts.');
    }

    // Delete the post
    await postRef.delete();

    // TODO: Delete associated activities, likes, comments, etc.

    return {
      success: true,
      message: 'Post deleted successfully.'
    };

  } catch (error) {
    console.error('Error deleting post:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete post.');
  }
});
