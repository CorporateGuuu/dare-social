// screens/ChatListScreen.js - Updated with Firebase real-time data
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AuthContext } from '../context/AuthContext';
import { database } from '../config/firebase'; // Adjust path
import { onValue, ref } from 'firebase/database';

const ChatListScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    // Listen to all chats for current user
    const chatsRef = ref(database, `users/${user.uid}/chats`);

    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const chatList = Object.keys(data).map(chatId => ({
          id: chatId,
          ...data[chatId],
          user: data[chatId].participant || '@unknown', // From data
          avatar: data[chatId].avatar || '👨', // From friends or data
        }));
        setChats(chatList);
      } else {
        setChats([]);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const renderChatItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(300)} style={styles.chatItem}>
      <TouchableOpacity 
        style={styles.chatContent}
        onPress={() => navigation.navigate('Chat', { chatId: item.id, user: item.user })}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
        <View style={styles.messageInfo}>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        </View>
        <View style={styles.metaInfo}>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Top bar - reuse */}
      <View style={styles.topBar}>
        <Text style={styles.time}>8:50</Text>
        <View style={styles.statusIcons}>
          <Text style={styles.status}>●</Text>
          <Text style={styles.signal}>▱▱▱▱</Text>
          <Text style={styles.battery}>34%</Text>
        </View>
      </View>

      <View style={styles.urlBar}>
        <TouchableOpacity><Text style={styles.cameraIcon}>📷</Text></TouchableOpacity>
        <Text style={styles.url}>abstrac-final-mvp.bubbleapps.io/chats</Text>
        <TouchableOpacity><Text style={styles.shareIcon}>↗</Text></TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noChats}>No chats yet</Text>}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

// Styles unchanged from previous
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 50,
    backgroundColor: '#000000'
  },
  time: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  statusIcons: { flexDirection: 'row', alignItems: 'center' },
  status: { color: '#00FF00', fontSize: 12, marginRight: 5 },
  signal: { color: '#FFFFFF', fontSize: 12, marginRight: 10 },
  battery: { color: '#FFFFFF', fontSize: 12 },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#111111',
    borderRadius: 25,
    marginHorizontal: 20,
    marginVertical: 10
  },
  cameraIcon: { fontSize: 16, color: '#FFFFFF' },
  url: { color: '#FFFFFF', fontSize: 14, flex: 1, textAlign: 'center' },
  shareIcon: { fontSize: 16, color: '#FFFFFF' },
  listContainer: { padding: 20 },
  chatItem: { backgroundColor: '#111111', borderRadius: 12, marginBottom: 10 },
  chatContent: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  avatarText: { fontSize: 24 },
  messageInfo: { flex: 1 },
  userName: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  lastMessage: { color: '#AAAAAA', fontSize: 14 },
  metaInfo: { alignItems: 'flex-end' },
  timestamp: { color: '#666666', fontSize: 12 },
  unreadBadge: {
    backgroundColor: '#00D4AA',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5
  },
  unreadText: { color: '#000000', fontSize: 12, fontWeight: '600' },
  noChats: { color: '#666666', textAlign: 'center', fontSize: 16, marginTop: 20 },
});

export default ChatListScreen;
