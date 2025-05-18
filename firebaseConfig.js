import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase yapılandırma bilgileriniz
const firebaseConfig = {
  apiKey: "AIzaSyCxdN6eHgwTWEIn0KHhOQnNT6lCOnVCAeo",
  authDomain: "wordapp-c94ec.firebaseapp.com",
  projectId: "wordapp-c94ec",
  storageBucket: "wordapp-c94ec.firebasestorage.app",
  messagingSenderId: "210868097339",
  appId: "1:210868097339:ios:5c73891ab884821237e71e"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini başlat
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

