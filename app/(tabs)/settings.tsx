import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Kullanıcı çıkış yaptı.");
      router.replace('/login');
    } catch (error) {
      console.error("Çıkış hatası:", error);
      Alert.alert("Hata", "Çıkış yapılamadı.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ayarlar</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#3A86FF" />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    fontSize: 30,
    fontWeight: '700',
    color: '#3A86FF',
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#3A86FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutText: {
    color: '#3A86FF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
});
