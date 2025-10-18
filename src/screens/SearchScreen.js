import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemedView } from '../../components/themed-view';
import { useThemeColor } from '../../hooks/use-theme-color';

// Sample screen data - includes all available screens/pages in the app
const AVAILABLE_SCREENS = [
  { name: 'HomeFeed', label: 'Home Feed', description: 'View your feed' },
  { name: 'Leaderboard', label: 'Leaderboard', description: 'See top performers' },
  { name: 'Profile', label: 'Profile', description: 'Your profile' },
  { name: 'Wallet', label: 'Wallet', description: 'Manage your wallet' },
  { name: 'Create_Challenge_Home', label: 'Create Challenge', description: 'Create a new challenge' },
  { name: 'Search', label: 'Search', description: 'Search for screens' },
  { name: 'Challenges', label: 'Challenges', description: 'Browse challenges' },
  { name: 'DareDetails', label: 'Dare Details', description: 'View dare details' },
  { name: 'CompleteDare', label: 'Complete Dare', description: 'Complete a dare' },
  { name: 'Chat', label: 'Chat', description: 'Chat with others' },
  { name: 'Vote', label: 'Vote', description: 'Vote on challenges' },
  { name: 'Frame_Market', label: 'Frame Market', description: 'Browse frame market' },
  { name: 'Achievements', label: 'Achievements', description: 'View achievements' },
  { name: 'Winner', label: 'Winner', description: 'View winners' },
  { name: 'Tracker', label: 'Tracker', description: 'Track your progress' },
  { name: 'CreateChallengeForm', label: 'Create Challenge Form', description: 'Form for creating challenges' },
  { name: 'Login', label: 'Login', description: 'Login screen' },
  { name: 'Posts', label: 'Posts', description: 'Create and view posts' },
  { name: 'Onboarding', label: 'Onboarding', description: 'Get started' },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredScreens, setFilteredScreens] = useState(AVAILABLE_SCREENS);
  const navigation = useNavigation();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = AVAILABLE_SCREENS.filter(screen =>
      screen.label.toLowerCase().includes(query.toLowerCase()) ||
      screen.description.toLowerCase().includes(query.toLowerCase()) ||
      screen.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredScreens(filtered);
  };

  const navigateToScreen = (screenName) => {
    // Define tab screens for special navigation handling
    const tabScreens = ['HomeFeed', 'Create_Challenge_Home', 'Leaderboard', 'Wallet', 'Profile', 'Search'];

    // Map screen names to their actual StackNavigator screen names
    const screenMap = {
      'Chat': 'ChatScreen',
      'Vote': 'VoteScreen',
      'Frame_Market': 'Frame_Market',
      'Achievements': 'AchievementsScreen',
      'Winner': 'WinnerScreen',
      'Login': 'LoginScreen',
      'CreateChallengeForm': 'CreateChallengeForm',
      'Tracker': 'Tracker',
      'Onboarding': 'Onboarding',
      'Challenges': 'Challenges',
      'DareDetails': 'DareDetails',
      'CompleteDare': 'CompleteDare',
      'Create_Challenge_Home': 'CreateChallenge', // Matches the Stack.Screen name
    };

    const targetScreen = screenMap[screenName] || screenName;

    if (tabScreens.includes(screenName)) {
      // Switch to a different tab within the MainTabs
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            state: {
              routes: [
                {
                  name: screenName,
                },
              ],
            },
          },
        ],
      });
    } else {
      // Navigate to a stack screen
      navigation.navigate(targetScreen);
    }
  };

  const renderScreenItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.screenItem, { borderBottomColor: borderColor }]}
      onPress={() => navigateToScreen(item.name)}
    >
      <View style={styles.screenInfo}>
        <Text style={[styles.screenLabel, { color: textColor }]}>{item.label}</Text>
        <Text style={[styles.screenDescription, { color: textColor }]}>{item.description}</Text>
      </View>
      <Text style={[styles.arrow, { color: borderColor }]}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <TextInput
        style={[styles.searchInput, { backgroundColor, color: textColor, borderColor }]}
        placeholder="Search for screens..."
        placeholderTextColor={textColor}
        value={searchQuery}
        onChangeText={handleSearch}
        autoFocus={true}
      />
      <FlatList
        data={filteredScreens}
        keyExtractor={(item) => item.name}
        renderItem={renderScreenItem}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  screenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  screenInfo: {
    flex: 1,
  },
  screenLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  screenDescription: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 20,
  },
});
