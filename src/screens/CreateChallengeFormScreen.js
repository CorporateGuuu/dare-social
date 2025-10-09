import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Animated, FlatList, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { AuthContext } from '../context/AuthContext';
import { useModalAnimation } from '../hooks/useAnimations';
import { searchUsers } from '../lib/firebase';

const CreateChallengeFormScreen = ({ isVisible, onClose }) => {
  const { user } = useContext(AuthContext);
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { stakes: '25' },
  });
  const [isGroup, setIsGroup] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [selectedOpponents, setSelectedOpponents] = useState([]);
  const [payouts, setPayouts] = useState(['1st', '2nd', '3rd', 'Last']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fadeAnim, scaleAnim } = useModalAnimation(isVisible);

  const onSubmit = async (data) => {
    // Check opponent funds
    const opponents = isGroup ? selectedOpponents : [data.opponent];
    const stakes = parseInt(data.stakes);

    for (const username of opponents) {
      try {
        const result = await searchUsers({ query: username });
        const opponentData = result.data && result.data.find(u => u.username === username);
        if (!opponentData || opponentData.stoneBalance < stakes) {
          Alert.alert(
            "Insufficient Funds",
            "One or more opponents do not have sufficient stones to wager."
          );
          return;
        }
      } catch (error) {
        Alert.alert("Error", "Unable to verify opponent funds. Please try again.");
        return;
      }
    }

    setIsSubmitting(true);
    const challengeData = {
      ...data,
      type: isGroup ? 'group' : '1v1',
      opponents: opponents,
      expiration: expirationDate.toISOString(),
      creator: user.username,
      payouts: isGroup ? payouts.reduce((acc, pos, idx) => ({ ...acc, [pos]: data[pos] || '' }), {}) : {},
      votingWindow: parseInt(data.votingWindow), // Add voting window in hours
    };
    console.log('Challenge Data:', challengeData);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  const addPayout = () => setPayouts([...payouts, `${payouts.length + 1}th`]);
  const removePayout = (index) => setPayouts(payouts.filter((_, i) => i !== index));
  const toggleOpponent = (username) => {
    setSelectedOpponents((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]
    );
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.modal}>
      <Animated.View style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}>
        <ScrollView>
          <Text style={styles.title}>Create Challenge</Text>

          <View style={styles.row}>
            <Text style={styles.label}>1v1</Text>
            <Switch value={isGroup} onValueChange={setIsGroup} trackColor={{ true: '#00FF00' }} />
            <Text style={styles.label}>Group</Text>
          </View>

          <Controller
            control={control}
            name="title"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Challenge Title"
                placeholderTextColor="#888"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.title && <Text style={styles.error}>Title is required</Text>}

          {isGroup ? (
            <View style={styles.section}>
              <Text style={styles.label}>Select Members</Text>
              <FlatList
                data={user?.followers || []}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.opponentItem,
                      selectedOpponents.includes(item.username) && styles.selected,
                    ]}
                    onPress={() => toggleOpponent(item.username)}
                  >
                    <Text style={styles.opponentText}>{item.username}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.username}
              />
            </View>
          ) : (
            <Controller
              control={control}
              name="opponent"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Opponent" value="" />
                  {user?.followers.map((follower) => (
                    <Picker.Item key={follower.username} label={follower.username} value={follower.username} />
                  ))}
                </Picker>
              )}
            />
          )}
          {errors.opponent && <Text style={styles.error}>Opponent is required</Text>}

          <Controller
            control={control}
            name="stakes"
            rules={{
              required: true,
              pattern: /^[0-9]+$/,
              min: { value: 10, message: 'Minimum 10 stones' }
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Stakes (min 10)"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.stakes && <Text style={styles.error}>{errors.stakes.message || 'Valid stakes required'}</Text>}

          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>
              Expiration: {expirationDate.toLocaleString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={expirationDate}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setExpirationDate(selectedDate);
              }}
            />
          )}

          <Controller
            control={control}
            name="votingWindow"
            rules={{
              required: true,
              pattern: /^[0-9]+$/,
              min: { value: 1, message: 'Minimum 1 hour' }
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Voting Window (hours)"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.votingWindow && <Text style={styles.error}>{errors.votingWindow.message || 'Valid voting window required'}</Text>}

          {isGroup && (
            <View style={styles.section}>
              <Text style={styles.label}>Payout & Punishment</Text>
              {payouts.map((pos, index) => (
                <View key={pos} style={styles.payoutRow}>
                  <Controller
                    control={control}
                    name={pos}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={styles.input}
                        placeholder={`${pos} (e.g., 8 x 20 = 160)`}
                        placeholderTextColor="#888"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  <TouchableOpacity onPress={() => removePayout(index)} style={styles.removeButton}>
                    <Text style={styles.removeText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={addPayout}>
                <Text style={styles.addText}>Add Position</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Create Challenge</Text>}
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// Styles unchanged
const styles = StyleSheet.create({
  modal: { margin: 0, justifyContent: 'center' },
  container: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 20, maxHeight: '90%' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  label: { color: 'white', fontSize: 16, marginHorizontal: 10 },
  input: { backgroundColor: '#2A2A2A', color: 'white', padding: 15, borderRadius: 20, marginBottom: 10 },
  picker: { backgroundColor: '#2A2A2A', color: 'white', borderRadius: 20, marginBottom: 10 },
  section: { marginVertical: 20 },
  opponentItem: { backgroundColor: '#3A3A3A', padding: 10, borderRadius: 10, marginBottom: 5 },
  selected: { backgroundColor: '#00FF00' },
  opponentText: { color: 'white' },
  dateText: { color: 'white' },
  error: { color: 'red', marginBottom: 10 },
  payoutRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  removeButton: { backgroundColor: '#FF0000', padding: 5, borderRadius: 10, marginLeft: 10 },
  removeText: { color: 'white', fontSize: 12 },
  addButton: { backgroundColor: '#3A3A3A', padding: 10, borderRadius: 20, alignItems: 'center' },
  addText: { color: 'white' },
  submitButton: { backgroundColor: '#00FF00', padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});

export default CreateChallengeFormScreen;
