import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { useThemeColor } from '../../hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
// import { useAuth } from '../context/AuthContext'; // Not needed for now

// Dummy data for achievements - in real app this would come from API
const mockAchievements = [
  {
    id: '1',
    title: 'Won $20 Blackjack Dare',
    reward: '+15',
    rewardColor: '#00D4AA',
    user1: '@willsamrick',
    user2: '@frankvecchie',
    avatars: ['https://randomuser.me/api/portraits/men/1.jpg', 'https://randomuser.me/api/portraits/men/2.jpg'],
    icons: ['○ 25', '✖', '...', '○ 25'],
    timestamp: '03:08 PM EDT, Oct 17, 2025',
    result: 'Won',
    action: 'Post',
    type: 'win'
  },
  {
    id: '2',
    title: 'Lost $5 Dice Roll',
    reward: '-5',
    rewardColor: '#FF6666',
    user1: '@willsamrick',
    user2: '@brendengroess',
    avatars: ['https://randomuser.me/api/portraits/men/1.jpg', 'https://randomuser.me/api/portraits/men/4.jpg'],
    icons: ['▶', '...', '✖', '▶'],
    timestamp: '02:15 PM EDT, Oct 17, 2025',
    result: 'Lost',
    action: 'Add Proof',
    type: 'loss'
  },
  {
    id: '3',
    title: 'Won $10 Rock Paper Scissors',
    reward: '+20',
    rewardColor: '#00D4AA',
    user1: '@willsamrick',
    user2: '@mattbraun',
    avatars: ['https://randomuser.me/api/portraits/men/1.jpg', 'https://randomuser.me/api/portraits/men/3.jpg'],
    icons: ['▶', '...', '✖', '▶'],
    timestamp: '01:30 PM EDT, Oct 17, 2025',
    result: 'Won',
    action: 'Post',
    type: 'win'
  },
];

export default function AchievementScreen({ navigation }) {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');

  const dynamicStyles = getDynamicStyles(backgroundColor, cardColor, textColor, accentColor, borderColor);

  const [achievements, setAchievements] = useState(mockAchievements);

  // In a real app, you would fetch achievements from API
  useEffect(() => {
    // fetchAchievements();
  }, []);

  const handleClaimReward = () => {
    // Handle claiming reward logic
    console.log('Claim reward pressed');
  };

  const renderAchievementCard = ({ item }) => (
    <View style={[dynamicStyles.dareCard, { borderColor: item.rewardColor }]}>
      {/* Title */}
      <ThemedText style={dynamicStyles.dareTitle}>{item.title}</ThemedText>

      {/* User Row */}
      <View style={dynamicStyles.userRow}>
        <ThemedText style={dynamicStyles.username}>{item.user1}</ThemedText>
        {item.avatars.map((avatar, index) => (
          <Image key={index} source={{ uri: avatar }} style={dynamicStyles.avatar} />
        ))}
        <ThemedText style={dynamicStyles.username}>{item.user2}</ThemedText>
      </View>

      {/* Icons Row */}
      <View style={dynamicStyles.iconsRow}>
        {item.icons.map((icon, index) => (
          <ThemedText key={index} style={dynamicStyles.icon}>{icon}</ThemedText>
        ))}
      </View>

      {/* Result */}
      <ThemedText style={[dynamicStyles.result, { color: item.rewardColor === '#00D4AA' ? '#00D4AA' : '#FF6666' }]}>{item.result}</ThemedText>

      {/* Action Button */}
      <TouchableOpacity style={dynamicStyles.actionButton}>
        <ThemedText style={dynamicStyles.actionText}>{item.action}</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerContent}>
          <Ionicons name="trophy" size={24} color="#FFD700" style={dynamicStyles.trophyIcon} />
          <ThemedText style={dynamicStyles.title}>Dare Results</ThemedText>
        </View>
      </View>

      {/* Achievement Cards List */}
      <ScrollView
        style={dynamicStyles.scrollContainer}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={achievements}
          keyExtractor={(item) => item.id}
          renderItem={renderAchievementCard}
          scrollEnabled={false}
          contentContainerStyle={dynamicStyles.cardsList}
        />
      </ScrollView>

      {/* Footer */}
      <View style={dynamicStyles.footer}>
        <TouchableOpacity
          style={dynamicStyles.claimButton}
          onPress={handleClaimReward}
        >
          <ThemedText style={dynamicStyles.claimButtonText}>Claim Reward</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const getDynamicStyles = (backgroundColor, cardColor, textColor, accentColor, borderColor) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#222222',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  trophyIcon: {
    marginRight: 12,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Montserrat-Bold', // Assuming Montserrat is available
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
  },
  cardsList: {
    paddingBottom: 80, // Space for footer
  },
  // Dare Card styles (matching ActivityFeed)
  dareCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dareTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 22,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12
  },
  username: { color: '#CCCCCC', fontSize: 14, fontWeight: '500' },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#00D4AA',
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
    backgroundColor: '#111111',
    borderRadius: 10,
    padding: 12,
  },
  icon: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
  result: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 12 },
  actionButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
    alignSelf: 'center',
    minWidth: 110,
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  actionText: {
    color: '#000000',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  footer: {
    backgroundColor: '#222222',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  claimButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
});
