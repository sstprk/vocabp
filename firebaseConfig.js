import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
} from '@env';

// Firebase yapılandırma bilgileriniz
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini başlat
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db};

