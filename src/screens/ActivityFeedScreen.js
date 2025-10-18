import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ScrollView, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import Icon from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const initialDares = [
  { id: '1', title: 'The Kings will be better than the Bulls this season', user1: '@willsamrick', user2: '@frankvecchie', icons: ['○ 25', '✖', '...', '○ 25'], status: 'Pending', borderColor: '#FF0000' },
  { id: '2', title: 'The Kings will be better than the Bulls this season', user1: '@willsamrick', user2: '@frankvecchie', icons: ['○ 25', '✖', '...', '○ 25'], status: 'Pending', borderColor: '#FF0000' },
  { id: '3', title: 'I will run a marathon', user1: '@willsamrick', user2: '@frankvecchie', icons: ['▶', '✖', '...', '○ 25'], status: 'Pending', borderColor: '#FF0000' },
  { id: '4', title: 'The Kings will be better than the Bulls this season', user1: '@willsamrick', user2: '@mattbraun', icons: ['▶', '...', '✖', '▶'], result: 'Won', action: 'Post', borderColor: '#00D4AA' },
  { id: '5', title: 'Bitcoin will not reach $110,000', user1: '@willsamrick', user2: '@brendengroess', icons: ['▶', '...', '✖', '▶'], result: 'Lost', action: 'Add Proof', borderColor: '#FF6666' },
  { id: '6', title: 'Bitcoin will not reach $110,000', user1: '@willsamrick', user2: '@brendengroess', icons: ['▶', '...', '✖', '▶'], result: 'Lost', action: 'Add Proof', borderColor: '#FF6666' },
];

// Simulated additional dares for infinite scroll
const additionalDares = [
  { id: '7', title: 'I will finish a coding project', user1: '@willsamrick', user2: '@johndoe', icons: ['○ 50', '✖', '...', '○ 50'], status: 'Pending', borderColor: '#FF0000' },
  { id: '8', title: 'Rain will fall tomorrow', user1: '@willsamrick', user2: '@janedoe', icons: ['▶', '...', '✖', '▶'], result: 'Won', action: 'Post', borderColor: '#00D4AA' },
  { id: '9', title: 'Stock market will rise', user1: '@willsamrick', user2: '@bobsmith', icons: ['▶', '...', '✖', '▶'], result: 'Lost', action: 'Add Proof', borderColor: '#FF6666' },
];

const stories = [
  { id: '1', user: '@willsamrick', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: '2', user: '@frankvecchie', image: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: '3', user: '@mattbraun', image: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: '4', user: '@brendengroess', image: 'https://randomuser.me/api/portraits/men/4.jpg' },
];

