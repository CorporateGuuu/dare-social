// screens/WalletScreen.js - Updated with login reward info
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppContext } from '../context/AppContext';
import Icon from '@expo/vector-icons/Ionicons';

const WalletScreen = ({ navigation }) => {
  const { stones, transactions, loginStreak, setUserData } = useContext(AppContext); // Add loginStreak, setUserData
  const [loading, setLoading] = useState(true);
  const [rewardMessage, setRewardMessage] = useState('');

  useEffect(() => {
    // Mock fetch; replace with Firestore listener
    const fetchData = async () => {
      setTimeout(() => {
        setLoading(false);
        // Simulate login update to trigger reward
        setUserData({ lastLogin: new Date() }); // Trigger Cloud Function
      }, 500);
    };
    fetchData();
  }, [setUserData]);

  useEffect(() => {
    if (loginStreak?.currentStreak > 0) {
      setRewardMessage(`Current Streak: ${loginStreak.currentStreak} days!`);
    }
  }, [loginStreak]);

  const renderTransaction = ({ item }) => {
    let icon = '';
    let typeLabel = '';

    switch (item.type) {
      case 'post_earn':
        icon = '📝';
        typeLabel = 'Post Reward';
        break;
      // ... other types
    }

    return (
      <Animated.View style={styles.transactionItem}>
        <Text style={styles.transIcon}>{icon}</Text>
        <View style={styles.transInfo}>
          <Text style={styles.transType}>{typeLabel}</Text>
          <Text style={styles.transDesc}>{item.description}</Text>
        </View>
        <Text style={[styles.transAmount, { color: item.amount > 0 ? '#00D4AA' : '#FF6666' }]}>
          {item.amount} Stones
        </Text>
      </Animated.View>
    );
  };

  if (loading) return <ActivityIndicator style={styles.loader} color="#00D4AA" />;

  return (
    <View style={styles.container}>
      {/* Balance Header */}
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>Your Stones Balance</Text>
        <Text style={styles.balanceAmount}>{stones}</Text>
        <TouchableOpacity style={styles.buyButton} onPress={() => Alert.alert('Buy Stones', 'Integrate payment gateway')}>
          <Icon name="wallet-outline" size={20} color="#000" />
          <Text style={styles.buyText}>Buy More</Text>
        </TouchableOpacity>
      </View>

      {/* Login Reward Section */}
      <View style={styles.rewardSection}>
        <Text style={styles.sectionTitle}>Daily Login Rewards</Text>
        {rewardMessage && <Text style={styles.rewardMessage}>{rewardMessage}</Text>}
        <Text style={styles.rewardInfo}>
          Log in daily to earn 5 Stones + up to 14 bonus Stones (max streak: 7 days)!
        </Text>
        <Text style={styles.streakInfo}>
          Max Streak: {loginStreak?.maxStreak || 0} days | Total Logins: {loginStreak?.totalLogins || 0}
        </Text>
      </View>

      {/* Earning Mechanics */}
      <View style={styles.earningSection}>
        <Text style={styles.sectionTitle}>Earn More Stones</Text>
        <TouchableOpacity style={styles.earnButton} onPress={() => navigation.navigate('Dares')}>
          <Text>Complete Dares</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.earnButton} onPress={() => navigation.navigate('SponsoredDares')}>
          <Text>Sponsored Challenges</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.earnButton} onPress={() => navigation.navigate('Referrals')}>
          <Text>Refer Friends</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction History */}
      <Text style={styles.sectionTitle}>Transaction History</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noTrans}>No transactions yet</Text>}
      />

      {/* Leaderboard Link */}
      <TouchableOpacity style={styles.leaderboardButton} onPress={() => navigation.navigate('Leaderboard')}>
        <Text style={styles.leaderboardText}>View Stone Leaderboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  balanceHeader: { alignItems: 'center', padding: 20, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#333' },
  balanceLabel: { color: '#AAA', fontSize: 14 },
  balanceAmount: { color: '#00D4AA', fontSize: 36, fontWeight: 'bold' },
  buyButton: { flexDirection: 'row', backgroundColor: '#00D4AA', padding: 10, borderRadius: 20, marginTop: 10 },
  buyText: { color: '#000', marginLeft: 5 },
  earningSection: { padding: 20 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  earnButton: { backgroundColor: '#222', padding: 15, borderRadius: 12, marginBottom: 10 },
  transactionItem: { backgroundColor: '#111', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  transIcon: { fontSize: 20, marginRight: 10 },
  transInfo: { flex: 1 },
  transType: { color: '#FFF', fontWeight: '600' },
  transAmount: { fontSize: 16 },
  transDesc: { color: '#AAA' },
  transTime: { color: '#666', fontSize: 12 },
  noTrans: { color: '#666', textAlign: 'center' },
  leaderboardButton: { backgroundColor: '#00D4AA', padding: 15, borderRadius: 12, margin: 20, alignItems: 'center' },
  leaderboardText: { color: '#000', fontWeight: 'bold' },
  loader: { flex: 1, justifyContent: 'center' },
  rewardSection: { padding: 20, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#333' },
  rewardMessage: { color: '#00D4AA', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  rewardInfo: { color: '#AAA', fontSize: 14, textAlign: 'center', marginBottom: 10 },
  streakInfo: { color: '#666', fontSize: 12, textAlign: 'center' },
});

export default WalletScreen;
