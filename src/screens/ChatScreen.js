import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AuthContext } from '../context/AuthContext';
import { database } from '../config/firebase';
import { onValue, ref, push } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = ({ route, navigation }) => {
  const { chatId, user } = route.params;
  const { user: authUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

  const userId = authUser?.uid || 'me'; // Fallback if not loaded

  useEffect(() => {
    const messagesRef = ref(database, `chats/${chatId}/messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgList = Object.values(data).map(msg => ({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
        }));
        setMessages(msgList);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    flatListRef.current.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const newMsgRef = push(messagesRef);
    newMsgRef.set({
      id: newMsgRef.key,
      sender: userId,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Update last message in chat list (optional, for real-time)
    const chatRef = ref(database, `users/${userId}/chats/${chatId}`);
    chatRef.update({
      lastMessage: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    });

    setNewMessage('');
  };

  const renderMessage = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(200)} style={[
      styles.messageBubble,
      item.sender === userId ? styles.myMessage : styles.theirMessage
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>{item.timestamp}</Text>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>
        <Text style={styles.chatTitle}>{user}</Text>
        <TouchableOpacity><Ionicons name="information-circle-outline" size={24} color="#FFF" /></TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#111111', borderBottomWidth: 1, borderBottomColor: '#333333' },
  chatTitle: { flex: 1, color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  messageList: { padding: 15, flexGrow: 1 },
  messageBubble: { maxWidth: '70%', borderRadius: 20, padding: 10, marginBottom: 10 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#00D4AA', },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#333333', },
  messageText: { color: '#FFFFFF', fontSize: 16 },
  messageTime: { color: '#AAAAAA', fontSize: 12, textAlign: 'right', marginTop: 5 },
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: '#111111', borderTopWidth: 1, borderTopColor: '#333333' },
  messageInput: { flex: 1, backgroundColor: '#222222', color: '#FFFFFF', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
  sendButton: { backgroundColor: '#00D4AA', borderRadius: 20, padding: 10, justifyContent: 'center', alignItems: 'center' },
});

export default ChatScreen;
