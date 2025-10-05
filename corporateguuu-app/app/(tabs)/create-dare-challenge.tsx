import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const mockFriends = [
  { id: 1, username: '@winterguy', avatar: '🥶' },
  { id: 2, username: '@smilingguy', avatar: '😊' },
  { id: 3, username: '@gradguy', avatar: '🎓' },
  { id: 4, username: '@foodguy', avatar: '🍔' },
];

export default function CreateDareChallengeScreen() {
  const [claimText, setClaimText] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [punishmentText, setPunishmentText] = useState('');
  const [isClaimFilled, setIsClaimFilled] = useState(false);
  const [isExpirationFilled, setIsExpirationFilled] = useState(false);
  const [isPunishmentFilled, setIsPunishmentFilled] = useState(false);
  const [hasOpponent, setHasOpponent] = useState(false);
  const [opponentUsername, setOpponentUsername] = useState('');

  const handleBackPress = () => {
    router.back();
  };

  const handleUseDifferentFrame = () => {
    router.push('/Dare_Frame_Gallery');
  };

  const isFormComplete = isClaimFilled && isExpirationFilled && hasOpponent && isPunishmentFilled;

  const handleSubmit = () => {
    if (!isFormComplete) {
      Alert.alert('Error', 'Please fill in all required information');
      return;
    }
    router.push('/tracker_invites');
  };

  const handleClaimChange = (text: string) => {
    setClaimText(text);
    setIsClaimFilled(text.trim().length > 0);
  };

  const handleExpirationPress = () => {
    // Open date/time picker
    // For now, just set a sample date
    const today = new Date();
    const sampleDate = today.toLocaleDateString();
    setExpirationDate(sampleDate);
    setIsExpirationFilled(true);
  };

  const currentUser = '👤'; // Current user avatar

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.frameButton} onPress={handleUseDifferentFrame}>
          <Text style={styles.frameButtonText}>Use Different Frame</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Frame Section */}
        <View style={styles.frameContainer}>
          {/* Claim Input */}
          <TextInput
            style={[
              styles.claimInput,
              !isClaimFilled && styles.requiredInput
            ]}
            multiline
            placeholder="I predict..."
            placeholderTextColor="#ccc"
            value={claimText}
            onChangeText={handleClaimChange}
          />

          {/* Lifespan of Bet */}
          <Text style={styles.lifespanLabel}>Lifespan of Bet</Text>
          <TouchableOpacity
            style={[
              styles.dateSelector,
              !isExpirationFilled && styles.requiredInput
            ]}
            onPress={handleExpirationPress}
          >
            <Text style={[
              styles.dateText,
              isExpirationFilled ? styles.filledText : styles.placeholderText
            ]}>
              {isExpirationFilled ? `${new Date().toLocaleDateString()} - ${expirationDate}` : 'Select expiration date'}
            </Text>
          </TouchableOpacity>

          {/* Claimant Section */}
          <View style={styles.claimantRow}>
            <Text style={styles.agreeIcon}>⭕</Text>
            <Text style={styles.claimantAvatar}>{currentUser}</Text>
            <Text style={styles.agreeIcon}>⭕</Text>
          </View>

          {/* Opponent Section */}
          <View style={styles.opponentSection}>
            <TextInput
              style={[
                styles.opponentSearch,
                !hasOpponent && styles.requiredInput
              ]}
              placeholder="add opponent"
              placeholderTextColor="#888"
              value={opponentUsername}
              onChangeText={(text) => {
                setOpponentUsername(text);
                setHasOpponent(text.trim().length > 0);
              }}
            />

            {/* Selected Opponent Display */}
            {hasOpponent && (
              <View style={styles.opponentRow}>
                <Text style={styles.disagreeIcon}>🔄</Text>
                <View style={styles.selectedOpponent}>
                  <Text style={styles.opponentAvatar}>🤓</Text>
                  <Text style={styles.opponentUsername}>{opponentUsername}</Text>
                </View>
                <Text style={styles.disagreeIcon}>🔄</Text>
              </View>
            )}
          </View>
        </View>

        {/* Punishment Section */}
        <View style={styles.punishmentSection}>
          <TextInput
            style={[
              styles.punishmentInput,
              !isPunishmentFilled && styles.requiredInput
            ]}
            multiline
            placeholder="The loser has to..."
            placeholderTextColor="#ccc"
            value={punishmentText}
            onChangeText={(text) => {
              setPunishmentText(text);
              setIsPunishmentFilled(text.trim().length > 0);
            }}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isFormComplete ? styles.submitButtonActive : styles.submitButtonInactive
          ]}
          onPress={handleSubmit}
          disabled={!isFormComplete}
        >
          <Text style={[
            styles.submitButtonText,
            isFormComplete ? styles.submitButtonTextSubmit : styles.submitButtonTextIncomplete
          ]}>
            {isFormComplete ? 'submit' : 'incomplete'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    color: 'white',
  },
  frameButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  frameButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  frameContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  claimInput: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: 'white',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  requiredInput: {
    borderColor: '#ff6b6b', // Bright red for required fields
    backgroundColor: '#331a1a',
  },
  lifespanLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginBottom: 8,
  },
  dateSelector: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#333',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
  },
  filledText: {
    color: 'white',
  },
  placeholderText: {
    color: '#ccc',
  },
  claimantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  agreeIcon: {
    fontSize: 20,
    color: '#666',
    marginHorizontal: 20,
  },
  claimantAvatar: {
    fontSize: 32,
  },
  submitButton: {
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonActive: {
    backgroundColor: '#007bff',
  },
  submitButtonInactive: {
    backgroundColor: '#333',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButtonTextActive: {
    color: 'white',
  },
  submitButtonTextInactive: {
    color: '#666',
  },
  submitButtonTextSubmit: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButtonTextIncomplete: {
    color: '#ff6b6b', // Same bright color as incomplete placeholders
    fontWeight: 'bold',
  },
  punishmentSection: {
    marginBottom: 20,
  },
  punishmentInput: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: 'white',
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: '#2A2A2A',
  },
  opponentSection: {
    marginTop: 20,
  },
  opponentSearch: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: 'white',
    backgroundColor: '#333',
    marginBottom: 15,
  },
  opponentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  disagreeIcon: {
    fontSize: 20,
    color: '#ff6b6b',
    marginHorizontal: 20,
  },
  selectedOpponent: {
    alignItems: 'center',
  },
  opponentAvatar: {
    fontSize: 32,
    marginBottom: 5,
  },
  opponentUsername: {
    fontSize: 14,
    color: '#ccc',
  },
});
