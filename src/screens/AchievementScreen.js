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
    avatars: [null, null, null], // Placeholder avatars
    proofImage: 'https://via.placeholder.com/200x100?text=Blackjack+Proof',
    timestamp: '03:08 PM EDT, Oct 17, 2025',
    type: 'win'
  },
  {
    id: '2',
    title: 'Lost $5 Dice Roll',
    reward: '-5',
    rewardColor: '#FF6666',
    avatars: [null, null, null], // Placeholder avatars
    proofImage: 'https://via.placeholder.com/200x100?text=Dice+Proof',
    timestamp: '02:15 PM EDT, Oct 17, 2025',
    type: 'loss'
  },
  {
    id: '3',
    title: 'Won $10 Rock Paper Scissors',
    reward: '+20',
    rewardColor: '#00D4AA',
    avatars: [null, null, null], // Placeholder avatars
    proofImage: 'https://via.placeholder.com/200x100?text=RPS+Proof',
    timestamp: '01:30 PM EDT, Oct 17, 2025',
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
    <View style={dynamicStyles.card}>
      {/* Title */}
      <ThemedText style={dynamicStyles.cardTitle}>{item.title}</ThemedText>

      {/* Avatars */}
      <View style={dynamicStyles.avatarContainer}>
        {item.avatars.map((avatar, index) => (
          <View key={index} style={[dynamicStyles.avatar, { backgroundColor: accentColor }]} />
        ))}
      </View>

      {/* Reward Circle */}
      <View style={[dynamicStyles.rewardCircle, { backgroundColor: item.rewardColor }]}>
        <ThemedText style={dynamicStyles.rewardText}>{item.reward}</ThemedText>
      </View>

      {/* Proof Image */}
      <Image
        source={{ uri: item.proofImage }}
        style={dynamicStyles.proofImage}
        resizeMode="cover"
      />

      {/* Timestamp */}
      <ThemedText style={dynamicStyles.timestamp}>{item.timestamp}</ThemedText>
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
    backgroundColor: backgroundColor,
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
  card: {
    backgroundColor: '#222222',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16,
    marginBottom: 12,
    width: '100%',
  },
  cardTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 12,
    fontFamily: 'Montserrat-Medium',
  },
  avatarContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 2,
    borderColor: accentColor,
  },
  rewardCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
    top: 16,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
  },
  proofImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'left',
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
