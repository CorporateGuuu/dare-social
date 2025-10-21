import React, { useContext, useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Modal, ScrollView } from 'react-native';
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

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [senderFilter, setSenderFilter] = useState('all'); // 'all', 'me', 'them'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'yesterday', 'week', 'month'
  const [searchFilter, setSearchFilter] = useState('');
  const [messageTypeFilter, setMessageTypeFilter] = useState('all'); // 'all', 'text', 'media'

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

  // Add mock data if no messages exist for testing
  useEffect(() => {
    if (messages.length === 0) {
      const mockMessages = [
        { id: '1', sender: userId, text: 'Hey there!', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleTimeString() },
        { id: '2', sender: 'otherUser', text: 'Hi! How are you doing?', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleTimeString() },
        { id: '3', sender: userId, text: 'I\'m doing great, thanks for asking!', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toLocaleTimeString() },
        { id: '4', sender: 'otherUser', text: 'That\'s awesome! What have you been up to?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleTimeString() },
        { id: '5', sender: userId, text: 'Just working on some projects. How about you?', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toLocaleTimeString() },
        { id: '6', sender: 'otherUser', text: 'Same here, been busy with work. Let\'s catch up soon!', timestamp: new Date().toLocaleTimeString() },
      ];
      setMessages(mockMessages);
    }
  }, [messages.length, userId]);

  // Filter messages based on current filter settings
  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      // Sender filter
      if (senderFilter === 'me' && message.sender !== userId) return false;
      if (senderFilter === 'them' && message.sender === userId) return false;

      // Date filter
      if (dateFilter !== 'all') {
        const messageDate = new Date(message.timestamp);
        const now = new Date();
        const messageDay = messageDate.getDate();
        const messageMonth = messageDate.getMonth();
        const messageYear = messageDate.getFullYear();

        switch (dateFilter) {
          case 'today':
            if (messageDay !== now.getDate() || messageMonth !== now.getMonth() || messageYear !== now.getFullYear()) return false;
            break;
          case 'yesterday':
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            if (messageDay !== yesterday.getDate() || messageMonth !== yesterday.getMonth() || messageYear !== yesterday.getFullYear()) return false;
            break;
          case 'week':
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            if (messageDate < oneWeekAgo) return false;
            break;
          case 'month':
            const oneMonthAgo = new Date(now);
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            if (messageDate < oneMonthAgo) return false;
            break;
        }
      }

      // Search filter
      if (searchFilter.trim() && !message.text.toLowerCase().includes(searchFilter.toLowerCase())) {
        return false;
      }

      // Message type filter (currently only text supported)
      if (messageTypeFilter === 'media' && message.text) return false; // No media messages yet
      if (messageTypeFilter === 'text' && !message.text) return false;

      return true;
    });
  }, [messages, senderFilter, dateFilter, searchFilter, messageTypeFilter, userId]);

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
        <View style={styles.topBarRight}>
          <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
            <Ionicons name="filter" size={20} color="#00D4AA" />
          </TouchableOpacity>
          <TouchableOpacity><Ionicons name="information-circle-outline" size={24} color="#FFF" /></TouchableOpacity>
        </View>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Messages</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              {/* Search */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Search Messages</Text>
                <TextInput
                  style={styles.searchInput}
                  value={searchFilter}
                  onChangeText={setSearchFilter}
                  placeholder="Search message content..."
                  placeholderTextColor="#666"
                />
              </View>

              {/* Sender Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Sender</Text>
                <View style={styles.filterOptions}>
                  {[
                    { label: 'All Messages', value: 'all' },
                    { label: 'My Messages', value: 'me' },
                    { label: 'Their Messages', value: 'them' }
                  ].map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.filterOption, senderFilter === option.value && styles.filterOptionActive]}
                      onPress={() => setSenderFilter(option.value)}
                    >
                      <Text style={[styles.filterOptionText, senderFilter === option.value && styles.filterOptionTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Date</Text>
                <View style={styles.filterOptions}>
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'Today', value: 'today' },
                    { label: 'Yesterday', value: 'yesterday' },
                    { label: 'This Week', value: 'week' },
                    { label: 'This Month', value: 'month' }
                  ].map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.filterOption, dateFilter === option.value && styles.filterOptionActive]}
                      onPress={() => setDateFilter(option.value)}
                    >
                      <Text style={[styles.filterOptionText, dateFilter === option.value && styles.filterOptionTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Message Type Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Message Type</Text>
                <View style={styles.filterOptions}>
                  {[
                    { label: 'All Types', value: 'all' },
                    { label: 'Text Messages', value: 'text' },
                    { label: 'Media Messages', value: 'media' }
                  ].map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.filterOption, messageTypeFilter === option.value && styles.filterOptionActive]}
                      onPress={() => setMessageTypeFilter(option.value)}
                    >
                      <Text style={[styles.filterOptionText, messageTypeFilter === option.value && styles.filterOptionTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Clear Filters */}
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSenderFilter('all');
                  setDateFilter('all');
                  setSearchFilter('');
                  setMessageTypeFilter('all');
                }}
              >
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <FlatList
        ref={flatListRef}
        data={filteredMessages}
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
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  chatTitle: { flex: 1, color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  filterButton: { padding: 5 },
  messageList: { padding: 15, flexGrow: 1 },
  messageBubble: { maxWidth: '70%', borderRadius: 20, padding: 10, marginBottom: 10 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#00D4AA' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#333333' },
  messageText: { color: '#FFFFFF', fontSize: 16 },
  messageTime: { color: '#AAAAAA', fontSize: 12, textAlign: 'right', marginTop: 5 },
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: '#111111', borderTopWidth: 1, borderTopColor: '#333333' },
  messageInput: { flex: 1, backgroundColor: '#222222', color: '#FFFFFF', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
  sendButton: { backgroundColor: '#00D4AA', borderRadius: 20, padding: 10, justifyContent: 'center', alignItems: 'center' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  filterModal: { backgroundColor: '#111111', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333333' },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  filterContent: { padding: 20 },
  filterSection: { marginBottom: 25 },
  filterLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  searchInput: { backgroundColor: '#222222', color: '#FFFFFF', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16 },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterOption: { backgroundColor: '#333333', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  filterOptionActive: { backgroundColor: '#00D4AA' },
  filterOptionText: { color: '#FFFFFF', fontSize: 14 },
  filterOptionTextActive: { color: '#000000', fontWeight: 'bold' },
  clearFiltersButton: { backgroundColor: '#444444', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'center', marginTop: 10 },
  clearFiltersText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default ChatScreen;
