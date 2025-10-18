import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  View,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { collection, query, orderBy, where, getDocs, limit, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useFollowing } from '../hooks/useFollowing';
import CommentsModal from '../components/CommentsModal';
import PlaceholderCard from '../components/PlaceholderCard';
import { useThemeColor } from '../../hooks/use-theme-color';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { listCompletedDares } from '../lib/firebase';

// Page size for infinite scroll
const PAGE_SIZE = 20;

export default function ActivityFeedScreen({ navigation }) {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'icon');

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  const currentUserId = auth.currentUser?.uid;
  const dummyUserId = 'dummy'; // For useFollowing hook, we don't need it here but need the following count

  useFollowing(currentUserId, dummyUserId);

  // Get following list for the current user
  const fetchFollowingList = useCallback(async () => {
    if (!currentUserId) return [];
    try {
      const followingRef = collection(db, 'users', currentUserId, 'following');
      const followingSnap = await getDocs(followingRef);
      const following = followingSnap.docs.map(doc => doc.id);
      return following;
    } catch (error) {
      console.error('Error fetching following list:', error);
      return [];
    }
  }, [currentUserId]);

  // Fetch activities with filtering
  const fetchActivities = useCallback(async (loadMore = false) => {
    if (!hasMore && loadMore) return;

    const loadingState = loadMore ? setLoadingMore : setLoading;
    const refreshingState = loadMore ? null : setRefreshing;

    loadingState(true);
    if (refreshingState) refreshingState(true);

    try {
      // Fetch both post activities and completed dares
      const [postActivities, completedDares] = await Promise.all([
        fetchPostActivities(loadMore),
        fetchCompletedDares()
      ]);

      // Convert completed dares to activity format
      const dareActivities = completedDares.map(dare => ({
        id: `dare-${dare.id}`,
        type: 'dare',
        actorId: dare.winner?.uid || currentUserId,
        ...dare,
        likes: 0, // Dares don't have likes/comments in the same way
        comments: 0,
        liked: false,
        createdAt: new Date(), // Use completion time
      }));

      // Combine and sort by created time (most recent first)
      const allActivities = [...postActivities, ...dareActivities].sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime;
      });

      if (loadMore) {
        setActivities(prev => [...prev, ...allActivities]);
      } else {
        setActivities(allActivities);
      }

      // For now, assume we got all available data
      setHasMore(allActivities.length >= PAGE_SIZE);

    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      loadingState(false);
      if (refreshingState) refreshingState(false);
    }
  }, [currentUserId, hasMore, fetchPostActivities, fetchCompletedDares]);

  // Fetch post activities from Firebase
  const fetchPostActivities = useCallback(async (loadMore = false) => {
    const following = await fetchFollowingList();
    const publicUids = [...following, currentUserId];

    // Split into smaller chunks if following list is too large (Firestore 'in' limit is 10)
    const uidChunks = [];
    for (let i = 0; i < publicUids.length; i += 10) {
      uidChunks.push(publicUids.slice(i, i + 10));
    }

    const allActivities = [];
    for (const uidChunk of uidChunks) {
      const q = query(
        collection(db, 'activities'),
        where('actorId', 'in', uidChunk),
        orderBy('createdAt', 'desc'),
        limit(10) // Fetch fewer per chunk
      );

      const querySnapshot = await getDocs(q);
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();

        // Fetch likes and comments counts
        const [likesSnap, commentsSnap] = await Promise.all([
          getDocs(collection(docSnap.ref, 'likes')),
          getDocs(collection(docSnap.ref, 'comments'))
        ]);

        const likesCount = likesSnap.size;
        const commentsCount = commentsSnap.size;
        const likedByUser = likesSnap.docs.some(likeDoc => likeDoc.id === currentUserId);

        allActivities.push({
          id: docSnap.id,
          ...data,
          likes: likesCount,
          comments: commentsCount,
          liked: likedByUser,
        });
      }
    }

    return allActivities;
  }, [currentUserId, fetchFollowingList]);

  // Fetch completed dares
  const fetchCompletedDares = useCallback(async () => {
    try {
      const result = await listCompletedDares();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching completed dares:', error);
      return [];
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setHasMore(true);
    fetchActivities();
  }, [fetchActivities]);

  // Handle infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !loadingMore) {
      fetchActivities(true);
    }
  }, [loading, hasMore, loadingMore, fetchActivities]);

  // Handle like
  const handleLike = async (activityId, currentlyLiked) => {
    try {
      const uid = auth.currentUser.uid;
      const ref = doc(db, "activities", activityId, "likes", uid);
      if (currentlyLiked) {
        await deleteDoc(ref);
        setActivities(prev => prev.map(act =>
          act.id === activityId
            ? { ...act, liked: false, likes: act.likes - 1 }
            : act
        ));
      } else {
        await setDoc(ref, { createdAt: new Date() });
        setActivities(prev => prev.map(act =>
          act.id === activityId
            ? { ...act, liked: true, likes: act.likes + 1 }
            : act
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Handle comment
  const handleComment = (activityId) => {
    setSelectedActivityId(activityId);
    setCommentsModalVisible(true);
  };

  // Render activity item
  const renderActivityItem = ({ item }) => {
    const dynamicStyles = getDynamicStyles(cardColor, textColor, accentColor, borderColor, iconColor, textColor);

    // Similar rendering logic to HomeFeedScreen, adapted for the new structure
    if (item.type === 'dare') {
      return (
        <ThemedView style={dynamicStyles.postContainer}>
          <View style={dynamicStyles.headerRow}>
            {item.winner && (
              <TouchableOpacity onPress={() => navigation.navigate('Profile', { user: item.winner })}>
                <ThemedText style={dynamicStyles.postUsername}>{item.winner.username}</ThemedText>
              </TouchableOpacity>
            )}
            <ThemedText style={dynamicStyles.postHeader}> beat </ThemedText>
            {item.losers && item.losers.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Profile', { user: item.losers[0] })}>
                <ThemedText style={dynamicStyles.postUsername}>{item.losers[0].username}</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          {item.winnerProof && (
            <View style={dynamicStyles.mediaContainer}>
              <Image source={{ uri: item.winnerProof.mediaUrl }} style={dynamicStyles.mediaImage} />
              {item.winnerProof.caption && <ThemedText style={dynamicStyles.caption}>{item.winnerProof.caption}</ThemedText>}
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('DareDetails', { dare: item })}>
            <PlaceholderCard title={item.title} subtitle={`+${item.rewardStone} Stone 🪨`} />
          </TouchableOpacity>
          <ThemedView style={dynamicStyles.socialBar}>
            <TouchableOpacity style={dynamicStyles.socialItem} onPress={() => handleComment(item.id)}>
              <ThemedText style={dynamicStyles.icon}>💬</ThemedText>
              <ThemedText style={dynamicStyles.count}>{item.comments}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.socialItem} onPress={() => handleLike(item.id, item.liked)}>
              <ThemedText style={dynamicStyles.icon}>{item.liked ? '❤️' : '🤍'}</ThemedText>
              <ThemedText style={dynamicStyles.count}>{item.likes}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      );
    }

    if (item.type === 'post') {
      return (
        <TouchableOpacity onPress={() => navigation.navigate("PostDetails", { activityId: item.id })}>
          <ThemedView style={dynamicStyles.postContainer}>
            <View style={dynamicStyles.headerRow}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile', { user: { id: item.actorId, username: item.actorId } })}>
                <ThemedText style={dynamicStyles.postUsername}>@{item.actorId}</ThemedText>
              </TouchableOpacity>
            </View>
            {item.text && <ThemedText style={dynamicStyles.postText}>{item.text}</ThemedText>}
            {item.mediaUrl && (
              <View style={dynamicStyles.mediaContainer}>
                <Image source={{ uri: item.mediaUrl }} style={dynamicStyles.mediaImage} />
              </View>
            )}
            {item.hashtags && item.hashtags.length > 0 && (
              <ThemedText style={dynamicStyles.hashtags}>{item.hashtags.map(tag => '#'+tag).join(' ')}</ThemedText>
            )}
            <ThemedView style={dynamicStyles.socialBar}>
              <TouchableOpacity style={dynamicStyles.socialItem} onPress={() => handleComment(item.id)}>
                <ThemedText style={dynamicStyles.icon}>💬</ThemedText>
                <ThemedText style={dynamicStyles.count}>{item.comments}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={dynamicStyles.socialItem} onPress={() => handleLike(item.id, item.liked)}>
                <ThemedText style={dynamicStyles.icon}>{item.liked ? '❤️' : '🤍'}</ThemedText>
                <ThemedText style={dynamicStyles.count}>{item.likes}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      );
    }

    return null;
  };

  if (loading && activities.length === 0) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  const containerStyles = getDynamicStyles(backgroundColor, cardColor, textColor, accentColor, borderColor, iconColor);

  return (
    <ThemedView style={containerStyles.container}>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={renderActivityItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator /> : null}
        contentContainerStyle={containerStyles.listContent}
      />
      <CommentsModal
        isVisible={commentsModalVisible}
        onClose={() => setCommentsModalVisible(false)}
        activityId={selectedActivityId}
      />
    </ThemedView>
  );
}

const getDynamicStyles = (backgroundColor, cardColor, textColor, accentColor, borderColor, iconColor) => StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  postContainer: {
    marginBottom: 16,
    backgroundColor: cardColor,
    borderRadius: 8,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  postUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: accentColor,
    textDecorationLine: 'underline'
  },
  postHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaContainer: {
    marginBottom: 8,
    alignSelf: 'center'
  },
  mediaImage: {
    width: 231,
    height: 350,
    borderRadius: 8
  },
  caption: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center'
  },
  postText: {
    fontSize: 16,
    marginBottom: 8
  },
  hashtags: {
    color: accentColor,
    fontSize: 14,
    marginBottom: 8
  },
  socialBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: borderColor
  },
  socialItem: {
    alignItems: 'center',
    flex: 1
  },
  icon: {
    fontSize: 22,
    padding: 11,
  },
  count: {
    fontSize: 14,
    color: iconColor
  },
});
