import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Share, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, onSnapshot, collection } from 'firebase/firestore';
import Animated, { FadeInDown } from 'react-native-reanimated';

const ReferralScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [referrals, setReferrals] = useState({});
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSent: 0,
    successful: 0,
    totalEarnings: 0
  });
  const [referralEvents, setReferralEvents] = useState([]);
  const [milestones, setMilestones] = useState([
    { id: 'first_challenge', title: 'Create First Challenge', reward: 25, claimed: false },
    { id: 'first_dare', title: 'Complete First Dare', reward: 30, claimed: false },
    { id: 'second_referral', title: '2nd Friend Joins', reward: 15, claimed: false },
  ]);

  const functions = getFunctions();
  const db = getFirestore();

  useEffect(() => {
    if (user?.uid) {
      fetchReferralData();
      fetchReferralStats();
      subscribeToReferralEvents();
    }
  }, [user]);

  const fetchReferralData = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setReferrals(userData.referrals || {});
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const fetchReferralStats = async () => {
    try {
      // Aggregate from users who have your referral code
      const usersSnapshot = await getFirestore().collection('users').where('referralsUsed', 'array-contains', referrals.code).get();

      let successful = 0;
      let totalEarnings = 0;

      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        if (userData.referralEarnings) {
          successful++;
          totalEarnings += userData.referralEarnings;
        }
      });

      setStats(prev => ({
        ...prev,
        successful,
        totalEarnings
      }));
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const subscribeToReferralEvents = () => {
    if (!user?.uid) return;

    const eventsRef = collection(db, 'users', user.uid, 'referral_events');
    return onSnapshot(eventsRef, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toLocaleDateString() || 'Recent'
      }));
      setReferralEvents(events);
    });
  };

  const generateCode = async () => {
    setLoading(true);
    try {
      const generateReferralCode = httpsCallable(functions, 'generateReferralCode');
      const result = await generateReferralCode({});
      if (result.data.code) {
        setReferrals(prev => ({ ...prev, code: result.data.code }));
        Alert.alert('Success', `Your referral code: ${result.data.code}`);
      } else if (result.data.error) {
        Alert.alert('Error', result.data.error);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const shareReferral = async () => {
    if (!referrals.code) {
      Alert.alert('Error', 'Generate a referral code first');
      return;
    }

    const referralLink = `https://yourapp.com/referral/${referrals.code}`;
    try {
      await Share.share({
        message: `Join me on dare-social! Use my code ${referrals.code} for 10 bonus Stones! ${referralLink}`,
        url: referralLink,
      });
    } catch (error) {
      Alert.alert('Share', `Referral Code: ${referrals.code}`);
    }
  };

  const processReferralReward = async (eventType) => {
    if (!referrals.code) {
      Alert.alert('Error', 'No referral code found');
      return;
    }

    try {
      const processReferral = httpsCallable(functions, 'processReferralReward');
      const result = await processReferral({
        referralCode: referrals.code,
        eventType
      });

      if (result.data.success) {
        Alert.alert('Reward!', result.data.message);
        setStats(prev => ({
          ...prev,
          totalEarnings: prev.totalEarnings + result.data.rewardAmount
        }));
        // Update milestone as claimed
        setMilestones(prev => prev.map(m =>
          m.id === eventType ? { ...m, claimed: true } : m
        ));
      } else {
        Alert.alert('Error', result.data.error);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderReferralEvent = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(300)} style={styles.eventItem}>
      <Text style={styles.eventType}>{item.eventType || 'Referral'}</Text>
      <Text style={styles.eventUser}>{item.referredUserId ? `User: ${item.referredUserId.slice(0, 8)}...` : 'New user joined'}</Text>
      <Text style={[styles.eventReward, { color: '#00D4AA' }]}>
        +{item.rewardAmount || item.earnings || 0} Stones
      </Text>
      <Text style={styles.eventDate}>{item.timestamp}</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referrals</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Your Earned Stones</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.successful}</Text>
            <Text style={styles.statLabel}>Friends Joined</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.totalEarnings}</Text>
            <Text style={styles.statLabel}>Bonus Stones</Text>
          </View>
        </View>
      </View>

      {/* Referral Code Section */}
      <View style={styles.codeSection}>
        <Text style={styles.sectionTitle}>Your Referral Code</Text>
        {referrals.code ? (
          <>
            <View style={styles.codeDisplay}>
              <Text style={styles.codeText}>{referrals.code}</Text>
              <TouchableOpacity style={styles.shareButton} onPress={shareReferral}>
                <Ionicons name="share-outline" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.codeInfo}>
              Share this code! Friends get 10 Stones, you earn up to 65 more as they progress!
            </Text>
          </>
        ) : (
          <TouchableOpacity style={styles.generateButton} onPress={generateCode} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="#000" />
                <Text style={styles.generateText}>Get Your Code</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Reward Milestones */}
      <View style={styles.milestonesSection}>
        <Text style={styles.sectionTitle}>Claim Milestone Rewards</Text>
        <FlatList
          data={milestones}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.milestoneItem, item.claimed && styles.claimedItem]}
              onPress={() => !item.claimed && processReferralReward(item.id)}
              disabled={item.claimed}
            >
              <Text style={[styles.milestoneTitle, item.claimed && styles.claimedText]}>{item.title}</Text>
              <View style={styles.milestoneRewardContainer}>
                <Text style={[styles.milestoneReward, item.claimed && styles.claimedText]}>+{item.reward} Stones</Text>
                {item.claimed && <Ionicons name="checkmark-circle" size={20} color="#00D4AA" />}
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Referral History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <FlatList
          data={referralEvents}
          renderItem={renderReferralEvent}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.noHistory}>No referral activity yet. Share your code to start earning!</Text>}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#111' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  statsHeader: { padding: 20, backgroundColor: '#111', alignItems: 'center' },
  statsTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  statBox: { alignItems: 'center' },
  statNumber: { color: '#00D4AA', fontSize: 32, fontWeight: 'bold' },
  statLabel: { color: '#AAA', fontSize: 14, marginTop: 4 },
  codeSection: { padding: 20 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  codeDisplay: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', padding: 20, borderRadius: 12, marginBottom: 12 },
  codeText: { flex: 1, color: '#00D4AA', fontSize: 28, fontWeight: 'bold', letterSpacing: 4 },
  shareButton: { backgroundColor: '#00D4AA', borderRadius: 24, padding: 12, marginLeft: 15 },
  codeInfo: { color: '#AAA', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  generateButton: { flexDirection: 'row', backgroundColor: '#00D4AA', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  generateText: { color: '#000', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  milestonesSection: { paddingHorizontal: 20, marginBottom: 5 },
  milestoneItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#222', padding: 16, borderRadius: 12, marginBottom: 10 },
  milestoneTitle: { color: '#FFF', flex: 1, fontSize: 16 },
  milestoneRewardContainer: { flexDirection: 'row', alignItems: 'center' },
  milestoneReward: { color: '#00D4AA', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  claimedItem: { opacity: 0.6, backgroundColor: '#333' },
  claimedText: { textDecorationLine: 'line-through', color: '#AAA' },
  historySection: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  eventItem: { backgroundColor: '#111', padding: 15, borderRadius: 12, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#00D4AA' },
  eventType: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  eventUser: { color: '#CCC', fontSize: 14, marginTop: 4 },
  eventReward: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  eventDate: { color: '#666', fontSize: 12, marginTop: 4 },
  noHistory: { color: '#666', textAlign: 'center', padding: 40, fontSize: 16 },
});

export default ReferralScreen;
