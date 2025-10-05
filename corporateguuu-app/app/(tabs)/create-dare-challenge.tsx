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

export default function CreateDareChallengeScreen() {
  const [claimText, setClaimText] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [isClaimFilled, setIsClaimFilled] = useState(false);
  const [isExpirationFilled, setIsExpirationFilled] = useState(false);

  const handleBackPress = () => {
    // Navigate back
    console.log('Navigate back');
  };

  const handleUseDifferentFrame = () => {
    // Navigate to Dare_Frame_Gallery
    console.log('Navigate to Dare_Frame_Gallery');
  };

  const handleSubmit = () => {
    if (!isClaimFilled || !isExpirationFilled) {
      Alert.alert('Error', 'Please fill in all required information');
      return;
    }
    // Submit the dare challenge
    console.log('Submit dare challenge');
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
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isClaimFilled && isExpirationFilled) ? styles.submitButtonActive : styles.submitButtonInactive
          ]}
          onPress={handleSubmit}
          disabled={!(isClaimFilled && isExpirationFilled)}
        >
          <Text style={[
            styles.submitButtonText,
            (isClaimFilled && isExpirationFilled) ? styles.submitButtonTextActive : styles.submitButtonTextInactive
          ]}>
            Create Dare Challenge
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
});
