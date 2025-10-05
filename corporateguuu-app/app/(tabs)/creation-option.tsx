import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function CreationOptionScreen() {
  const [showRiskType, setShowRiskType] = useState(false);

  const handleGroupChallenge = () => {
    // Navigate to Create_Group_Challenge
    console.log('Navigate to Create_Group_Challenge');
  };

  const handleOneVOne = () => {
    setShowRiskType(true);
    // Navigate to 1v1 challenge creation or show risk type
    console.log('Show Risk Type for 1v1');
  };

  const handleDoADare = () => {
    // Navigate to Create_Dare_Challenge
    console.log('Navigate to Create_Dare_Challenge');
  };

  const handleSendStones = () => {
    // Navigate to Create_Stones_Challenge
    console.log('Navigate to Create_Stones_Challenge');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - same as Creation Home */}
      <View style={styles.header}>
        <View style={styles.logoAndProfile}>
          <Text style={styles.logo}>Abstrac</Text>
          <View style={styles.profilePic}>
            <Text style={styles.profileEmoji}>👤</Text>
          </View>
        </View>
        <View style={styles.balanceContainer}>
          <View style={styles.stonesBadge}>
            <Text style={styles.stonesText}>∘ 10</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Challenge Structure Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge Structure</Text>

          {/* Group Button */}
          <TouchableOpacity style={styles.challengeButton} onPress={handleGroupChallenge}>
            <Text style={styles.challengeButtonText}>Group</Text>
          </TouchableOpacity>

          {/* 1v1 Button */}
          <TouchableOpacity style={styles.challengeButton} onPress={handleOneVOne}>
            <Text style={styles.challengeButtonText}>1v1</Text>
          </TouchableOpacity>

          {/* Risk Type - only visible after 1v1 button press */}
          {showRiskType && (
            <View style={styles.riskTypeSection}>
              <Text style={styles.riskTypeTitle}>Risk Type</Text>

              {/* Do a Dare Button */}
              <TouchableOpacity style={styles.riskButton} onPress={handleDoADare}>
                <Text style={styles.riskButtonEmoji}>🎯</Text>
                <Text style={styles.riskButtonText}>Do a Dare</Text>
              </TouchableOpacity>

              {/* Send Stones Button */}
              <TouchableOpacity style={styles.riskButton} onPress={handleSendStones}>
                <Text style={styles.riskButtonEmoji}>💎</Text>
                <Text style={styles.riskButtonText}>Send Stones</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
  },
  logoAndProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 20,
  },
  balanceContainer: {
    alignItems: 'flex-end',
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
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  challengeButton: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  challengeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  riskTypeSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
  },
  riskTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  riskTypeSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
  },
  riskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 12,
  },
  riskButtonEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  riskButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});
