import { db, auth } from '../../firebaseConfig';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';

// services/wordService.tsx
export interface Word {
  kelime: string;
  anlami: string;
  createdAt?: Timestamp;
  tempId?: string; // <-- Bu satırı ekleyin
}

// KELİME EKLEME FONKSİYONU
export const addWord = async (english: string, turkish: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('Lütfen önce giriş yapınız! 🔒');
    }

    // Boş giriş kontrolü
    const trimmedEnglish = english.trim();
    const trimmedTurkish = turkish.trim();
    if (!trimmedEnglish || !trimmedTurkish) {
      throw new Error('❌ Hem İngilizce hem Türkçe alanları doldurun!');
    }

    // Firestore'a ekleme
    const wordsRef = collection(db, 'users', user.uid, 'words');
    const docRef = await addDoc(wordsRef, {
      english: trimmedEnglish,
      turkish: trimmedTurkish,
      createdAt: serverTimestamp()
    });

    console.log('✅ Kelime eklendi. ID:', docRef.id);

  } catch (error) {
    console.error('🔥 Hata Detayı:', error);
    throw new Error(error instanceof Error ? error.message : 'Kelime eklenirken teknik bir hata oluştu 🛠');
  }
};

// KELİMELERİ ÇEKME FONKSİYONU
export const getWordsSimple = async (): Promise<Word[]> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('⚠️ Oturumunuz açık değil!');
    }

    // Firestore sorgusu - Basitleştirilmiş versiyon
    const wordsRef = collection(db, 'users', user.uid, 'words');
    const q = query(wordsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);

    // Dokümanları işleme
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        kelime: data.english || 'Bilinmeyen Kelime',
        anlami: data.turkish || 'Bilinmeyen Anlam',
        createdAt: data.createdAt
      };
    });

  } catch (error) {
    console.error('🔍 Firestore Hatası:', error);
    throw new Error(error instanceof Error ? error.message : 'Kelimeler çekilirken beklenmedik bir hata 🚨');
  }
};