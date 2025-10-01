import { useContext } from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatarHeader} />
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
        <Image source={{ uri: user.avatar }} style={styles.realAvatar} />
        <Text style={styles.name}>{user.username || '@you'}</Text>
        <Text style={styles.meta}>Stone: {user.stones} 🪨  •  Wins: 5  •  Streak: 3</Text>

        <View style={styles.block}><Text>My Dares (placeholder)</Text></View>
        <View style={styles.block}><Text>Activity (placeholder)</Text></View>
        <View style={styles.block}><Text>Settings (placeholder)</Text></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  avatarHeader: { width: 40, height: 40, borderRadius: 20 },
  logo: { flex: 1, textAlign: 'center', fontSize: 24 },
  stones: {},
  stonesText: { fontSize: 16 },
  logout: { color: 'white', marginLeft: 10 },
  content: { flex: 1, backgroundColor: "#fff", padding: 16, alignItems: "center" },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#eee", marginTop: 8, marginBottom: 10 },
  realAvatar: { width: 96, height: 96, borderRadius: 48, marginTop: 8, marginBottom: 10, borderWidth: 2, borderColor: '#ddd' },
  name: { fontSize: 20, fontWeight: "700" },
  meta: { color: "#666", marginTop: 4, marginBottom: 16 },
  block: { alignSelf: "stretch", backgroundColor: "#f4f4f4", borderRadius: 12, padding: 12, marginBottom: 12 },
});
