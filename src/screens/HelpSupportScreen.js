import React, { useContext, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useThemeColor } from '../../hooks/use-theme-color';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';

const HelpSupportScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');

  const dynamicStyles = getDynamicStyles(backgroundColor, cardColor, textColor, accentColor);

  const handleEmail = () => {
    const email = 'support@dare-social.com';
    const subject = 'Support Request from Dare Social App';
    const body = `Hello Dare Social Support Team,\n\nI need help with...\n\nUser ID: ${user?.id || 'N/A'}\nUsername: ${user?.username || 'N/A'}\n\nPlease describe the issue below:\n\n`;

    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.canOpenURL(emailUrl).then(supported => {
      if (supported) {
        Linking.openURL(emailUrl);
      } else {
        Alert.alert('Error', 'Unable to open email client. Please email support@dare-social.com directly.');
      }
    });
  };

  const handleFAQ = (category) => {
    // This would navigate to a FAQ screen or open a modal
    Alert.alert(
      'FAQ Coming Soon',
      `This would show FAQs for: ${category}`,
      [{ text: 'OK' }]
    );
  };

  const SupportSection = ({ title, items }) => (
    <View style={dynamicStyles.section}>
      <ThemedText style={dynamicStyles.sectionTitle}>{title}</ThemedText>
      {items.map((item, index) => (
        <TouchableOpacity key={index} style={dynamicStyles.settingItem} onPress={item.onPress}>
          <item.icon name={item.iconName} size={24} color={accentColor} style={dynamicStyles.settingIcon} />
          <View style={dynamicStyles.settingContent}>
            <ThemedText style={dynamicStyles.settingLabel}>{item.label}</ThemedText>
            <ThemedText style={dynamicStyles.settingDescription}>{item.description}</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>
      ))}
    </View>
  );

  const contactItems = [
    {
      label: 'Email Support',
      description: 'Send us an email and we\'ll get back to you within 24 hours',
      icon: Ionicons,
      iconName: 'mail',
      onPress: handleEmail
    },
    {
      label: 'Community Forum',
      description: 'Join our community to ask questions and share ideas',
      icon: Ionicons,
      iconName: 'people',
      onPress: () => Linking.openURL('https://community.dare-social.com')
    },
    {
      label: 'Live Chat',
      description: 'Chat with our support team (available during business hours)',
      icon: Ionicons,
      iconName: 'chatbubble-ellipses',
      onPress: () => Alert.alert('Live Chat', 'Live chat feature coming soon!')
    },
  ];

  const faqItems = [
    {
      label: 'Getting Started',
      description: 'How to create dares, challenge friends, and earn stones',
      icon: Ionicons,
      iconName: 'rocket',
      onPress: () => handleFAQ('Getting Started')
    },
    {
      label: 'Challenges & Dares',
      description: 'Learn how challenges work and how to participate',
      icon: Ionicons,
      iconName: 'flame',
      onPress: () => handleFAQ('Challenges & Dares')
    },
    {
      label: 'Account & Profile',
      description: 'Manage your account settings and profile information',
      icon: Ionicons,
      iconName: 'person',
      onPress: () => handleFAQ('Account & Profile')
    },
    {
      label: 'Stones & Wallet',
      description: 'Understanding stones, rewards, and wallet features',
      icon: Ionicons,
      iconName: 'wallet',
      onPress: () => handleFAQ('Stones & Wallet')
    },
    {
      label: 'Safety & Privacy',
      description: 'Keeping your account safe and your data private',
      icon: Ionicons,
      iconName: 'shield-checkmark',
      onPress: () => handleFAQ('Safety & Privacy')
    },
    {
      label: 'Troubleshooting',
      description: 'Common issues and how to fix them',
      icon: Ionicons,
      iconName: 'construct',
      onPress: () => handleFAQ('Troubleshooting')
    },
  ];

  const legalItems = [
    {
      label: 'Terms of Service',
      description: 'Read our terms and conditions',
      icon: Ionicons,
      iconName: 'document-text',
      onPress: () => Linking.openURL('https://dare-social.com/terms')
    },
    {
      label: 'Privacy Policy',
      description: 'Learn how we protect your data',
      icon: Ionicons,
      iconName: 'lock-closed',
      onPress: () => Linking.openURL('https://dare-social.com/privacy')
    },
    {
      label: 'Community Guidelines',
      description: 'Rules for using Dare Social safely and respectfully',
      icon: Ionicons,
      iconName: 'book',
      onPress: () => Linking.openURL('https://dare-social.com/guidelines')
    },
  ];

  const appItems = [
    {
      label: 'App Version',
      description: 'Dare Social v1.0.0 (build 12345)',
      icon: Ionicons,
      iconName: 'information-circle',
      onPress: () => {}
    },
    {
      label: 'Rate App',
      description: 'Leave a review on the App Store',
      icon: Ionicons,
      iconName: 'star',
      onPress: () => Linking.openURL('https://apps.apple.com/app/dare-social/id1234567890')
    },
    {
      label: 'Report Bug',
      description: 'Found an issue? Help us improve by reporting it',
      icon: Ionicons,
      iconName: 'bug',
      onPress: () => Alert.alert(
        'Report Bug',
        'Please include:\n1. What were you doing when the issue occurred?\n2. What did you expect to happen?\n3. What actually happened?\n4. Any error messages you saw',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Report', onPress: handleEmail }
        ]
      )
    },
  ];

  return (
    <ThemedView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={dynamicStyles.headerTitle}>Help & Support</ThemedText>
        <View style={dynamicStyles.headerButton} />
      </View>

      <ScrollView style={dynamicStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Emergency Contact */}
        <View style={dynamicStyles.emergencySection}>
          <Ionicons name="warning" size={24} color="#FF6666" style={dynamicStyles.emergencyIcon} />
          <View style={dynamicStyles.emergencyContent}>
            <ThemedText style={dynamicStyles.emergencyTitle}>Need urgent help?</ThemedText>
            <ThemedText style={dynamicStyles.emergencyText}>
              If you or someone you know is in immediate danger, please contact emergency services directly.
            </ThemedText>
            <TouchableOpacity style={dynamicStyles.emergencyButton}>
              <ThemedText style={dynamicStyles.emergencyButtonText}>Emergency Services: 911</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Support */}
        <SupportSection title="Contact Support" items={contactItems} />

        {/* Frequently Asked */}
        <SupportSection title="Frequently Asked Questions" items={faqItems} />

        {/* Legal */}
        <SupportSection title="Legal & Policies" items={legalItems} />

        {/* App Information */}
        <SupportSection title="App Information" items={appItems} />

        {/* Additional Help */}
        <View style={dynamicStyles.helpSection}>
          <Ionicons name="heart" size={20} color={accentColor} />
          <ThemedText style={dynamicStyles.helpText}>
            We're here to help! Our support team is committed to making your Dare Social experience amazing. If you can't find what you're looking for, don't hesitate to reach out.
          </ThemedText>
        </View>

        {/* Social Links */}
        <View style={dynamicStyles.section}>
          <ThemedText style={dynamicStyles.sectionTitle}>Follow Us</ThemedText>
          <View style={dynamicStyles.socialLinks}>
            <TouchableOpacity style={dynamicStyles.socialButton}>
              <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.socialButton}>
              <Ionicons name="logo-instagram" size={24} color="#E1306C" />
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.socialButton}>
              <Ionicons name="logo-discord" size={24} color="#5865F2" />
            </TouchableOpacity>
          </View>
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
  emergencySection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: cardColor,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6666',
  },
  emergencyIcon: { marginRight: 12, marginTop: 2 },
  emergencyContent: { flex: 1 },
  emergencyTitle: { fontSize: 16, fontWeight: 'bold', color: '#FF6666', marginBottom: 4 },
  emergencyText: { fontSize: 14, color: '#888', marginBottom: 12, lineHeight: 20 },
  emergencyButton: {
    backgroundColor: '#FF6666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  emergencyButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
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
  socialLinks: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HelpSupportScreen;
