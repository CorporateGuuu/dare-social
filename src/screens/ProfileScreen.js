import { useContext, useState, useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, Pressable, Animated, TextInput, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useAnimations } from '../hooks/useAnimations';
import { generateReferralCode, redeemReferralCode, getUserReferralData, checkReferralCodeValidity } from '../services/referralService';

export default function Current_User_Account(props) {
  const { navigation, route } = props;
  const { user, logout, loading } = useContext(AuthContext);
  const { messageScale, handlePressIn, handlePressOut } = useAnimations();
  const [referralData, setReferralData] = useState({});

  const profileUser = route.params?.user || user;
  const isOwnProfile = !route.params?.user;

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
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Error loading profile. Please try again.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: profileUser.avatar }} style={styles.avatarHeader} />
        <Text style={styles.logo}>{isOwnProfile ? '▲' : profileUser.username || '@user'}</Text>
        {isOwnProfile && (
          <View style={styles.stones}>
            <Text style={styles.stonesText}>∘ {profileUser.stones}</Text>
          </View>
        )}
        {isOwnProfile && (
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Rest of the screen */}
      <View style={styles.content}>
        <Image source={{ uri: profileUser.avatar }} style={styles.realAvatar} />
        <Text style={styles.name}>{profileUser.username || '@you'}</Text>
        <Text style={styles.meta}>Stone: {profileUser.stones} 🪨  •  Level: {profileUser.level}  •  Streak: {profileUser.currentStreak}  •  Completed: {profileUser.totalDaresCompleted}</Text>

        {!isOwnProfile && (
          <View style={styles.actionButtons}>
            <Pressable
              onPressIn={() => handlePressIn(messageScale)}
              onPressOut={() => handlePressOut(messageScale)}
              onPress={() => navigation.navigate('Chat', { user: profileUser.username })}
            >
              <Animated.View style={[styles.actionButton, styles.messageButton, { transform: [{ scale: messageScale }] }]}>
                <Ionicons name="chatbubble-outline" size={20} color="#000" />
                <Text style={styles.actionText}>Message</Text>
              </Animated.View>
            </Pressable>
          </View>
        )}

        {isOwnProfile && (
          <Pressable onPress={() => navigation.navigate('Referrals')} style={styles.block}>
            <Text style={styles.blockTitle}>Referrals 🎁</Text>
            <Text>
              Tap to view referral details and share your code
            </Text>
          </Pressable>
        )}

        <View style={styles.block}><Text>{isOwnProfile ? 'My Dares (placeholder)' : 'Their Dares (placeholder)'}</Text></View>
        <View style={styles.block}><Text>Activity (placeholder)</Text></View>
        <View style={styles.block}><Text>{isOwnProfile ? 'Settings (placeholder)' : ''}</Text></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  avatarHeader: { width: 40, height: 40, borderRadius: 20 },
  logo: { flex: 1, textAlign: 'center', fontSize: 24 },
  stones: {},
  stonesText: { fontSize: 16 },
  logout: { color: 'white', marginLeft: 10 },
  content: { flex: 1, backgroundColor: "#fff", padding: 16, alignItems: "center" },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#eee", marginTop: 8, marginBottom: 10 },
  realAvatar: { width: 96, height: 96, borderRadius: 48, marginTop: 8, marginBottom: 10, borderWidth: 2, borderColor: '#ddd' },
  name: { fontSize: 20, fontWeight: "700" },
  meta: { color: "#666", marginTop: 4, marginBottom: 16 },
  block: { alignSelf: "stretch", backgroundColor: "#f4f4f4", borderRadius: 12, padding: 12, marginBottom: 12 },
  blockTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  referralControls: { marginTop: 12, gap: 12 },
  referralButton: { backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center' },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: 'white' },
  actionButtons: { flexDirection: 'row', justifyContent: 'center', marginVertical: 16 },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: '#ddd' },
  messageButton: { backgroundColor: '#f0f0f0' },
  actionText: { fontSize: 16, marginLeft: 8, color: '#000' },
});
