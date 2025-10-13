import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { collection, query, orderBy, where, getDocs, limit, startAfter, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useFollowing } from '../hooks/useFollowing';
import CommentsModal from '../components/CommentsModal';
import PlaceholderCard from '../components/PlaceholderCard';

// Page size for infinite scroll
const PAGE_SIZE = 20;

export default function ActivityFeedScreen({ navigation }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
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
      const following = await fetchFollowingList();
      const publicUids = [...following, currentUserId]; // Include self for own posts

      let q = query(
        collection(db, 'activities'),
        where('actorId', 'in', publicUids),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      );

      if (loadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      } else {
        // Reset for initial load or refresh
        setLastDoc(null);
        setActivities([]);
      }

      const querySnapshot = await getDocs(q);
      const newActivities = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();

        // Skip if activity type is not public (assuming visibility field, but since not specified, assume all are public for now)

        // Fetch likes count
        const likesSnap = await getDocs(collection(docSnap.ref, 'likes'));
        const likesCount = likesSnap.size;
        const likedByUser = likesSnap.docs.some(likeDoc => likeDoc.id === currentUserId);

        // Fetch comments count
        const commentsSnap = await getDocs(collection(docSnap.ref, 'comments'));
        const commentsCount = commentsSnap.size;

        // Enhance dare activities with additional data
        let enhancedData = { ...data };

        if (data.type === 'dare' && data.dareId) {
          try {
            const dareDoc = await getDoc(doc(db, 'dares', data.dareId));
            if (dareDoc.exists()) {
              const dareData = dareDoc.data();
              enhancedData = { ...enhancedData, ...dareData };
            }
          } catch (error) {
            console.error('Error fetching dare data:', error);
          }
        }

        newActivities.push({
          id: docSnap.id,
          ...enhancedData,
          likes: likesCount,
          comments: commentsCount,
          liked: likedByUser,
        });
      }

      if (newActivities.length > 0) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        if (loadMore) {
          setActivities(prev => [...prev, ...newActivities]);
        } else {
          setActivities(newActivities);
        }
      } else {
        setHasMore(false);
      }

      if (querySnapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }

    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      loadingState(false);
      if (refreshingState) refreshingState(false);
    }
  }, [currentUserId, hasMore, lastDoc, fetchFollowingList]);

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
    // Similar rendering logic to HomeFeedScreen, adapted for the new structure
    if (item.type === 'dare') {
      return (
        <View style={styles.postContainer}>
          <View style={styles.headerRow}>
            {item.winner && (
              <TouchableOpacity onPress={() => navigation.navigate('Profile', { user: item.winner })}>
                <Text style={styles.postUsername}>{item.winner.username}</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.postHeader}> beat </Text>
            {item.losers && item.losers.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Profile', { user: item.losers[0] })}>
                <Text style={styles.postUsername}>{item.losers[0].username}</Text>
              </TouchableOpacity>
            )}
          </View>
          {item.winnerProof && (
            <View style={styles.mediaContainer}>
              <Image source={{ uri: item.winnerProof.mediaUrl }} style={styles.mediaImage} />
              {item.winnerProof.caption && <Text style={styles.caption}>{item.winnerProof.caption}</Text>}
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('DareDetails', { dare: item })}>
            <PlaceholderCard title={item.title} subtitle={`+${item.rewardStone} Stone 🪨`} />
          </TouchableOpacity>
          <View style={styles.socialBar}>
            <TouchableOpacity style={styles.socialItem} onPress={() => handleComment(item.id)}>
              <Text style={styles.icon}>💬</Text>
              <Text style={styles.count}>{item.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialItem} onPress={() => handleLike(item.id, item.liked)}>
              <Text style={styles.icon}>{item.liked ? '❤️' : '🤍'}</Text>
              <Text style={styles.count}>{item.likes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (item.type === 'post') {
      return (
        <TouchableOpacity onPress={() => navigation.navigate("PostDetails", { activityId: item.id })}>
          <View style={styles.postContainer}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile', { user: { id: item.actorId, username: item.actorId } })}>
                <Text style={styles.postUsername}>@{item.actorId}</Text>
              </TouchableOpacity>
            </View>
            {item.text && <Text style={styles.postText}>{item.text}</Text>}
            {item.mediaUrl && (
              <View style={styles.mediaContainer}>
                <Image source={{ uri: item.mediaUrl }} style={styles.mediaImage} />
              </View>
            )}
            {item.hashtags && item.hashtags.length > 0 && (
              <Text style={styles.hashtags}>{item.hashtags.map(tag => '#'+tag).join(' ')}</Text>
            )}
            <View style={styles.socialBar}>
              <TouchableOpacity style={styles.socialItem} onPress={() => handleComment(item.id)}>
                <Text style={styles.icon}>💬</Text>
                <Text style={styles.count}>{item.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialItem} onPress={() => handleLike(item.id, item.liked)}>
                <Text style={styles.icon}>{item.liked ? '❤️' : '🤍'}</Text>
                <Text style={styles.count}>{item.likes}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  if (loading && activities.length === 0) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
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
        contentContainerStyle={styles.listContent}
      />
      <CommentsModal
        isVisible={commentsModalVisible}
        onClose={() => setCommentsModalVisible(false)}
        activityId={selectedActivityId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  postContainer: {
    marginBottom: 16,
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
    color: '#667eea',
    textDecorationLine: 'underline'
  },
  postHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff'
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
    textAlign: 'center',
    color: '#ffffff'
  },
  postText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8
  },
  hashtags: {
    color: '#667eea',
    fontSize: 14,
    marginBottom: 8
  },
  socialBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  socialItem: {
    alignItems: 'center',
    flex: 1
  },
  icon: {
    fontSize: 22,
    padding: 11,
    color: '#ffffff'
  },
  count: {
    fontSize: 14,
    color: '#a1a1aa'
  },
});
