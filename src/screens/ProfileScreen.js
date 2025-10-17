import { useContext, useState, useEffect } from "react";
import { Image, StyleSheet, TouchableOpacity, View, Pressable, Animated, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useAnimations } from '../hooks/useAnimations';
import { generateReferralCode, redeemReferralCode, getUserReferralData, checkReferralCodeValidity } from '../services/referralService';
import { useThemeColor } from '../../hooks/use-theme-color';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { useDares } from '../hooks/useDares';
import { useUserActivities } from '../hooks/useUserActivities';

export default function ProfileScreen(props) {
  const { navigation, route } = props;
  const { user, logout, loading } = useContext(AuthContext);
  const { messageScale, handlePressIn, handlePressOut } = useAnimations();
  const [referralData, setReferralData] = useState({});

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');

  const dynamicStyles = getDynamicStyles(backgroundColor, cardColor, textColor, accentColor);

  const profileUser = route.params?.user || user;
  const isOwnProfile = !route.params?.user;

  // Hook calls for profile sections
  const { dares } = useDares();
  const { activities, loading: activitiesLoading } = useUserActivities(profileUser?.id || user?.id, 3);

  // Filter user's dares (assuming dares from useDares are all dares, filter by creator or participants)
  const userDares = isOwnProfile ? dares.filter(dare => dare.creatorId === user?.id || dare.participants.includes(user?.id)) : [];

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
    <ThemedView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Image source={{ uri: profileUser.avatar }} style={dynamicStyles.avatarHeader} />
        <ThemedText style={dynamicStyles.logo}>{isOwnProfile ? '▲' : profileUser.username || '@user'}</ThemedText>
        {isOwnProfile && (
          <View style={dynamicStyles.stones}>
            <ThemedText style={dynamicStyles.stonesText}>∘ {profileUser.stones}</ThemedText>
          </View>
        )}
        {isOwnProfile && (
          <TouchableOpacity onPress={logout}>
            <ThemedText style={dynamicStyles.logout}>Logout</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <ThemedView style={dynamicStyles.content}>
        <Image source={{ uri: profileUser.avatar }} style={dynamicStyles.realAvatar} />
        <ThemedText style={dynamicStyles.name}>{profileUser.username || '@you'}</ThemedText>
        <ThemedText style={dynamicStyles.meta}>Stone: {profileUser.stones} 🪨  •  Level: {profileUser.level}  •  Streak: {profileUser.currentStreak}  •  Completed: {profileUser.totalDaresCompleted}</ThemedText>

        {!isOwnProfile && (
          <View style={dynamicStyles.actionButtons}>
            <Pressable
              onPressIn={() => handlePressIn(messageScale)}
              onPressOut={() => handlePressOut(messageScale)}
              onPress={() => navigation.navigate('Chat', { user: profileUser.username })}
            >
              <Animated.View style={[dynamicStyles.actionButton, dynamicStyles.messageButton, { transform: [{ scale: messageScale }] }]}>
                <Ionicons name="chatbubble-outline" size={20} color={textColor} />
                <ThemedText style={dynamicStyles.actionText}>Message</ThemedText>
              </Animated.View>
            </Pressable>
          </View>
        )}

        {isOwnProfile && (
          <Pressable onPress={() => navigation.navigate('Referrals')} style={dynamicStyles.block}>
            <ThemedText style={dynamicStyles.blockTitle}>Referrals 🎁</ThemedText>
            <ThemedText>Tap to view referral details and share your code</ThemedText>
          </Pressable>
        )}

        {/* My Dares Section */}
        <Pressable
          onPress={() => isOwnProfile && navigation.navigate('MyDares')}
          style={[dynamicStyles.block, !isOwnProfile && { pressable: false }]}
          disabled={!isOwnProfile}
        >
          <ThemedText style={dynamicStyles.blockTitle}>
            {isOwnProfile ? 'My Dares' : 'Their Dares'} ⚡
          </ThemedText>
          {userDares.length > 0 ? (
            <>
              <ThemedText style={dynamicStyles.subtitle}>{userDares.length} active dares</ThemedText>
              {userDares.slice(0, 2).map((dare) => (
                <TouchableOpacity
                  key={dare.id}
                  onPress={() => navigation.navigate('DareDetails', { dare })}
                  style={dynamicStyles.dareItem}
                >
                  <ThemedText style={dynamicStyles.dareTitle}>{dare.title}</ThemedText>
                  <ThemedText style={dynamicStyles.dareMeta}>
                    {dare.wagerType === 'none' ? 'Practice' : `${dare.wagerAmount} stone${dare.wagerAmount > 1 ? 's' : ''}`} • {dare.status}
                  </ThemedText>
                </TouchableOpacity>
              ))}
              {userDares.length > 2 && (
                <ThemedText style={dynamicStyles.viewMore}>Tap to view all...</ThemedText>
              )}
            </>
          ) : (
            <ThemedText style={dynamicStyles.emptyText}>No active dares yet</ThemedText>
          )}
        </Pressable>
        {/* Activity Section */}
        <Pressable
          onPress={() => navigation.navigate('ActivityFeed')}
          style={dynamicStyles.block}
        >
          <ThemedText style={dynamicStyles.blockTitle}>Recent Activity 📈</ThemedText>
          {activitiesLoading ? (
            <ThemedText style={dynamicStyles.emptyText}>Loading activities...</ThemedText>
          ) : activities.length > 0 ? (
            <>
              {activities.slice(0, 2).map((activity) => {
                const timeAgo = activity.createdAt ? getTimeAgo(activity.createdAt) : 'Unknown time';
                return (
                  <View key={activity.id} style={dynamicStyles.activityItem}>
                    <ThemedText style={dynamicStyles.activityText}>
                      {getActivityText(activity)}
                    </ThemedText>
                    <ThemedText style={dynamicStyles.activityMeta}>
                      {timeAgo}
                    </ThemedText>
                  </View>
                );
              })}
              <ThemedText style={dynamicStyles.viewMore}>Tap to view all activity...</ThemedText>
            </>
          ) : (
            <ThemedText style={dynamicStyles.emptyText}>No recent activity</ThemedText>
          )}
        </Pressable>
        {/* Settings Section */}
        {isOwnProfile && (
          <ThemedView style={dynamicStyles.block}>
            <ThemedText style={dynamicStyles.blockTitle}>Settings ⚙️</ThemedText>
            <TouchableOpacity style={dynamicStyles.settingItem} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="person-outline" size={20} color={accentColor} style={dynamicStyles.settingIcon} />
              <ThemedText style={dynamicStyles.settingText}>Edit Profile</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.settingItem} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={20} color={accentColor} style={dynamicStyles.settingIcon} />
              <ThemedText style={dynamicStyles.settingText}>Notifications</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.settingItem} onPress={() => navigation.navigate('Privacy')}>
              <Ionicons name="lock-closed-outline" size={20} color={accentColor} style={dynamicStyles.settingIcon} />
              <ThemedText style={dynamicStyles.settingText}>Privacy & Security</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.settingItem} onPress={() => navigation.navigate('Wallet')}>
              <Ionicons name="wallet-outline" size={20} color={accentColor} style={dynamicStyles.settingIcon} />
              <ThemedText style={dynamicStyles.settingText}>Wallet</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={[dynamicStyles.settingItem, dynamicStyles.settingItemLast]} onPress={() => navigation.navigate('Help')}>
              <Ionicons name="help-circle-outline" size={20} color={accentColor} style={dynamicStyles.settingIcon} />
              <ThemedText style={dynamicStyles.settingText}>Help & Support</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Array.isArray(backgroundColor) ? backgroundColor[0] : backgroundColor
  },
  avatarHeader: { width: 40, height: 40, borderRadius: 20 },
  logo: { flex: 1, textAlign: 'center', fontSize: 24 },
  stones: {},
  stonesText: { fontSize: 16 },
  logout: { marginLeft: 10, color: accentColor },
  content: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    backgroundColor: Array.isArray(backgroundColor) ? backgroundColor[0] : backgroundColor
  },
  realAvatar: { width: 96, height: 96, borderRadius: 48, marginTop: 8, marginBottom: 10, borderWidth: 2, borderColor: accentColor },
  name: { fontSize: 20, fontWeight: "700" },
  meta: { marginTop: 4, marginBottom: 16 },
  block: { alignSelf: "stretch", backgroundColor: cardColor, borderRadius: 12, padding: 12, marginBottom: 12 },
  blockTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  actionButtons: { flexDirection: 'row', justifyContent: 'center', marginVertical: 16 },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: accentColor },
  messageButton: { backgroundColor: cardColor },
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
});
