import * as Haptics from 'expo-haptics'; // For haptic on vote
import { useContext, useState } from 'react';
import { Animated, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { castVote } from '../../corporateguuu-app/src/utils/votingUtils';
import { AuthContext } from '../context/AuthContext';
import { useModalAnimation, useSpringScale } from '../hooks/useAnimations';

const VotingModal = ({ isVisible, onClose, challengeId, proofs }) => {
  const { user } = useContext(AuthContext);
  const [votedProofs, setVotedProofs] = useState(new Set());
  const { fadeAnim, scaleAnim } = useModalAnimation(isVisible);
  const [scaleAnimVote, triggerVoteAnimation] = useSpringScale(1);

  const handleVote = async (proofId, vote) => {
    if (votedProofs.has(proofId)) return;
    await castVote(challengeId, proofId, user.id, vote);
    setVotedProofs(new Set([...votedProofs, proofId]));
    triggerVoteAnimation();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderProof = ({ item }) => (
    <View style={styles.proofCard}>
      <Text style={styles.proofUser}>{item.user.username}</Text>
      <Text style={styles.proofText}>{item.text}</Text>
      {item.image && <Image source={{ uri: item.image }} style={styles.proofImage} />}
      <View style={styles.voteButtons}>
        <TouchableOpacity
          style={[styles.voteButton, styles.yesButton, votedProofs.has(item.id) && styles.voted]}
          onPress={() => handleVote(item.id, 'yes')}
          disabled={votedProofs.has(item.id)}
        >
          <Text style={styles.voteText}>👍 Yes ({item.votes?.yes || 0})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.voteButton, styles.noButton, votedProofs.has(item.id) && styles.voted]}
          onPress={() => handleVote(item.id, 'no')}
          disabled={votedProofs.has(item.id)}
        >
          <Text style={styles.voteText}>👎 No ({item.votes?.no || 0})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={isVisible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.title}>Vote on Proofs</Text>
          <FlatList
            data={proofs}
            renderItem={renderProof}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 20, width: '90%', maxHeight: '80%' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  proofCard: { backgroundColor: '#2A2A2A', padding: 15, borderRadius: 10, marginBottom: 15 },
  proofUser: { color: 'white', fontWeight: 'bold' },
  proofText: { color: '#888', marginVertical: 5 },
  proofImage: { width: 100, height: 100, borderRadius: 10, marginVertical: 5 },
  voteButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  voteButton: { padding: 10, borderRadius: 20, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  yesButton: { backgroundColor: '#00FF00' },
  noButton: { backgroundColor: '#FF0000' },
  voted: { opacity: 0.7 },
  voteText: { color: 'white', fontWeight: 'bold' },
  closeButton: { backgroundColor: '#3A3A3A', padding: 15, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  closeText: { color: 'white' },
});

export default VotingModal;
