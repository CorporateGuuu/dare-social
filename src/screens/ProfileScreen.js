import { useContext } from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from '../context/AuthContext';

export default function Current_User_Account(props) {
  const { navigation, route } = props;
  const { user, logout, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Error loading profile. Please try again.</Text>
      </SafeAreaView>
    );
  }

  const profileUser = route.params?.user || user;
  const isOwnProfile = !route.params?.user;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: profileUser.avatar }} style={styles.avatarHeader} />
        <Text style={styles.logo}>{isOwnProfile ? '▲' : profileUser.username || '@user'}</Text>
        {isOwnProfile && (
          <View style={styles.stones}>
            <Text style={styles.stonesText}>∘ {profileUser.stones}</Text>
          </View>
        )}
        {isOwnProfile && (
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Rest of the screen */}
      <View style={styles.content}>
        <Image source={{ uri: profileUser.avatar }} style={styles.realAvatar} />
        <Text style={styles.name}>{profileUser.username || '@you'}</Text>
        <Text style={styles.meta}>Stone: {profileUser.stones} 🪨  •  Level: {profileUser.level}  •  Streak: {profileUser.currentStreak}</Text>

        <View style={styles.block}><Text>{isOwnProfile ? 'My Dares (placeholder)' : 'Their Dares (placeholder)'}</Text></View>
        <View style={styles.block}><Text>Activity (placeholder)</Text></View>
        <View style={styles.block}><Text>{isOwnProfile ? 'Settings (placeholder)' : ''}</Text></View>
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
