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
import * as FileSystem from 'expo-file-system';


// services/wordService.tsx
export type Word = {
  kelime: string;
  anlami: string;
  createdAt?: Timestamp;
  correctCount?: number;
  imagePath?: string | null;
  tempId: string;
};

export const addWord = async (
  english: string,
  turkish: string,
  imagePath?: string
): Promise<void> => {
  const user = auth.currentUser;

  if (!user) throw new Error('Giriş yapmalısınız!');

  const wordsRef = collection(db, 'users', user.uid, 'words');
  const now = new Date();

  await addDoc(wordsRef, {
    english: english.trim(),
    turkish: turkish.trim(),
    correctCount: 0,
    createdAt: serverTimestamp(),
    nextReview: Timestamp.fromDate(now),
    imagePath: imagePath || null,
  });
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
        correctCount: data.correctCount ?? 0,
        imagePath: data.imagePath || null,
        tempId: doc.id, // 🔑 Firestore belgesinin ID'si
      };
    });

  } catch (error) {
    console.error('🔍 Firestore Hatası:', error);
    throw new Error(error instanceof Error ? error.message : 'Kelimeler çekilirken beklenmedik bir hata 🚨');
  }
};


export const deleteWord = async (wordId: string): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Giriş yapmadan kelime silemezsiniz! 🔒');
    }

    // Kelimeyi Firestore'dan sil
    const wordDocRef = doc(db, 'users', user.uid, 'words', wordId);
    await deleteDoc(wordDocRef);
    console.log(`🗑 Kelime silindi: ${wordId}`);

    // Resmi cihazdan silme (Bu kısmı kaldırdık)

  } catch (error) {
    console.error('❌ Silme Hatası:', error);
    throw new Error(error instanceof Error ? error.message : 'Kelime silinirken hata oluştu');
  }
};
