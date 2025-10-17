import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker';
import { createPost as createPostService } from '../services/postService';
import { VideoView } from 'expo-video';

const PostsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ caption: '', type: 'text', media: null });
  const [dailyPosts, setDailyPosts] = useState(0); // Placeholder, implement actual logic if needed

  useEffect(() => {
    // Fetch posts from Firestore
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    }, (error) => {
      console.error("Failed to fetch posts:", error);
    });

    return () => unsubscribe();
  }, []);

  const createPost = async () => {
    if (!newPost.caption.trim()) return;

    try {
      await createPostService({
        authorId: userId,
        type: newPost.type,
        content: newPost.caption,
        caption: newPost.caption,
        mediaUrls: newPost.media ? [newPost.media.uri] : [],
        visibility: 'public',
      });

      setNewPost({ caption: '', type: 'text', media: null });
      setDailyPosts(prev => prev + 1); // Increment daily posts
      Alert.alert('Success', 'Post created! Check your wallet for Stone rewards.');
    } catch (_error) {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewPost(prev => ({ ...prev, media: result.assets[0], type: 'image' }));
    }
  };

  const pickCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos or videos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 30, // Limit video to 30 seconds for posts
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const type = asset.type === 'video' ? 'video' : 'image';
      setNewPost(prev => ({ ...prev, media: asset, type }));
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <Text style={styles.postAuthor}>@{item.authorId}</Text>
      {item.mediaUrls?.[0] && (
        item.type === 'video' ? (
          <VideoView
            source={{ uri: item.mediaUrls[0] }}
            style={styles.postVideo}
            resizeMode="contain"
          />
        ) : (
          <Image source={{ uri: item.mediaUrls[0] }} style={styles.postImage} />
        )
      )}
      <Text style={styles.postCaption}>{item.content}</Text>
      <View style={styles.postEngagement}>
        <Text>❤️ {item.engagement?.likes || 0}</Text>
        <Text>💬 {item.engagement?.comments || 0}</Text>
        <Text>🔄 {item.engagement?.shares || 0}</Text>
        {item.stoneReward?.totalEarned > 0 && (
          <Text style={styles.stoneReward}>+{item.stoneReward.totalEarned} Stones</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Create Post Section */}
      <View style={styles.createPost}>
        <TextInput
          style={styles.captionInput}
          value={newPost.caption}
          onChangeText={text => setNewPost(prev => ({ ...prev, caption: text }))}
          placeholder="What's happening? Share your challenge..."
          multiline
        />
        <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
          <Text style={styles.mediaButtonText}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cameraButton} onPress={pickCamera}>
          <Text style={styles.cameraButtonText}>📹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postButton} onPress={createPost}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Post Feed */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.feed}
      />

      {/* Post Stats */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>📝 {dailyPosts}/5 daily posts | 💎 Earn Stones for engagement!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  createPost: { 
    flexDirection: 'row', 
    padding: 15, 
    backgroundColor: '#111', 
    alignItems: 'flex-end' 
  },
  captionInput: { 
    flex: 1, 
    backgroundColor: '#222', 
    color: '#FFF', 
    padding: 10, 
    borderRadius: 8, 
    marginRight: 10,
    maxHeight: 100,
  },
  mediaButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 20,
    padding: 10,
    marginRight: 10
  },
  mediaButtonText: { fontSize: 18 },
  cameraButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 20,
    padding: 10,
    marginRight: 10
  },
  cameraButtonText: { fontSize: 18 },
  postButton: { 
    backgroundColor: '#00D4AA', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 8 
  },
  postButtonText: { color: '#000', fontWeight: 'bold' },
  postCard: { 
    backgroundColor: '#111', 
    margin: 10, 
    borderRadius: 12, 
    padding: 15 
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10
  },
  postVideo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10
  },
  postCaption: { color: '#FFF', marginBottom: 10 },
  postEngagement: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  stoneReward: { 
    color: '#00D4AA', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  statsBar: { 
    backgroundColor: '#222', 
    padding: 10, 
    alignItems: 'center' 
  },
  statsText: { color: '#AAA' },
});

export default PostsScreen;
