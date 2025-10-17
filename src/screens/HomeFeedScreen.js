import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import PlaceholderCard from "../components/PlaceholderCard";
import { searchUsers } from "../lib/firebase";
import { useThemeColor } from "../../hooks/use-theme-color";
import { ThemedView } from "../../components/themed-view";
import { ThemedText } from "../../components/themed-text";

// Use single ideal proportion for all images/proofs
const getImageStyle = () => ({ width: 231, height: 350, borderRadius: 8 });

export default function HomeFeedScreen({ navigation }) {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);

  // Placeholder rarity (1-5), should come from dare data
  const getRarity = (dareId) => 3; // Replace with actual

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { listCompletedDares } = await import("../lib/firebase");
        const res = await listCompletedDares();
        // Add a sample ad for demonstration
        const sampleAd = {
          id: 'ad-sample',
          type: 'ad',
          company: { uid: 'sponsor1', username: 'SponsorCo' },
          title: 'Amazing Product Deal!',
          rewardStone: 0, // ads don't have bets
          winnerProof: {
            mediaUrl: 'https://example.com/ad-image.jpg',
            caption: 'Buy now and save!'
          }
        };
        setPosts([sampleAd, ...res.data.map(p => ({ ...p, winnerComment: 'Epic win!', loserComment: 'Better luck next!' }))]);
      } catch (e) {
        console.error("Failed to fetch dares:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);



  const handleSearch = async () => {
    if (query.length > 0) {
      try {
        const res = await searchUsers({ query });
        setUsers(res.data);
      } catch (e) {
        console.error("Failed to search users:", e);
      }
    } else {
      setUsers([]);
    }
  };

  const bestFriends = [
    { username: '@frankvecchie', avatar: 'https://example.com/frank.jpg', record: '10-5', stonesDiff: '+150 🪨' },
    { username: '@mattbraun', avatar: 'https://example.com/matt.jpg', record: '8-7', stonesDiff: '+50 🪨' },
    { username: '@alice_smith', avatar: 'https://example.com/alice.jpg', record: '12-3', stonesDiff: '+200 🪨' },
    { username: '@bob_jones', avatar: 'https://example.com/bob.jpg', record: '9-6', stonesDiff: '-30 🪨' },
  ];

  const renderBestFriend = ({ item }) => (
    <ThemedView style={dynamicStyles.friendItem}>
      <TouchableOpacity style={dynamicStyles.createBetIcon} onPress={() => navigation.navigate('CreateChallenge', { opponent: item })}>
        <ThemedText style={dynamicStyles.iconText}>+</ThemedText>
      </TouchableOpacity>
      <Image source={{ uri: item.avatar }} style={dynamicStyles.avatar} />
      <ThemedText style={dynamicStyles.username} numberOfLines={1}>{item.username}</ThemedText>
      <ThemedText style={dynamicStyles.record}>{item.record}</ThemedText>
      <ThemedText style={dynamicStyles.stonesDiff}>{item.stonesDiff}</ThemedText>
    </ThemedView>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  const dynamicStyles = getDynamicStyles(backgroundColor, cardColor, textColor, accentColor);

  return (
    <ThemedView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <ThemedText style={dynamicStyles.logo}>▲</ThemedText>
      </View>
      <ThemedView style={dynamicStyles.bestFriendsSection}>
        <ThemedText style={dynamicStyles.sectionTitle}>Best Friends</ThemedText>
        <FlatList
          data={bestFriends}
          renderItem={renderBestFriend}
          keyExtractor={(item) => item.username}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={dynamicStyles.friendsList}
        />
      </ThemedView>
      <ThemedView style={dynamicStyles.statsSection}>
        <ThemedText style={dynamicStyles.sectionTitle}>Statistics</ThemedText>
        <ThemedView style={dynamicStyles.statsContainer}>
          <View style={dynamicStyles.statRow}>
            <ThemedText style={dynamicStyles.statLabel}>Buying Power:</ThemedText>
            <ThemedText style={dynamicStyles.statValue}>500 🪨</ThemedText>
          </View>
          <View style={dynamicStyles.statRow}>
            <ThemedText style={dynamicStyles.statLabel}>Frozen Assets:</ThemedText>
            <ThemedText style={dynamicStyles.statValue}>250 🪨</ThemedText>
          </View>
          <View style={dynamicStyles.statRow}>
            <ThemedText style={dynamicStyles.statLabel}>Record:</ThemedText>
            <ThemedText style={dynamicStyles.statValue}>28-19</ThemedText>
          </View>
          <View style={dynamicStyles.statRow}>
            <ThemedText style={dynamicStyles.statLabel}>Win Rate:</ThemedText>
            <ThemedText style={dynamicStyles.statValue}>60%</ThemedText>
          </View>
        </ThemedView>
      </ThemedView>
      <TextInput
        style={dynamicStyles.searchBar}
        placeholder="Search users"
        placeholderTextColor={textColor}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
      />
      {users.length > 0 && (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate("Profile", { user: item })}>
              <PlaceholderCard title={item.username} subtitle="User found" />
            </TouchableOpacity>
          )}
        />
      )}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const rarity = getRarity(item.id);
          const diamonds = Array.from({ length: rarity }, (_, i) => i);
          return (
            <ThemedView style={dynamicStyles.postContainer}>
              {item.type === 'ad' ? (
                <View style={dynamicStyles.headerRow}>
                  <TouchableOpacity onPress={() => navigation.navigate("Profile", { user: item.company })}>
                    <ThemedText style={dynamicStyles.postUsername}>{item.company.username}</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={dynamicStyles.headerRow}>
                  {item.winner && (
                    <TouchableOpacity onPress={() => navigation.navigate("Profile", { user: item.winner })}>
                      <ThemedText style={dynamicStyles.postUsername}>{item.winner.username}</ThemedText>
                    </TouchableOpacity>
                  )}
                  <ThemedText style={dynamicStyles.postHeader}> beat </ThemedText>
                  {item.losers && item.losers.length > 0 && (
                    <TouchableOpacity onPress={() => navigation.navigate("Profile", { user: item.losers[0] })}>
                      <ThemedText style={dynamicStyles.postUsername}>{item.losers[0].username}</ThemedText>
                    </TouchableOpacity>
                  )}
                  {(!item.losers || item.losers.length === 0) && <ThemedText style={dynamicStyles.postHeader}>loser</ThemedText>}
                </View>
              )}
              {item.winnerProof && (
                <View style={dynamicStyles.mediaContainer}>
                  <View style={dynamicStyles.leftDiamonds}>
                    {diamonds.map(i => <Text key={i} style={dynamicStyles.diamond}>♦</Text>)}
                  </View>
                  <View style={dynamicStyles.rightDiamonds}>
                    {diamonds.map(i => <Text key={i} style={dynamicStyles.diamond}>♦</Text>)}
                  </View>
                  <Image source={{ uri: item.winnerProof.mediaUrl }} style={getImageStyle()} />
                  {item.winnerProof.caption && <ThemedText style={dynamicStyles.caption}>{item.winnerProof.caption}</ThemedText>}
                </View>
              )}
              <TouchableOpacity onPress={() => navigation.navigate("DareDetails", { dare: item })}>
                <PlaceholderCard title={item.title} subtitle={`+${item.wagerAmount || item.rewardStone} Jade`} />
              </TouchableOpacity>
              {item.type !== 'ad' && (
                <View style={dynamicStyles.commentsContainer}>
                  <ThemedText style={dynamicStyles.comments}>Winner: {item.winnerComment}</ThemedText>
                  <ThemedText style={dynamicStyles.comments}>Loser: {item.loserComment}</ThemedText>
                </View>
              )}
              <ThemedView style={dynamicStyles.socialBar}>
                <View style={dynamicStyles.socialItem}>
                  <Text style={dynamicStyles.icon}>💬</Text>
                  <ThemedText style={dynamicStyles.count}>5</ThemedText>
                </View>
                <View style={dynamicStyles.socialItem}>
                  <Text style={dynamicStyles.icon}>❤️</Text>
                  <ThemedText style={dynamicStyles.count}>10</ThemedText>
                </View>
                <TouchableOpacity style={dynamicStyles.socialItem} onPress={() => {}}>
                  <ThemedText style={dynamicStyles.dots}>• • •</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          );
        }}
      />
    </ThemedView>
  );
}

