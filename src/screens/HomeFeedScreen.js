import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import PlaceholderCard from "../components/PlaceholderCard";
import { searchUsers } from "../lib/firebase";

// Use single ideal proportion for all images/proofs
const getImageStyle = () => ({ width: 231, height: 350, borderRadius: 8 });

export default function HomeFeedScreen({ navigation }) {
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
    <View style={styles.friendItem}>
      <TouchableOpacity style={styles.createBetIcon} onPress={() => navigation.navigate('CreateChallenge', { opponent: item })}>
        <Text style={styles.iconText}>+</Text>
      </TouchableOpacity>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <Text style={styles.username} numberOfLines={1}>{item.username}</Text>
      <Text style={styles.record}>{item.record}</Text>
      <Text style={styles.stonesDiff}>{item.stonesDiff}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>▲</Text>
      </View>
      <View style={styles.bestFriendsSection}>
        <Text style={styles.sectionTitle}>Best Friends</Text>
        <FlatList
          data={bestFriends}
          renderItem={renderBestFriend}
          keyExtractor={(item) => item.username}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendsList}
        />
      </View>
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Buying Power:</Text>
            <Text style={styles.statValue}>500 🪨</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Frozen Assets:</Text>
            <Text style={styles.statValue}>250 🪨</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Record:</Text>
            <Text style={styles.statValue}>28-19</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Win Rate:</Text>
            <Text style={styles.statValue}>60%</Text>
          </View>
        </View>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search users"
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
            <View style={styles.postContainer}>
              {item.type === 'ad' ? (
                <View style={styles.headerRow}>
                  <TouchableOpacity onPress={() => navigation.navigate("Profile", { user: item.company })}>
                    <Text style={styles.postUsername}>{item.company.username}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.headerRow}>
                  {item.winner && (
                    <TouchableOpacity onPress={() => navigation.navigate("Profile", { user: item.winner })}>
                      <Text style={styles.postUsername}>{item.winner.username}</Text>
                    </TouchableOpacity>
                  )}
                  <Text style={styles.postHeader}> beat </Text>
                  {item.losers && item.losers.length > 0 && (
                    <TouchableOpacity onPress={() => navigation.navigate("Profile", { user: item.losers[0] })}>
                      <Text style={styles.postUsername}>{item.losers[0].username}</Text>
                    </TouchableOpacity>
                  )}
                  {(!item.losers || item.losers.length === 0) && <Text style={styles.postHeader}>loser</Text>}
                </View>
              )}
              {item.winnerProof && (
                <View style={styles.mediaContainer}>
                  <View style={styles.leftDiamonds}>
                    {diamonds.map(i => <Text key={i} style={styles.diamond}>♦</Text>)}
                  </View>
                  <View style={styles.rightDiamonds}>
                    {diamonds.map(i => <Text key={i} style={styles.diamond}>♦</Text>)}
                  </View>
                  <Image source={{ uri: item.winnerProof.mediaUrl }} style={getImageStyle()} />
                  {item.winnerProof.caption && <Text style={styles.caption}>{item.winnerProof.caption}</Text>}
                </View>
              )}
              <TouchableOpacity onPress={() => navigation.navigate("DareDetails", { dare: item })}>
                <PlaceholderCard title={item.title} subtitle={`+${item.rewardStone} Stone 🪨`} />
              </TouchableOpacity>
              {item.type !== 'ad' && (
                <View style={styles.commentsContainer}>
                  <Text style={styles.comments}>Winner: {item.winnerComment}</Text>
                  <Text style={styles.comments}>Loser: {item.loserComment}</Text>
                </View>
              )}
              <View style={styles.socialBar}>
                <View style={styles.socialItem}>
                  <Text style={styles.icon}>💬</Text>
                  <Text style={styles.count}>5</Text>
                </View>
                <View style={styles.socialItem}>
                  <Text style={styles.icon}>❤️</Text>
                  <Text style={styles.count}>10</Text>
                </View>
                <TouchableOpacity style={styles.socialItem} onPress={() => {}}>
                  <Text style={styles.dots}>• • •</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', marginBottom: 0 },
  logo: { flex: 1, textAlign: 'center', fontSize: 24 },
  bestFriendsSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  friendsList: { paddingVertical: 10 },
  statsSection: { marginBottom: 16 },
  statsContainer: { marginTop: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { color: 'black', fontSize: 16 },
  statValue: { color: 'black', fontSize: 16, fontWeight: 'bold' },
  friendItem: { alignItems: 'center', marginRight: 15, width: 80 },
  createBetIcon: { position: 'absolute', top: -5, right: -5, backgroundColor: 'blue', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  iconText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  avatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 5, marginTop: 10 },
  username: { color: 'black', fontSize: 12, textAlign: 'center', marginBottom: 4 },
  record: { color: 'black', fontSize: 10, textAlign: 'center', marginBottom: 2 },
  stonesDiff: { color: 'black', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  searchBar: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 16, textAlign: "center" },
  postContainer: { marginBottom: 16 },
  postHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  postUsername: { fontSize: 16, fontWeight: 'bold', color: 'blue', textDecorationLine: 'underline' },
  mediaContainer: { marginBottom: 8, position: 'relative', alignSelf: 'center' },
  mediaDefault: { width: 231, height: 350, borderRadius: 8 },
  leftDiamonds: { position: 'absolute', left: -20, top: 0, height: 350, flexDirection: 'column', justifyContent: 'space-around' },
  rightDiamonds: { position: 'absolute', right: -20, top: 0, height: 350, flexDirection: 'column', justifyContent: 'space-around' },
  diamond: { fontSize: 15, color: 'gold' },
  caption: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  socialBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderColor: '#eee' },
  socialItem: { alignItems: 'center', flex: 1 },
  icon: { fontSize: 22, padding: 11 },
  count: { fontSize: 14, color: '#666' },
  dots: { fontSize: 18, color: '#666' },
  commentsContainer: { paddingVertical: 4 },
  comments: { fontSize: 14, fontStyle: 'italic', marginVertical: 2 },
});
