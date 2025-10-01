import { completeTwitterAuth, fetchFollowers, fetchTwitterUser } from '@/src/lib/twitter';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const mockFriends = [
  { id: 1, username: '@winterguy', avatar: '🥶' },
  { id: 2, username: '@smilingguy', avatar: '😊' },
  { id: 3, username: '@gradguy', avatar: '🎓' },
  { id: 4, username: '@foodguy', avatar: '🍔' },
];

export default function CreateChallengeScreen() {
  const [friends, setFriends] = useState(mockFriends); // Start with mock data, replace with real data if available
  const [user, setUser] = useState(null);

  // Fetch user followers when component mounts (if user is logged in)
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // For now, try to fetch from stored tokens and get followers
        const tokens = await import('@/src/lib/twitter').then(module => module.getStoredAuthTokens());
        if (!tokens?.accessToken) {
          setFriends(mockFriends); // Show mock data if not logged in
          return;
        }

        const currentUser = await fetchTwitterUser(tokens.accessToken);
        setUser(currentUser);

        if (currentUser?.id) {
          const followers = await fetchFollowers(tokens.accessToken, currentUser.id, 10);
          const formattedFriends = followers.map((follower: any) => ({
            id: follower.id,
            username: `@${follower.username}`,
            name: follower.name,
            avatar: follower.profile_image_url || '👤' // Use emoji placeholder if no image
          }));
          setFriends(formattedFriends.length > 0 ? formattedFriends : mockFriends);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        setFriends(mockFriends);
      }
    };

    loadUserData();
  }, []);
  const handleAchievements = () => {
    // Navigate to achievements - would need router here
    console.log('Navigate to achievements');
  };

  const handleCopyReferral = () => {
    // Copy referral link
    console.log('Copy referral link');
  };

  const handleCreateChallenge = () => {
    // Navigate to create challenge screen or open form
    console.log('Navigate to create challenge');
  };

  const handleTwitterAuth = async () => {
    try {
      const result = await completeTwitterAuth();
      if (result.success) {
        Alert.alert('Success', `Logged in as: ${result.user.username}`);
      } else if (result.canceled) {
        Alert.alert('Cancelled', 'Twitter login was cancelled');
      } else {
        Alert.alert('Error', 'Twitter login failed');
      }
    } catch (error) {
      console.error('Twitter auth error:', error);
      Alert.alert('Error', 'Failed to login with Twitter');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.balanceContainer}>
          <View style={styles.stonesBadge}>
            <Text style={styles.stonesText}>∘ 10</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Top buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.topButton} onPress={handleAchievements}>
            <Text style={styles.topButtonText}>Achievements</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topButton} onPress={handleCopyReferral}>
            <Text style={styles.topButtonText}>Copy Referral Link</Text>
          </TouchableOpacity>
        </View>

        {/* Create New Challenge button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreateChallenge}>
          <Text style={styles.createButtonText}>Create New Challenge</Text>
        </TouchableOpacity>

        {/* Twitter Login Button (Example) */}
        <TouchableOpacity style={styles.twitterButton} onPress={handleTwitterAuth}>
          <Text style={styles.twitterButtonText}>🔗 Login with Twitter</Text>
        </TouchableOpacity>

        {/* 1v1 Your Best Friends section */}
        <View style={styles.friendsSection}>
          <Text style={styles.friendsTitle}>1v1 Your Best Friends</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.friendsScroll}>
            {friends.map((friend) => (
              <View key={friend.id} style={styles.friendItem}>
                <Text style={styles.friendAvatar}>{friend.avatar}</Text>
                <Text style={styles.friendName}>{friend.username}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  stonesBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  stonesText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  topButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  topButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  createButton: {
    backgroundColor: '#666',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 32,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  twitterButton: {
    backgroundColor: '#1DA1F2',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 32,
  },
  twitterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendsSection: {
    marginBottom: 20,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  friendsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  friendItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A2A2A',
    textAlign: 'center',
    fontSize: 28,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 50,
  },
  friendName: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
});