const DareCard = ({ dare }) => (
  <View style={[styles.dareCard, { borderColor: dare.borderColor }]}>
    <Text style={styles.dareTitle}>{dare.title}</Text>
    <View style={styles.userRow}>
      <Text style={styles.username}>{dare.user1}</Text>
      <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
      <Image source={{ uri: 'https://randomuser.me/api/portraits/men/2.jpg' }} style={styles.avatar} />
      <Text style={styles.username}>{dare.user2}</Text>
    </View>
    <View style={styles.iconsRow}>
      {dare.icons.map((icon, index) => (
        <Text key={index} style={styles.icon}>{icon}</Text>
      ))}
    </View>
    {dare.status ? (
      <Text style={[styles.status, { color: dare.borderColor }]}>{dare.status}</Text>
    ) : (
      <>
        <Text style={[styles.result, { color: dare.borderColor === '#00D4AA' ? '#00D4AA' : '#FF6666' }]}>{dare.result}</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>{dare.action}</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
);

const Story = ({ story }) => (
  <View style={styles.story}>
    <Image source={{ uri: story.image }} style={styles.storyImage} />
    <Text style={styles.storyUser}>{story.user}</Text>
  </View>
);

export default function ActivityFeedScreen() {
  const navigation = useNavigation();
  const [feed, setFeed] = useState(initialDares);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    result: 'All',
    myDares: false,
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setFeed([...initialDares]);
      setRefreshing(false);
      setPage(1);
      setSearchQuery('');
      setFilters({ status: 'All', result: 'All', myDares: false });
    }, 2000);
  };

  const loadMore = () => {
    if (loadingMore || feed.length >= initialDares.length + additionalDares.length) return;

    setLoadingMore(true);
    setTimeout(() => {
      const newDares = additionalDares.slice(0, 2);
      setFeed((prev) => [...prev, ...newDares]);
      setPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 1500);
  };

  // Filter feed based on search query and advanced filters
  const filteredFeed = feed.filter((dare) => {
    const matchesSearch = dare.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filters.status === 'All' || dare.status === filters.status;
    const matchesResult = filters.result === 'All' || dare.result === filters.result;
    const matchesMyDares = !filters.myDares || dare.user1 === '@willsamrick'; // Example: Filter for user's dares
    return matchesSearch && matchesStatus && matchesResult && matchesMyDares;
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar backgroundColor="#000000" style="light" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>Abstrac</Text>
          <View style={styles.stonesBadge}>
            <Text style={styles.stonesText}>○ 10</Text>
          </View>
        </View>

        <View style={styles.searchAndFilterContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search dares..."
              placeholderTextColor="#AAAAAA"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon name="funnel" size={18} color={showFilters ? "#000000" : "#FFFFFF"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="notifications" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterTitle}>Filter Options</Text>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Status:</Text>
              <Picker
                selectedValue={filters.status}
                style={styles.miniPicker}
                onValueChange={(itemValue) => setFilters({ ...filters, status: itemValue })}
              >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="Pending" value="Pending" />
              </Picker>
            </View>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Result:</Text>
              <Picker
                selectedValue={filters.result}
                style={styles.miniPicker}
                onValueChange={(itemValue) => setFilters({ ...filters, result: itemValue })}
              >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="Won" value="Won" />
                <Picker.Item label="Lost" value="Lost" />
              </Picker>
            </View>
            <TouchableOpacity
              style={[styles.myDaresButton, filters.myDares && styles.myDaresButtonActive]}
              onPress={() => setFilters({ ...filters, myDares: !filters.myDares })}
            >
              <View style={styles.checkboxRow}>
                <Icon name={filters.myDares ? "checkmark-circle" : "ellipse-outline"} size={20} color="#FFFFFF" />
                <Text style={styles.myDaresText}>My Dares</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stories}>
            {stories.map((story) => (
              <Story key={story.id} story={story} />
            ))}
          </ScrollView>
        </View>
        <FlatList
          data={filteredFeed}
          renderItem={({ item }) => <DareCard dare={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feed}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#00D4AA']}
              tintColor="#00D4AA"
              title="Refreshing..."
              titleColor="#00D4AA"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => loadingMore && <ActivityIndicator size="large" color="#00D4AA" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 8, alignItems: 'center' },
  logo: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  stonesBadge: { backgroundColor: '#222222', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  stonesText: { color: '#00D4AA', fontSize: 16 },

  // Search and Filter Section
  searchAndFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 2
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#222222',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333333'
  },
  searchIcon: { fontSize: 16, color: '#AAAAAA', marginRight: 10 },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontSize: 16
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: '#222222',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333'
  },
  filterButtonActive: { backgroundColor: '#00D4AA' },
  filterText: { fontSize: 18 },

  // Filter Panel
  filterPanel: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333'
  },
  filterTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  filterLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1
  },
  miniPicker: {
    height: 40,
    width: 120,
    color: '#FFFFFF',
    backgroundColor: '#333333',
    borderRadius: 8
  },
  myDaresButton: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    alignItems: 'center'
  },
  myDaresButtonActive: { backgroundColor: '#00D4AA' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  myDaresText: { color: '#00D4AA', fontSize: 16, fontWeight: '600', marginLeft: 8 },

  // Stories Section
  sectionContainer: { marginVertical: 5 },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 15,
    marginBottom: 10
  },
  stories: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#111111'
  },
  story: { alignItems: 'center', marginRight: 15 },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#00D4AA'
  },
  storyUser: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center'
  },

  // Feed
  feed: { padding: 10 },
  dareCard: {
    backgroundColor: '#222222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  dareTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  username: { color: '#AAAAAA', fontSize: 14 },
  avatar: { width: 35, height: 35, borderRadius: 17.5 },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  icon: { color: '#FFFFFF', fontSize: 18 },
  status: { color: '#FF6666', fontSize: 14, textAlign: 'center', marginTop: 10 },
  result: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  actionButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    alignSelf: 'center',
    minWidth: 100
  },
  actionText: { color: '#000000', textAlign: 'center', fontWeight: 'bold', fontSize: 14 },
});

// Legacy styles (keeping for backward compatibility)
const legacyStyles = {
  picker: { height: 50, width: '100%', color: '#FFFFFF', backgroundColor: '#333333', borderRadius: 5 },
};
