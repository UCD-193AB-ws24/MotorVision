import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // <- Optional for glass look

const { height } = Dimensions.get('window');

export default function FriendProfileModal({ visible, onClose, friend }) {
  if (!friend) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <BlurView intensity={60} tint="dark" style={styles.modal}>
              <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <Ionicons name="close" size={26} color="#fff" />
              </TouchableOpacity>

              {friend.location.profileImage ? (
                <Image source={{ uri: friend.location.profileImage }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="person-circle-outline" size={90} color="#aaa" />
                </View>
              )}

              <Text style={styles.name}>{friend.name}</Text>
              <Text style={styles.email}>{friend.email}</Text>

              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={18} color="#aaa" />
                <Text style={styles.locationText}>
                  {friend.location.lat.toFixed(4)}, {friend.location.lng.toFixed(4)}
                </Text>
              </View>
            </BlurView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    height: height * 0.45,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'android' ? 'rgba(30,30,30,0.9)' : 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  imagePlaceholder: {
    marginTop: 20,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  email: {
    fontSize: 15,
    color: '#ccc',
    marginTop: 4,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#aaa',
  },
});
