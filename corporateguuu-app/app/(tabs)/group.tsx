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

const members = [
  { id: 1, username: '@willsamrick', avatar: '😎' },
  { id: 2, username: '@mattbraun', avatar: '🥸' },
  { id: 3, username: '@haydnthurman', avatar: '🤓' },
  { id: 4, username: '@ethangoode', avatar: '🤑' },
];

export default function GroupScreen() {
  const [buyIn, setBuyIn] = useState('');

  const handleRemoveMember = (id: number) => {
    console.log('Remove member:', id);
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
        <Text style={styles.title}>Fantasy Pool</Text>

        {/* Group Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.groupName}>Group Name: Banana Fantasy Football</Text>
          <Text style={styles.expiresText}>Pool Expires 09/29/25</Text>
        </View>

        {/* Buy-In Input */}
        <View style={styles.buyInSection}>
          <Text style={styles.buyInLabel}>Buy-in</Text>
          <View style={styles.buyInInputContainer}>
            <TextInput
              style={styles.buyInInput}
              value={buyIn}
              onChangeText={setBuyIn}
              placeholder="Enter buy-in amount..."
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Members List */}
        <View style={styles.membersSection}>
          <Text style={styles.membersTitle}>Members</Text>
          {members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <Text style={styles.avatar}>{member.avatar}</Text>
                <Text style={styles.memberName}>{member.username}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveMember(member.id)}
              >
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
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
    padding: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailsSection: {
    marginBottom: 24,
  },
  groupName: {
    color: '#007bff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  expiresText: {
    color: 'white',
    fontSize: 16,
  },
  buyInSection: {
    marginBottom: 32,
  },
  buyInLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buyInInputContainer: {
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buyInInput: {
    color: 'white',
    fontSize: 16,
    padding: 0,
  },
  membersSection: {
    marginBottom: 24,
  },
  membersTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    fontSize: 32,
    marginRight: 16,
  },
  memberName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
