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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>▲</Text>
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
                    <Text style={styles.username}>{item.company.username}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.headerRow}>
                  {item.winner && (
                    <TouchableOpacity onPress={() => navigation.navigate("Profile", { user: item.winner })}>
                      <Text style={styles.username}>{item.winner.username}</Text>
                    </TouchableOpacity>
                  )}
                  <Text style={styles.postHeader}> beat </Text>
                  {item.losers && item.losers.length > 0 && (
                    <TouchableOpacity onPress={() => navigation.navigate("Profile", { user: item.losers[0] })}>
                      <Text style={styles.username}>{item.losers[0].username}</Text>
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
  searchBar: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 16, textAlign: "center" },
  postContainer: { marginBottom: 16 },
  postHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  username: { fontSize: 16, fontWeight: 'bold', color: 'blue', textDecorationLine: 'underline' },
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
