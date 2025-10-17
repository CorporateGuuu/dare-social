import React, { useContext, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useThemeColor } from '../../hooks/use-theme-color';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';

const PrivacySecurityScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');

  const dynamicStyles = getDynamicStyles(backgroundColor, cardColor, textColor, accentColor);

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public', // public, friends, private
    allowMessages: 'everyone', // everyone, followers, friends, none
    showOnlineStatus: true,
    allowTagging: true,
    dataCollection: true,
    analytics: true,
  });

  const togglePrivacy = (key) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateProfileVisibility = (value) => {
    setPrivacy(prev => ({ ...prev, profileVisibility: value }));
  };

  const updateMessageSettings = (value) => {
    setPrivacy(prev => ({ ...prev, allowMessages: value }));
  };

  const SecuritySection = ({ title, items }) => (
    <View style={dynamicStyles.section}>
      <ThemedText style={dynamicStyles.sectionTitle}>{title}</ThemedText>
      {items.map((item, index) => (
        <TouchableOpacity key={index} style={dynamicStyles.settingItem} onPress={item.onPress}>
          <item.icon name={item.iconName} size={24} color={accentColor} style={dynamicStyles.settingIcon} />
          <View style={dynamicStyles.settingContent}>
            <ThemedText style={dynamicStyles.settingLabel}>{item.label}</ThemedText>
            <ThemedText style={dynamicStyles.settingDescription}>{item.description}</ThemedText>
            {item.currentValue && (
              <ThemedText style={dynamicStyles.currentValue}>{item.currentValue}</ThemedText>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>
      ))}
    </View>
  );

  const privacyItems = [
    {
      label: 'Profile Visibility',
      description: 'Control who can see your profile',
      icon: Ionicons,
      iconName: 'eye',
      currentValue: privacy.profileVisibility.charAt(0).toUpperCase() + privacy.profileVisibility.slice(1),
      onPress: () => {
        Alert.alert(
          'Profile Visibility',
          'Choose who can see your profile:',
          [
            { text: 'Public', onPress: () => updateProfileVisibility('public') },
            { text: 'Followers', onPress: () => updateProfileVisibility('followers') },
            { text: 'Friends', onPress: () => updateProfileVisibility('friends') },
            { text: 'Private', onPress: () => updateProfileVisibility('private') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    },
    {
      label: 'Message Permissions',
      description: 'Who can send you direct messages',
      icon: Ionicons,
      iconName: 'chatbubble',
      currentValue: privacy.allowMessages.charAt(0).toUpperCase() + privacy.allowMessages.slice(1),
      onPress: () => {
        Alert.alert(
          'Message Permissions',
          'Choose who can send you messages:',
          [
            { text: 'Everyone', onPress: () => updateMessageSettings('everyone') },
            { text: 'Followers', onPress: () => updateMessageSettings('followers') },
            { text: 'Friends', onPress: () => updateMessageSettings('friends') },
            { text: 'Nobody', onPress: () => updateMessageSettings('none') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    },
  ];

  const securityItems = [
    {
      label: 'Change Password',
      description: 'Update your account password',
      icon: Ionicons,
      iconName: 'lock-closed',
      onPress: () => {
        Alert.alert(
          'Change Password',
          'This will navigate you to the password change screen.',
          [{ text: 'OK' }]
        );
      }
    },
    {
      label: 'Two-Factor Authentication',
      description: 'Add an extra layer of security',
      icon: Ionicons,
      iconName: 'shield-checkmark',
      onPress: () => {
        Alert.alert(
          'Two-Factor Authentication',
          'Set up 2FA for enhanced security.',
          [{ text: 'Set Up' }]
        );
      }
    },
    {
      label: 'Login Sessions',
      description: 'Manage your active login sessions',
      icon: Ionicons,
      iconName: 'laptop',
      onPress: () => {
        Alert.alert(
          'Login Sessions',
          'View and manage where your account is logged in.',
          [{ text: 'View Sessions' }]
        );
      }
    },
    {
      label: 'Blocked Users',
      description: 'Manage your blocked accounts',
      icon: Ionicons,
      iconName: 'person-remove',
      onPress: () => {
        Alert.alert(
          'Blocked Users',
          'View and manage users you have blocked.',
          [{ text: 'View Blocked' }]
        );
      }
    },
  ];

  const dataItems = [
    {
      label: 'Download Your Data',
      description: 'Request a copy of your data',
      icon: Ionicons,
      iconName: 'download',
      onPress: () => {
        Alert.alert(
          'Download Data',
          'Request a download of your account data. This may take several days.',
          [{ text: 'Request Download' }]
        );
      }
    },
    {
      label: 'Data Deletion',
      description: 'Permanently delete your data',
      icon: Ionicons,
      iconName: 'trash',
      onPress: () => {
        Alert.alert(
          'Delete Data',
          'This will permanently delete all your account data. This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Data Deletion', 'Data deletion requested.') },
          ]
        );
      }
    },
  ];

  return (
    <ThemedView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={dynamicStyles.headerTitle}>Privacy & Security</ThemedText>
        <View style={dynamicStyles.headerButton} />
      </View>

      <ScrollView style={dynamicStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Privacy Settings */}
        <SecuritySection title="Privacy Settings" items={privacyItems} />

        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.settingItem}>
            <View style={dynamicStyles.settingContent}>
              <ThemedText style={dynamicStyles.settingLabel}>Show Online Status</ThemedText>
              <ThemedText style={dynamicStyles.settingDescription}>Let others see when you're online</ThemedText>
            </View>
            <Switch
              value={privacy.showOnlineStatus}
              onValueChange={() => togglePrivacy('showOnlineStatus')}
              trackColor={{ false: '#767577', true: accentColor }}
              thumbColor={privacy.showOnlineStatus ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={dynamicStyles.settingItem}>
            <View style={dynamicStyles.settingContent}>
              <ThemedText style={dynamicStyles.settingLabel}>Allow Photo Tagging</ThemedText>
              <ThemedText style={dynamicStyles.settingDescription}>Let others tag you in photos</ThemedText>
            </View>
            <Switch
              value={privacy.allowTagging}
              onValueChange={() => togglePrivacy('allowTagging')}
              trackColor={{ false: '#767577', true: accentColor }}
              thumbColor={privacy.allowTagging ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Security Settings */}
        <SecuritySection title="Security Settings" items={securityItems} />

        {/* Data & Privacy */}
        <SecuritySection title="Data & Privacy" items={dataItems} />

        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.settingItem}>
            <View style={dynamicStyles.settingContent}>
              <ThemedText style={dynamicStyles.settingLabel}>Data Collection</ThemedText>
              <ThemedText style={dynamicStyles.settingDescription}>Allow app to collect usage data for improvements</ThemedText>
            </View>
            <Switch
              value={privacy.dataCollection}
              onValueChange={() => togglePrivacy('dataCollection')}
              trackColor={{ false: '#767577', true: accentColor }}
              thumbColor={privacy.dataCollection ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={dynamicStyles.settingItem}>
            <View style={dynamicStyles.settingContent}>
              <ThemedText style={dynamicStyles.settingLabel}>Analytics</ThemedText>
              <ThemedText style={dynamicStyles.settingDescription}>Help improve our app with anonymous analytics</ThemedText>
            </View>
            <Switch
              value={privacy.analytics}
              onValueChange={() => togglePrivacy('analytics')}
              trackColor={{ false: '#767577', true: accentColor }}
              thumbColor={privacy.analytics ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Help */}
        <View style={dynamicStyles.helpSection}>
          <Ionicons name="information-circle" size={20} color={accentColor} />
          <ThemedText style={dynamicStyles.helpText}>
            Your privacy is important to us. Changes to privacy settings are applied immediately.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
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
  scrollContent: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingIcon: { marginRight: 12 },
  settingContent: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '500' },
  settingDescription: { fontSize: 14, color: '#666', marginTop: 2 },
  currentValue: { fontSize: 14, color: accentColor, marginTop: 4, fontWeight: '600' },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: cardColor,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  helpText: { flex: 1, fontSize: 14, color: '#888', marginLeft: 12, lineHeight: 20 },
});

export default PrivacySecurityScreen;
