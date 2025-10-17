import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useThemeColor } from '../../hooks/use-theme-color';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';

const NotificationsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');

  const dynamicStyles = getDynamicStyles(backgroundColor, cardColor, textColor, accentColor);

  // Notification settings state
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    challenges: true,
    comments: true,
    likes: false,
    newFollowers: true,
    directMessages: true,
    weeklyRecap: false,
    marketingEmails: false,
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const NotificationSection = ({ title, items }) => (
    <View style={dynamicStyles.section}>
      <ThemedText style={dynamicStyles.sectionTitle}>{title}</ThemedText>
      {items.map((item, index) => (
        <View key={index} style={dynamicStyles.settingItem}>
          <View style={dynamicStyles.settingContent}>
            <ThemedText style={dynamicStyles.settingLabel}>{item.label}</ThemedText>
            <ThemedText style={dynamicStyles.settingDescription}>{item.description}</ThemedText>
          </View>
          <Switch
            value={notifications[item.key]}
            onValueChange={() => toggleNotification(item.key)}
            trackColor={{ false: '#767577', true: accentColor }}
            thumbColor={notifications[item.key] ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      ))}
    </View>
  );

  const pushNotificationItems = [
    {
      label: 'Push Notifications',
      description: 'Receive push notifications on your device',
      key: 'pushNotifications'
    },
    {
      label: 'Challenge Invites',
      description: 'Get notified when someone challenges you',
      key: 'challenges'
    },
    {
      label: 'Comments',
      description: 'Notifications for comments on your posts',
      key: 'comments'
    },
    {
      label: 'Likes & Reactions',
      description: 'Get notified when someone likes your content',
      key: 'likes'
    },
    {
      label: 'New Followers',
      description: 'Notifications when someone follows you',
      key: 'newFollowers'
    },
    {
      label: 'Direct Messages',
      description: 'Notifications for new messages',
      key: 'directMessages'
    },
  ];

  const emailNotificationItems = [
    {
      label: 'Weekly Recap',
      description: 'Weekly summary of your activity and achievements',
      key: 'weeklyRecap'
    },
    {
      label: 'Marketing Emails',
      description: 'Updates about new features and promotions',
      key: 'marketingEmails'
    },
  ];

  return (
    <ThemedView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={dynamicStyles.headerTitle}>Notifications</ThemedText>
        <View style={dynamicStyles.headerButton} />
      </View>

      <ScrollView style={dynamicStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Push Notifications */}
        <NotificationSection
          title="Push Notifications"
          items={pushNotificationItems}
        />

        {/* Email Notifications */}
        <NotificationSection
          title="Email Notifications"
          items={emailNotificationItems}
        />

        {/* Notification Sounds */}
        <View style={dynamicStyles.section}>
          <ThemedText style={dynamicStyles.sectionTitle}>Notification Sounds</ThemedText>

          <TouchableOpacity style={dynamicStyles.settingItem}>
            <Ionicons name="volume-high" size={24} color={accentColor} style={dynamicStyles.settingIcon} />
            <View style={dynamicStyles.settingContent}>
              <ThemedText style={dynamicStyles.settingLabel}>Sound Settings</ThemedText>
              <ThemedText style={dynamicStyles.settingDescription}>Customize notification sounds</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.settingItem}>
            <Ionicons name="musical-notes" size={24} color={accentColor} style={dynamicStyles.settingIcon} />
            <View style={dynamicStyles.settingContent}>
              <ThemedText style={dynamicStyles.settingLabel}>Do Not Disturb</ThemedText>
              <ThemedText style={dynamicStyles.settingDescription}>Schedule quiet hours for notifications</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Notification Testing */}
        <View style={dynamicStyles.section}>
          <ThemedText style={dynamicStyles.sectionTitle}>Test Notifications</ThemedText>

          <TouchableOpacity style={dynamicStyles.testButton}>
            <Ionicons name="notifications" size={20} color="#333" />
            <ThemedText style={dynamicStyles.testButtonText}>Send Test Notification</ThemedText>
          </TouchableOpacity>

          <ThemedText style={dynamicStyles.testDescription}>
            This will send a test notification to verify your settings are working correctly.
          </ThemedText>
        </View>

        {/* Help */}
        <View style={dynamicStyles.helpSection}>
          <Ionicons name="information-circle" size={20} color={accentColor} />
          <ThemedText style={dynamicStyles.helpText}>
            Notification preferences are saved automatically. Changes may take a few minutes to take effect.
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
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: accentColor,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'center',
  },
  testButtonText: { color: '#333', fontWeight: '600', marginLeft: 8, fontSize: 16 },
  testDescription: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },
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

export default NotificationsScreen;
