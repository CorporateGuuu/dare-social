import * as AV from 'expo-av';
import { useContext, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useFadeIn, useSlideUp } from '../hooks/useAnimations';
import { db } from '../lib/firebase';

const ChatScreen = ({ route }) => {
  const { user, setTyping } = useContext(AuthContext);
  const { challengeId } = route.params || {};
  const fadeAnim = useFadeIn(500);
  const slideAnim = useSlideUp(50, 500);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef();
  const typingTimeout = useRef(null);

  useEffect(() => {
    const unsubscribe = db
      .collection('challenges')
      .doc(challengeId)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          const currentTyping = data.typing || {};
          const activeTypists = Object.entries(currentTyping)
            .filter(([uid, timestamp]) => uid !== user.id && timestamp && new Date() - new Date(timestamp) < 10000)
            .map(([uid]) => uid);
          setTypingUsers(activeTypists.reduce((acc, uid) => ({ ...acc, [uid]: true }), {}));
        }
      });

    const unsubscribeMessages = db
      .collection('challenges')
      .doc(challengeId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot(snapshot => {
        const msgList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgList.reverse());
        // Mark messages as read for the current user
        msgList.forEach(async msg => {
          if (msg.userId !== user.id && !msg.read?.includes(user.id)) {
            const arrayUnion = (await import('firebase/firestore')).arrayUnion;
            await db.collection('challenges').doc(challengeId).collection('messages').doc(msg.id).update({
              read: arrayUnion(user.id)
            });
            console.log(`Marked message ${msg.id} as read by ${user.id}`);
          }
        });
      });

    return () => {
      unsubscribe();
      unsubscribeMessages();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      if (recording) stopRecording();
    };
  }, [challengeId, user.id]);

  const handleTextChange = (text) => {
    setNewMessage(text);
    if (text.length > 0 && !typingTimeout.current) {
      setTyping(challengeId, true);
    } else if (text.length === 0 && typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      setTyping(challengeId, false);
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTyping(challengeId, false);
      typingTimeout.current = null;
    }, 3000); // Stop typing after 3s inactivity
  };

  const startRecording = async () => {
    try {
      await AV.requestPermissionsAsync();
      const { status } = await AV.getPermissionsAsync();
      if (status !== 'granted') return;

      await AV.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new AV.Audio.Recording();
      await newRecording.prepareToRecordAsync(AV.Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    setIsRecording(false);
    sendVoiceMessage(uri);
  };

  const sendVoiceMessage = async (uri) => {
    const messageData = {
      type: 'voice',
      uri: uri, // Mock; use Firebase Storage URL in production
      userId: user.id,
      username: user.username,
      timestamp: new Date(),
      read: [user.id],
    };
    // Mock: await db.collection('challenges').doc(challengeId).collection('messages').add(messageData);
    console.log('Voice message sent:', messageData);
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const messageData = {
      text: newMessage,
      userId: user.id,
      username: user.username,
      timestamp: new Date(),
      read: [user.id], // Initial read by sender
    };
    await db.collection('challenges')
      .doc(challengeId)
      .collection('messages')
      .add(messageData);
    console.log('Message sent:', messageData);
    setNewMessage('');
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      setTyping(challengeId, false);
      typingTimeout.current = null;
    }
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const playVoiceMessage = async (uri) => {
    const { sound } = await AV.Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  const renderMessage = ({ item }) => {
    const isSentByMe = item.userId === user.id;
    const isReadByAll = item.read.length > 1 || (item.read.length === 1 && isSentByMe);

    return (
      <View style={[styles.messageContainer, isSentByMe ? styles.sent : styles.received]}>
        {item.type === 'voice' ? (
          <TouchableOpacity onPress={() => playVoiceMessage(item.uri)} style={styles.voiceContainer}>
            <Text style={styles.voiceText}>🎙️ Play Voice Message</Text>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
        <View style={styles.messageFooter}>
          {isSentByMe && isReadByAll && <Text style={styles.readReceipt}>✅</Text>}
          <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
        </View>
      </View>
    );
  };

  const typingText = Object.keys(typingUsers).length > 0
    ? `${Object.keys(typingUsers).map(uid => `@${uid}`).join(', ')} is typing...`
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerText}>Chat for {challengeId}</Text>
        {typingText && <Text style={styles.typingIndicator}>{typingText}</Text>}
      </Animated.View>
      <Animated.View style={[styles.chatContainer, { transform: [{ translateY: slideAnim }] }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          inverted
          style={styles.messageList}
        />
      </Animated.View>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recording]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        >
          <Text style={styles.recordText}>{isRecording ? 'Recording...' : '🎤'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={handleTextChange}
          placeholder="Type a message..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={!newMessage.trim()}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  header: { padding: 15, backgroundColor: '#2A2A2A', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headerText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  chatContainer: { flex: 1, padding: 10 },
  messageList: { flex: 1 },
  messageContainer: { maxWidth: '70%', marginVertical: 5, padding: 10, borderRadius: 10 },
  sent: { backgroundColor: '#00FF00', alignSelf: 'flex-end' },
  received: { backgroundColor: '#3A3A3A', alignSelf: 'flex-start' },
  messageText: { color: 'white' },
  timestamp: { color: '#888', fontSize: 10, marginTop: 5 },
  messageFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  readReceipt: { color: '#00FF00', fontSize: 12 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#2A2A2A', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#1A1A1A', color: 'white', padding: 10, borderRadius: 20, marginHorizontal: 10 },
  sendButton: { backgroundColor: '#00FF00', padding: 10, borderRadius: 20, justifyContent: 'center' },
  sendText: { color: '#1A1A1A', fontWeight: 'bold' },
  typingIndicator: { color: '#00FF00', fontSize: 12, marginLeft: 10 },
  voiceContainer: { flexDirection: 'row', alignItems: 'center' },
  voiceText: { color: 'white', marginRight: 10 },
  recordButton: { backgroundColor: '#3A3A3A', padding: 10, borderRadius: 20, marginRight: 10 },
  recording: { backgroundColor: '#FF0000' },
  recordText: { color: 'white' },
});

export default ChatScreen;