const getDynamicStyles = (backgroundColor, cardColor, textColor, accentColor) => StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Array.isArray(backgroundColor) ? backgroundColor[0] : backgroundColor,
    marginBottom: 0
  },
  logo: { flex: 1, textAlign: 'center', fontSize: 24 },
  bestFriendsSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  friendsList: { paddingVertical: 10 },
  statsSection: { marginBottom: 16 },
  statsContainer: { marginTop: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { fontSize: 16 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  friendItem: { alignItems: 'center', marginRight: 15, width: 80 },
  createBetIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: accentColor,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  iconText: { fontSize: 12, fontWeight: 'bold' },
  avatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 5, marginTop: 10 },
  username: { fontSize: 12, textAlign: 'center', marginBottom: 4 },
  record: { fontSize: 10, textAlign: 'center', marginBottom: 2 },
  stonesDiff: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  searchBar: {
    borderWidth: 1,
    borderColor: accentColor,
    backgroundColor: cardColor,
    padding: 8,
    marginBottom: 16,
    textAlign: "center"
  },
  postContainer: { marginBottom: 16 },
  postHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  postUsername: { fontSize: 16, fontWeight: 'bold', color: accentColor, textDecorationLine: 'underline' },
  mediaContainer: { marginBottom: 8, position: 'relative', alignSelf: 'center' },
  mediaDefault: { width: 231, height: 350, borderRadius: 8 },
  leftDiamonds: { position: 'absolute', left: -20, top: 0, height: 350, flexDirection: 'column', justifyContent: 'space-around' },
  rightDiamonds: { position: 'absolute', right: -20, top: 0, height: 350, flexDirection: 'column', justifyContent: 'space-around' },
  diamond: { fontSize: 15, color: '#FFD700' },
  caption: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  socialBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: accentColor
  },
  socialItem: { alignItems: 'center', flex: 1 },
  icon: { fontSize: 22, padding: 11 },
  count: { fontSize: 14 },
  dots: { fontSize: 18 },
  commentsContainer: { paddingVertical: 4 },
  comments: { fontSize: 14, fontStyle: 'italic', marginVertical: 2 },
});
