import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useThemeColor } from '../../hooks/use-theme-color';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';


const EditProfileScreen = ({ navigation }) => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    website: user?.website || '',
  });

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');

  const dynamicStyles = getDynamicStyles(backgroundColor, cardColor, textColor, accentColor);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile(formData);
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const hasChanges = () => {
    return (
      formData.username !== (user?.username || '') ||
      formData.bio !== (user?.bio || '') ||
      formData.website !== (user?.website || '')
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={dynamicStyles.container}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={handleCancel} style={dynamicStyles.headerButton}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={dynamicStyles.headerTitle}>Edit Profile</ThemedText>
          <TouchableOpacity
            onPress={handleSave}
            style={[dynamicStyles.headerButton, !hasChanges() && { opacity: 0.5 }]}
            disabled={!hasChanges() || loading}
          >
            {loading ? (
              <ThemedText style={dynamicStyles.saveText}>Saving...</ThemedText>
            ) : (
              <ThemedText style={[dynamicStyles.saveText, hasChanges() && { color: accentColor }]}>Save</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={dynamicStyles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Picture */}
          <View style={dynamicStyles.section}>
            <ThemedText style={dynamicStyles.sectionTitle}>Profile Picture</ThemedText>
            <TouchableOpacity style={dynamicStyles.avatarContainer}>
              <View style={dynamicStyles.avatar}>
                <Ionicons name="person" size={48} color={textColor} />
              </View>
              <View style={dynamicStyles.changePhotoContainer}>
                <Ionicons name="camera" size={16} color={accentColor} />
                <ThemedText style={dynamicStyles.changePhotoText}>Change Photo</ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          {/* Username */}
          <View style={dynamicStyles.section}>
            <ThemedText style={dynamicStyles.sectionTitle}>Username</ThemedText>
            <TextInput
              style={[dynamicStyles.input, { backgroundColor: cardColor, color: textColor }]}
              placeholder="Enter your username"
              placeholderTextColor="#666"
              value={formData.username}
              onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Bio */}
          <View style={dynamicStyles.section}>
            <ThemedText style={dynamicStyles.sectionTitle}>Bio</ThemedText>
            <TextInput
              style={[dynamicStyles.input, { backgroundColor: cardColor, color: textColor }, dynamicStyles.bioInput]}
              placeholder="Tell everyone about yourself..."
              placeholderTextColor="#666"
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              multiline
              numberOfLines={3}
              maxLength={160}
            />
            <ThemedText style={dynamicStyles.charCount}>
              {formData.bio.length}/160
            </ThemedText>
          </View>

          {/* Website */}
          <View style={dynamicStyles.section}>
            <ThemedText style={dynamicStyles.sectionTitle}>Website</ThemedText>
            <TextInput
              style={[dynamicStyles.input, { backgroundColor: cardColor, color: textColor }]}
              placeholder="https://your-website.com"
              placeholderTextColor="#666"
              value={formData.website}
              onChangeText={(text) => setFormData(prev => ({ ...prev, website: text }))}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* Account Settings */}
          <View style={dynamicStyles.section}>
            <ThemedText style={dynamicStyles.sectionTitle}>Account Settings</ThemedText>

            <TouchableOpacity style={dynamicStyles.settingItem}>
              <Ionicons name="email-outline" size={20} color={textColor} />
              <View style={dynamicStyles.settingContent}>
                <ThemedText style={dynamicStyles.settingLabel}>Email Address</ThemedText>
                <ThemedText style={dynamicStyles.settingValue}>{user?.email}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={dynamicStyles.settingItem}>
              <Ionicons name="key-outline" size={20} color={textColor} />
              <View style={dynamicStyles.settingContent}>
                <ThemedText style={dynamicStyles.settingLabel}>Change Password</ThemedText>
                <ThemedText style={dynamicStyles.settingDescription}>Update your password</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={[dynamicStyles.settingItem, dynamicStyles.dangerItem]}>
              <Ionicons name="trash-outline" size={20} color="#FF6666" />
              <View style={dynamicStyles.settingContent}>
                <ThemedText style={[dynamicStyles.settingLabel, { color: '#FF6666' }]}>
                  Delete Account
                </ThemedText>
                <ThemedText style={dynamicStyles.settingDescription}>
                  Permanently delete your account
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#FF6666" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const getDynamicStyles = (backgroundColor, cardColor, textColor, accentColor) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  saveText: { fontSize: 16, fontWeight: '600' },
  scrollContent: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarContainer: { alignItems: 'center', marginVertical: 16 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: cardColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: accentColor,
  },
  changePhotoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: cardColor,
    borderRadius: 20,
  },
  changePhotoText: { fontSize: 14, color: accentColor, marginLeft: 4 },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  charCount: { fontSize: 12, color: '#666', textAlign: 'right', marginTop: 4 },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingContent: { flex: 1, marginLeft: 12 },
  settingLabel: { fontSize: 16, fontWeight: '500' },
  settingValue: { fontSize: 14, color: '#888', marginTop: 2 },
  settingDescription: { fontSize: 14, color: '#666', marginTop: 2 },
  dangerItem: { borderBottomColor: 'rgba(255,102,102,0.3)' },
});

export default EditProfileScreen;
