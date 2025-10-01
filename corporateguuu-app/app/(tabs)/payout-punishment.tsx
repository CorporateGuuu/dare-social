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

const positions = ['1st', '2nd', '3rd', '4th', 'Last'];
const calculation = '8 x 20 = 160';

export default function PayoutPunishmentScreen() {
  const [selectedPosition, setSelectedPosition] = useState('1st');
  const [punishments, setPunishments] = useState({
    '1st': '',
    '2nd': '',
    '3rd': '',
    '4th': '',
    'Last': '',
  });

  const handleAgree = () => {
    console.log('Agreed to terms:', punishments);
  };

  const handlePunishmentChange = (position: string, value: string) => {
    setPunishments(prev => ({
      ...prev,
      [position]: value,
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.balanceContainer}>
          <View style={styles.stonesBadge}>
            <Text style={styles.stonesText}>∘ 10</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>Payout & Punishment</Text>
          <Text style={styles.calculationText}>{calculation}</Text>
        </View>

        {/* Position Tabs */}
        <View style={styles.tabsContainer}>
          {positions.map((position) => (
            <TouchableOpacity
              key={position}
              style={[
                styles.tabButton,
                selectedPosition === position && styles.activeTab,
              ]}
              onPress={() => setSelectedPosition(position)}
            >
              <Text style={[
                styles.tabText,
                selectedPosition === position && styles.activeTabText,
              ]}>
                {position}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Punishment Inputs */}
        <View style={styles.punishmentsContainer}>
          {positions.map((position) => (
            <View key={position} style={styles.punishmentCard}>
              <Text style={styles.punishmentLabel}>
                {position}
              </Text>
              <TextInput
                style={styles.punishmentInput}
                value={punishments[position as keyof typeof punishments]}
                onChangeText={(value) => handlePunishmentChange(position, value)}
                placeholder="Enter punishment..."
                placeholderTextColor="#666"
              />
            </View>
          ))}
        </View>

        {/* Agree Button */}
        <TouchableOpacity style={styles.agreeButton} onPress={handleAgree}>
          <View style={styles.agreeButtonText}>Agree to Terms</View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
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
    paddingHorizontal: 16,
  },
  titleSection: {
    marginBottom: 20,
  },
  titleText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  calculationText: {
    color: 'white',
    fontSize: 18,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#666',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007bff',
  },
  tabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  punishmentsContainer: {
    gap: 10,
    marginBottom: 30,
  },
  punishmentCard: {
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  punishmentLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    width: 50,
  },
  punishmentInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    padding: 0,
    marginLeft: 10,
  },
  agreeButton: {
    backgroundColor: '#00FF00',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  agreeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
