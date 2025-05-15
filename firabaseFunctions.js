import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

// Email/şifre ile kayıt
  const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  };
  
  const addUserToFirestore = async (name, surname, email) => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        name: name,
        surname: surname,
        email: email,
        createdAt: new Date(),
      });
      console.log('Kullanıcı verisi başarıyla kaydedildi: ', docRef.id);
      
      return docRef.id; // Yeni eklenen kullanıcının ID'sini döndürüyoruz
    } catch (error) {
      console.error('Kullanıcı verisi eklenirken hata oluştu: ', error);
    }
  }
  // Veri ekleme
  const addData = async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error('Veri ekleme hatası:', error);
      throw error;
    }
  };
  
  /* 
  // Dosya yükleme
  const uploadFile = async (file, path) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      return snapshot.ref;
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      throw error;
    }
  }; 
  */

  export { addUserToFirestore, addData, signUp };