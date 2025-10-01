import { useContext } from "react";
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PlaceholderCard from "../components/PlaceholderCard";
import { AuthContext } from '../context/AuthContext';
import { useDares } from "../hooks/useDares";

export default function HomeFeedScreen({ navigation }) {
  const { dares, loading } = useDares();
  const { user, logout } = useContext(AuthContext);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.logo}>▲</Text>
          <View style={styles.stones}>
            <Text style={styles.stonesText}>∘ {user.stones}</Text>
          </View>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>
        {/* Rest of the screen */}
        <View style={styles.content}>
          <Text style={styles.feedHeader}>Home Feed</Text>
          <Text>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.logo}>▲</Text>
        <View style={styles.stones}>
          <Text style={styles.stonesText}>∘ {user.stones}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>
      {/* Rest of the screen */}
      <View style={styles.content}>
        <Text style={styles.feedHeader}>Home Feed</Text>

        <FlatList
          data={dares}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate("DareDetails", { dareId: item.id })}>
              <PlaceholderCard title={item.title} subtitle={`+${item.reward} Stone 🪨`} />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  logo: { flex: 1, textAlign: 'center', fontSize: 24 },
  stones: {},
  stonesText: { fontSize: 16 },
  logout: { color: 'white', marginLeft: 10 },
  content: { flex: 1, backgroundColor: "#fff", padding: 16 },
  feedHeader: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
});
