import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

const SettingsScreen = () => {
  const router = useRouter();

  const [wordFrequency, setWordFrequency] = useState<number>(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // AsyncStorage'dan kelime sıklığını yükle
  useEffect(() => {
    const loadFrequency = async () => {
      try {
        const freq = await AsyncStorage.getItem('wordFrequency');
        if (freq !== null) {
          setWordFrequency(parseInt(freq, 10));
        }
      } catch (e) {
        console.error('Kelime sıklığı yüklenemedi', e);
      }
    };
    loadFrequency();
  }, []);

  // Kelime sıklığını kaydet
  const saveFrequency = async (value: number) => {
    setWordFrequency(value);
    try {
      await AsyncStorage.setItem('wordFrequency', value.toString());
    } catch (e) {
      console.error('Kelime sıklığı kaydedilemedi', e);
    }
  };

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

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Hata', 'Lütfen mevcut ve yeni şifreyi girin.');
      return;
    }

    setLoading(true);
    const user = auth.currentUser;
    if (!user || !user.email) {
      Alert.alert('Hata', 'Kullanıcı bulunamadı.');
      setLoading(false);
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    try {
      // Yeniden doğrulama
      await reauthenticateWithCredential(user, credential);
      // Şifre güncelleme
      await updatePassword(user, newPassword);
      Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi.');
      setModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Hata', error.message || 'Şifre değiştirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ayarlar</Text>

      <View style={styles.frequencyContainer}>
        <Text style={styles.label}>Kelime Sıklığı: {wordFrequency} / 10</Text>
        <Slider
          style={{ width: 250, height: 40 }}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={wordFrequency}
          minimumTrackTintColor="#3A86FF"
          maximumTrackTintColor="#ccc"
          onValueChange={saveFrequency}
        />
      </View>

      <TouchableOpacity style={styles.changePasswordButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="key-outline" size={24} color="#3A86FF" />
        <Text style={styles.changePasswordText}>Şifre Değiştir</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#3A86FF" />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Şifre değiştirme modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Şifre Değiştir</Text>
            <TextInput
              placeholder="Mevcut Şifre"
              secureTextEntry
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              placeholder="Yeni Şifre"
              secureTextEntry
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <View style={styles.modalButtons}>
              <Button title="İptal" onPress={() => setModalVisible(false)} />
              <Button title={loading ? "Bekleyin..." : "Kaydet"} onPress={handlePasswordChange} disabled={loading} />
            </View>
          </View>
        </View>
      </Modal>
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
  frequencyContainer: {
    width: '80%',
    marginBottom: 40,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  changePasswordButton: {
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
    marginBottom: 20,
  },
  changePasswordText: {
    color: '#3A86FF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
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
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#3A86FF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
