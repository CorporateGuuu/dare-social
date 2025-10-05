import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function CreateStonesChallengeScreen() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [isStakeFilled, setIsStakeFilled] = useState(false);
  const [isDescriptionFilled, setIsDescriptionFilled] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const isFormComplete = isStakeFilled && isDescriptionFilled;

  const handleSubmit = () => {
    if (!isFormComplete) {
      console.log('Form incomplete');
      return;
    }
    // Submit stones challenge and navigate to tracker_invites
    console.log('Navigate to tracker_invites');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Create Stones Challenge</Text>
        </View>
        <View style={styles.rightItems}>
          <TouchableOpacity
            style={styles.frameButton}
            onPress={() => router.push('/Stones_Frame_Gallery')}
          >
            <Text style={styles.frameButtonText}>Use Different Frame</Text>
          </TouchableOpacity>
          <View style={styles.stonesBadge}>
            <Text style={styles.stonesText}>∘ 10</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Frame Section */}
        <View style={styles.frameContainer}>
          <Text style={styles.sectionLabel}>Challenge Details</Text>

          {/* Stake Amount Input */}
          <Text style={styles.inputLabel}>Stones to Send</Text>
          <TextInput
            style={[
              styles.amountInput,
              !isStakeFilled && styles.requiredInput
            ]}
            placeholder="Enter amount"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            value={stakeAmount}
            onChangeText={(text) => {
              setStakeAmount(text);
              setIsStakeFilled(text.trim().length > 0 && !isNaN(Number(text)));
            }}
          />

          {/* Challenge Description */}
          <Text style={styles.inputLabel}>Challenge Description</Text>
          <TextInput
            style={[
              styles.descriptionInput,
              !isDescriptionFilled && styles.requiredInput
            ]}
            multiline
            placeholder="Describe what needs to be done to win the stones..."
            placeholderTextColor="#ccc"
            value={challengeDescription}
            onChangeText={(text) => {
              setChallengeDescription(text);
              setIsDescriptionFilled(text.trim().length > 5); // Minimum description length
            }}
          />

          {/* Participants Info */}
          <View style={styles.participantsInfo}>
            <Text style={styles.infoText}>
              Winner gets the stones. Loser cannot participate in new challenges for 24 hours.
            </Text>
          </View>
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
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
  sectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 8,
    marginTop: 16,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: 'white',
    backgroundColor: '#333',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: 'white',
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#333',
  },
  requiredInput: {
    borderColor: '#ff6b6b', // Bright red for required fields
    backgroundColor: '#331a1a',
  },
  participantsInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
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
  submitButtonTextSubmit: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButtonTextIncomplete: {
    color: '#ff6b6b', // Same bright color as incomplete placeholders
    fontWeight: 'bold',
  },
  rightItems: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  frameButton: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 12,
  },
  frameButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  stonesBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  stonesText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
