import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase yapılandırma bilgileriniz
const firebaseConfig = {
  apiKey: "AIzaSyCxdN6eHgwTWEIn0KHhOQnNT6lCOnVCAeo", // Bu değerleri kendi Firebase projenize göre güncelleyin
  authDomain: "wordapp-c94ec.firebaseapp.com",
  projectId: "wordapp-c94ec"

};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini başlat
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db};

