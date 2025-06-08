import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { signUp, addUserToFirestore } from "../firabaseFunctions"; 
const LoginScreen = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const signUpHandle = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await addUserToFirestore(name, surname, email);
    Alert.alert("Başarılı", "Kayıt başarılı!");
    router.navigate("/login");
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert("Hata", "Bir hata oluştu. Lütfen tekrar deneyin.");
    } else {
      Alert.alert("Hata", "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vocably</Text>

      <TextInput
        style={styles.input}
        placeholder="Adınız"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Soyadınız"
        placeholderTextColor="#aaa"
        value={surname}
        onChangeText={setSurname}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={() => router.navigate("/login")}>
        <Text style={styles.forgotText}>Zaten hesabın var mı?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={signUpHandle}>
        <Text style={styles.loginButtonText}>Kayıt Ol</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3A86FF',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  forgotText: {
    color: '#888',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#3A86FF',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
