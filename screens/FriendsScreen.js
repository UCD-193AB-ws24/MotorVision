import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../store/profileStore';

export default function FriendsScreen() {
  const friends = useProfileStore((state) => state.friends);
  const pending = useProfileStore((state) => state.pending);
  const requested = useProfileStore((state) => state.requested);
  const sendRequest = useProfileStore((state) => state.sendRequest);
  const acceptRequest = useProfileStore((state) => state.acceptRequest);
  const declineRequest = useProfileStore((state) => state.declineRequest);
  const removeFriend = useProfileStore((state) => state.removeFriend);
  const hydrateProfile = useProfileStore((state) => state.hydrateProfile);
  const cleanUpRequested = useProfileStore((state) => state.cleanUpRequested);

  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    const hydrateAndClean = async () => {
      await hydrateProfile();
      await cleanUpRequested();
    };
    hydrateAndClean();
  }, []);

  const handleSendRequest = () => {
    if (!emailInput.trim()) {
      Alert.alert('Invalid', 'Please enter an email.');
      return;
    }
    sendRequest(emailInput.trim().toLowerCase());
    setEmailInput('');
    setModalVisible(false);
  };

  const confirmRemoveFriend = (email) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFriend(email) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Friends</Text>

      <Text style={styles.sectionLabel}>Your Friends</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => confirmRemoveFriend(item)}
            delayLongPress={600}
            style={styles.card}
          >
            <Text style={styles.name}>{item}</Text>
            <Text style={styles.pendingText}>Long-press to remove</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionLabel}>Friend Requests</Text>
      <FlatList
        data={pending}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.accept} onPress={() => acceptRequest(item)}>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.decline} onPress={() => declineRequest(item)}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Text style={styles.sectionLabel}>Requests You Sent</Text>
      <FlatList
        data={requested}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item}</Text>
            <Text style={styles.pendingText}>Pending...</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="person-add-outline" size={18} color="#fff" />
        <Text style={styles.addButtonText}>Add Friend</Text>
      </TouchableOpacity>

      {/* Modal for sending friend request */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Friend Request</Text>
            <TextInput
              placeholder="Enter email"
              value={emailInput}
              onChangeText={setEmailInput}
              placeholderTextColor="#888"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSend} onPress={handleSendRequest}>
                <Text style={styles.modalText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionLabel: {
    color: '#bbb',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  pendingText: {
    color: '#888',
    fontSize: 14,
    marginLeft: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  accept: {
    backgroundColor: '#28C76F',
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  decline: {
    backgroundColor: '#EA5455',
    padding: 6,
    borderRadius: 8,
  },
  addButton: {
    marginTop: 30,
    alignSelf: 'center',
    backgroundColor: '#0A84FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancel: {
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalSend: {
    backgroundColor: '#0A84FF',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
