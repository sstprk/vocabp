import { db, auth } from '../../firebaseConfig';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  Timestamp,
  deleteDoc,
  doc // 👈 delete işleminde kullanılacak
} from 'firebase/firestore';

// services/wordService.tsx
export interface Word {
  kelime: string;
  anlami: string;
  createdAt?: Timestamp;
  tempId?: string;
}
export const addWord = async (english: string, turkish: string): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Lütfen önce giriş yapınız! 🔒');
    }

    const trimmedEnglish = english.trim();
    const trimmedTurkish = turkish.trim();

    if (!trimmedEnglish || !trimmedTurkish) {
      throw new Error('❌ Hem İngilizce hem Türkçe alanları doldurun!');
    }

    const wordsRef = collection(db, 'users', user.uid, 'words');

    const now = new Date();

    const docRef = await addDoc(wordsRef, {
      english: trimmedEnglish,
      turkish: trimmedTurkish,
      correctCount: 0,
      createdAt: serverTimestamp(),
      nextReview: Timestamp.fromDate(now), // 🔑 Bu alan eklendi
    });

    console.log('✅ Kelime eklendi. ID:', docRef.id);
  } catch (error) {
    console.error('🔥 Hata Detayı:', error);
    throw new Error(error instanceof Error ? error.message : 'Kelime eklenirken teknik bir hata oluştu 🛠');
  }
};

// 📥 KELİMELERİ ÇEKME FONKSİYONU
export const getWordsSimple = async (): Promise<Word[]> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('⚠️ Oturumunuz açık değil!');
    }

    const wordsRef = collection(db, 'users', user.uid, 'words');
    const q = query(wordsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        kelime: data.english || 'Bilinmeyen Kelime',
        anlami: data.turkish || 'Bilinmeyen Anlam',
        createdAt: data.createdAt,
        tempId: doc.id // 🔑 silme işlemi için ID'yi tempId olarak saklıyoruz
      };
    });

  } catch (error) {
    console.error('🔍 Firestore Hatası:', error);
    throw new Error(error instanceof Error ? error.message : 'Kelimeler çekilirken beklenmedik bir hata 🚨');
  }
};

// ❌ KELİME SİLME FONKSİYONU
export const deleteWord = async (wordId: string): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Giriş yapmadan kelime silemezsiniz! 🔒');
    }

    const wordDocRef = doc(db, 'users', user.uid, 'words', wordId);
    await deleteDoc(wordDocRef);
    console.log(`🗑 Kelime silindi: ${wordId}`);
  } catch (error) {
    console.error('❌ Silme Hatası:', error);
    throw new Error(error instanceof Error ? error.message : 'Kelime silinirken hata oluştu');
  }
};
