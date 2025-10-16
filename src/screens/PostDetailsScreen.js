import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share
} from 'react-native';
import { auth } from '../config/firebase';
import { getPosts, likePost, deletePost } from '../services/postService';
import CommentsModal from '../components/CommentsModal';
import PlaceholderCard from '../components/PlaceholderCard';

export default function PostDetailsScreen({ route, navigation }) {
  const { postId } = route.params;
  const currentUserId = auth.currentUser?.uid;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const response = await getPosts({ authorId: postId, limit: 1 });
      if (response.data.success && response.data.posts.length > 0) {
        setPost(response.data.posts[0]);
      } else {
        Alert.alert('Error', 'Post not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      Alert.alert('Error', 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [postId, navigation]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async () => {
    try {
      await likePost({ postId: post.id, userId: currentUserId });
      // Update local state
      setPost(prev => ({
        ...prev,
        liked: !prev.liked,
        engagement: {
          ...prev.engagement,
          likes: prev.liked ? prev.engagement.likes - 1 : prev.engagement.likes + 1
        }
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleComment = () => {
    setCommentsModalVisible(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post: ${post.content}`,
        url: post.mediaUrls?.[0], // Optional: add media URL if available
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(post.id);
              Alert.alert('Success', 'Post deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  const renderPostType = () => {
    switch (post.type) {
      case 'text':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.postText}>{post.content}</Text>
          </View>
        );
      case 'image':
        return (
          <View style={styles.contentContainer}>
            <Image source={{ uri: post.mediaUrls?.[0] }} style={styles.mediaImage} />
            {post.caption && <Text style={styles.caption}>{post.caption}</Text>}
          </View>
        );
      case 'video':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.placeholderText}>Video content - {post.content}</Text>
            {post.caption && <Text style={styles.caption}>{post.caption}</Text>}
          </View>
        );
      case 'challenge_update':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.challengeUpdate}>💪 Challenge Update</Text>
            <Text style={styles.postText}>{post.content}</Text>
            {post.caption && <Text style={styles.caption}>{post.caption}</Text>}
          </View>
        );
      case 'dare_proof':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.dareProof}>🎯 Dare Proof</Text>
            {post.mediaUrls?.[0] && (
              <Image source={{ uri: post.mediaUrls[0] }} style={styles.mediaImage} />
            )}
            <Text style={styles.postText}>{post.content}</Text>
            {post.caption && <Text style={styles.caption}>{post.caption}</Text>}
          </View>
        );
      case 'story':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.story}>📖 Story</Text>
            <Text style={styles.postText}>{post.content}</Text>
            {post.mediaUrls?.[0] && (
              <Image source={{ uri: post.mediaUrls[0] }} style={styles.mediaImage} />
            )}
            {post.caption && <Text style={styles.caption}>{post.caption}</Text>}
          </View>
        );
      default:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.postText}>{post.content}</Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text>Post not found</Text>
      </View>
    );
  }

  const isAuthor = post.authorId === currentUserId;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.postContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { user: { uid: post.authorId } })}>
            <Text style={styles.author}>@{post.authorId}</Text>
          </TouchableOpacity>
          <Text style={styles.createdAt}>
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Post type and content */}
        {renderPostType()}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <TouchableOpacity key={index} style={styles.tagButton}>
                <Text style={styles.tagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Engagement */}
        <View style={styles.engagement}>
          <View style={styles.engagementItem}>
            <Text style={styles.engagementIcon}>❤️</Text>
            <Text style={styles.engagementCount}>{post.engagement.likes}</Text>
          </View>
          <View style={styles.engagementItem}>
            <Text style={styles.engagementIcon}>💬</Text>
            <Text style={styles.engagementCount}>{post.engagement.comments}</Text>
          </View>
          <View style={styles.engagementItem}>
            <Text style={styles.engagementIcon}>📈</Text>
            <Text style={styles.engagementCount}>{post.engagement.shares}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Text style={[styles.actionIcon, post.liked && styles.likedIcon]}>
              {post.liked ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <Text style={styles.actionIcon}>💬</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionIcon}>🔗</Text>
          </TouchableOpacity>

          {isAuthor && (
            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Text style={styles.actionIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Post card for navigation */}
      <TouchableOpacity style={styles.cardContainer}>
        <PlaceholderCard title="View Related Content" subtitle="Explore more posts" />
      </TouchableOpacity>

      {/* Comments modal */}
      <CommentsModal
        isVisible={commentsModalVisible}
        onClose={() => setCommentsModalVisible(false)}
        activityId={`post_${post.id}`} // Using post ID for comments
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  postContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  author: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createdAt: {
    color: '#666',
    fontSize: 14,
  },
  contentContainer: {
    marginBottom: 16,
  },
  postText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  mediaImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 8,
  },
  caption: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
  },
  challengeUpdate: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dareProof: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  story: {
    color: '#9370DB',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagButton: {
    backgroundColor: '#333',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#007AFF',
    fontSize: 14,
  },
  engagement: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  engagementItem: {
    alignItems: 'center',
  },
  engagementIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  engagementCount: {
    color: '#666',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionIcon: {
    fontSize: 24,
  },
  likedIcon: {
    color: '#FF6B6B',
  },
  cardContainer: {
    marginTop: 20,
  },
});
