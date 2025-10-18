import { useContext, useState, useEffect } from "react";
import { Image, StyleSheet, TouchableOpacity, View, FlatList, SafeAreaView, ScrollView, TextInput } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Icon from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { getUserReferralData } from '../services/referralService';
import { useThemeColor } from '../hooks/use-theme-color';
import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { useDares } from '../hooks/useDares';
import { useUserActivities } from '../hooks/useUserActivities';
import { getUserPosts } from '../services/postService';

export default function ProfileScreen(props) {
  const { navigation, route } = props;
  const { user, logout, loading } = useContext(AuthContext);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');

  const dynamicStyles = getDynamicStyles(backgroundColor, cardColor, textColor, accentColor);
  const [referralData, setReferralData] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    contentType: 'All',
    dateRange: 'All',
    myPosts: false,
  });

  // Stories data (mock)
  const stories = [
    { id: '1', user: '@willsamrick', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: '2', user: '@frankvecchie', image: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { id: '3', user: '@mattbraun', image: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: '4', user: '@brendengroess', image: 'https://randomuser.me/api/portraits/men/4.jpg' },
  ];

  const profileUser = route.params?.user || user;
  const isOwnProfile = !route.params?.user;

  // Hook calls for profile sections
  const dares = useDares();
  const { activities, loading: activitiesLoading } = useUserActivities(profileUser?.id || user?.id, 3);

  // Filter user's dares (assuming dares from useDares are all dares, filter by creator or participants)
  const userDares = isOwnProfile ? dares.filter(dare => dare.creatorId === user?.id || dare.participants.includes(user?.id)) : [];

  // Load user posts
  useEffect(() => {
    const loadPosts = async () => {
      if (profileUser?.id) {
        setPostsLoading(true);
        try {
          const response = await getUserPosts(profileUser.id);
          if (response.data && response.data.posts) {
            setUserPosts(response.data.posts);
          } else {
            setUserPosts([]);
          }
        } catch (error) {
          console.error('Error loading posts:', error);
          setUserPosts([]);
        } finally {
          setPostsLoading(false);
        }
      }
    };
    loadPosts();
  }, [profileUser?.id]);

  useEffect(() => {
    if (isOwnProfile && user) {
      loadReferralData();
    }
  }, [isOwnProfile, user]);

  const loadReferralData = async () => {
    try {
      const data = await getUserReferralData();
      setReferralData(data);
    } catch (error) {
      console.error('Error loading referral data:', error);
    }
  };



  if (loading) {
    return (
      <ThemedView style={dynamicStyles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={dynamicStyles.container}>
        <ThemedText>Error loading profile. Please try again.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.safeContainer}>
      {/* Settings and Logout buttons for own profile */}
      {isOwnProfile && (
        <View style={dynamicStyles.settingsButtonContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
            <Ionicons name="settings-outline" size={24} color={accentColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color={accentColor} />
          </TouchableOpacity>
        </View>
      )}

      <ThemedView style={dynamicStyles.container}>
        {/* Profile Header */}
        <View style={dynamicStyles.profileHeader}>
          <Image source={{ uri: profileUser.avatar }} style={dynamicStyles.avatar} />
          <ThemedText style={dynamicStyles.username}>{profileUser.username || '@you'}</ThemedText>
          <ThemedText style={dynamicStyles.bio}>
            Level {profileUser.level} • {profileUser.currentStreak || 0} day streak 🏆
          </ThemedText>

          {/* Stats Row */}
          <View style={dynamicStyles.statsContainer}>
            <View style={dynamicStyles.statItem}>
              <ThemedText style={dynamicStyles.statValue}>{userPosts.length}</ThemedText>
              <ThemedText style={dynamicStyles.statLabel}>Posts</ThemedText>
            </View>
            <View style={dynamicStyles.statItem}>
              <ThemedText style={dynamicStyles.statValue}>{profileUser.totalDaresCompleted || 0}</ThemedText>
              <ThemedText style={dynamicStyles.statLabel}>Dares</ThemedText>
            </View>
            <View style={dynamicStyles.statItem}>
              <ThemedText style={dynamicStyles.statValue}>{profileUser.wins || 0}</ThemedText>
              <ThemedText style={dynamicStyles.statLabel}>Wins</ThemedText>
            </View>
          </View>

          {/* Action Button */}
          {isOwnProfile ? (
            <TouchableOpacity style={dynamicStyles.editProfileButton} onPress={() => navigation.navigate('EditProfile')}>
              <ThemedText style={dynamicStyles.editProfileText}>Edit Profile</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={dynamicStyles.messageButton} onPress={() => navigation.navigate('Chat', { user: profileUser.username })}>
              <ThemedText style={dynamicStyles.messageText}>Message</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Navigation */}
        <View style={dynamicStyles.tabContainer}>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'posts' && dynamicStyles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons name="grid-outline" size={20} color={activeTab === 'posts' ? accentColor : '#888'} />
            <ThemedText style={[dynamicStyles.tabText, activeTab === 'posts' && dynamicStyles.activeTabText]}>
              Posts
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'dares' && dynamicStyles.activeTab]}
            onPress={() => setActiveTab('dares')}
          >
            <Ionicons name="flash-outline" size={20} color={activeTab === 'dares' ? accentColor : '#888'} />
            <ThemedText style={[dynamicStyles.tabText, activeTab === 'dares' && dynamicStyles.activeTabText]}>
              Dares
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        {activeTab === 'posts' ? (
          postsLoading ? (
            <View style={dynamicStyles.emptyContainer}>
              <ThemedText>Loading posts...</ThemedText>
            </View>
          ) : userPosts.length > 0 ? (
            <FlatList
              style={dynamicStyles.postsGrid}
              data={userPosts}
              keyExtractor={(item) => item.id}
              numColumns={3}
              renderItem={({ item }) => (
                <TouchableOpacity style={dynamicStyles.postItem} onPress={() => navigation.navigate('PostDetails', { post: item })}>
                  <Image source={{ uri: item.image || profileUser.avatar }} style={dynamicStyles.postImage} />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={dynamicStyles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color="#ccc" />
              <ThemedText style={dynamicStyles.emptyText}>No posts yet</ThemedText>
            </View>
          )
        ) : (
          // Dares view (simplified)
          <View style={dynamicStyles.postsGrid}>
            {userDares.length > 0 ? (
              userDares.slice(0, 9).map((dare) => (
                <TouchableOpacity
                  key={dare.id}
                  style={dynamicStyles.postItem}
                  onPress={() => navigation.navigate('DareDetails', { dare })}
                >
                  <View style={[dynamicStyles.postImage, { backgroundColor: accentColor, justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="flash" size={24} color="white" />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={dynamicStyles.emptyContainer}>
                <Ionicons name="flash-outline" size={64} color="#ccc" />
                <ThemedText style={dynamicStyles.emptyText}>No dares yet</ThemedText>
              </View>
            )}
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

// Helper functions
const getTimeAgo = (date) => {
  if (!date) return 'Unknown time';
  const now = new Date();
  const timeDiff = now - new Date(date);
  const minutes = Math.floor(timeDiff / 60000);
  const hours = Math.floor(timeDiff / 3600000);
  const days = Math.floor(timeDiff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const getActivityText = (activity) => {
  switch (activity.type) {
    case 'dare':
      return activity.winner ? `${activity.winner.username} beat ${activity.losers[0]?.username} in "${activity.title}"` : `Completed "${activity.title}"`;
    case 'post':
      return activity.text ? activity.text.substring(0, 50) + (activity.text.length > 50 ? '...' : '') : 'Posted something new';
    default:
      return 'Performed an action';
  }
};

const getDynamicStyles = (backgroundColor, cardColor, textColor, accentColor) => StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: backgroundColor },
  container: { flex: 1, backgroundColor: backgroundColor },
  settingsButtonContainer: { position: 'absolute', top: 10, right: 20, flexDirection: 'row', gap: 15, zIndex: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: backgroundColor
  },
  avatarHeader: { width: 40, height: 40, borderRadius: 20 },
  logo: { flex: 1, textAlign: 'center', fontSize: 24 },
  stones: {},
  stonesText: { fontSize: 16 },
  logout: { marginLeft: 10, color: accentColor },

  // Profile Header Section
  profileHeader: { alignItems: 'center', padding: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12, borderWidth: 2, borderColor: accentColor },
  username: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  bio: { fontSize: 14, textAlign: 'center', marginBottom: 12, color: textColor },

  // Stats Section
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 16 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: textColor },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },

  // Edit Profile Button
  editProfileButton: {
    backgroundColor: cardColor,
    borderRadius: 6,
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  editProfileText: { fontSize: 14, fontWeight: '600' },

  // Action Button for Others
  messageButton: {
    backgroundColor: accentColor,
    borderRadius: 6,
    paddingHorizontal: 32,
    paddingVertical: 8
  },
  messageText: { fontSize: 14, fontWeight: '600', color: 'white' },

  // Tab Navigation
  tabContainer: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: '#ddd', borderBottomWidth: 0.5, borderBottomColor: '#ddd', marginTop: 10 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  activeTab: { borderBottomWidth: 1, borderBottomColor: accentColor },
  tabText: { fontSize: 14, color: '#888' },
  activeTabText: { color: accentColor },

  // Post Grid
  postsGrid: { flex: 1 },
  postItem: { flex: 1, margin: 1 },
  postImage: { width: '100%', aspectRatio: 1 },

  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Legacy styles (keeping for compatibility)
  content: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    backgroundColor: backgroundColor
  },
  realAvatar: { width: 96, height: 96, borderRadius: 48, marginTop: 8, marginBottom: 10, borderWidth: 2, borderColor: accentColor },
  name: { fontSize: 20, fontWeight: "700" },
  meta: { marginTop: 4, marginBottom: 16 },
  block: { alignSelf: "stretch", backgroundColor: cardColor, borderRadius: 12, padding: 12, marginBottom: 12 },
  blockTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  actionButtons: { flexDirection: 'row', justifyContent: 'center', marginVertical: 16 },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: accentColor },
  actionText: { fontSize: 16, marginLeft: 8 },
  subtitle: { fontSize: 14, marginBottom: 8, color: '#888' },
  dareItem: { marginVertical: 4 },
  dareTitle: { fontSize: 14, fontWeight: '600' },
  dareMeta: { fontSize: 12, color: '#666' },
  viewMore: { fontSize: 12, color: accentColor, textAlign: 'center', marginTop: 8 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 },
  activityItem: { marginVertical: 4 },
  activityText: { fontSize: 14 },
  activityMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  settingItemLast: { borderBottomWidth: 0 },
  settingIcon: { fontSize: 20, marginRight: 12, color: accentColor },
  settingText: { flex: 1, fontSize: 16 },
  statsBlock: { alignSelf: "stretch", backgroundColor: cardColor, borderRadius: 12, padding: 12, marginBottom: 12 },
  statsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  stonesSummary: { fontSize: 14, textAlign: 'center' },
  mutualsText: { fontSize: 14, textAlign: 'center', color: '#666' },
  winRateText: { fontSize: 16, textAlign: 'center', fontWeight: 'bold', color: accentColor },
});
