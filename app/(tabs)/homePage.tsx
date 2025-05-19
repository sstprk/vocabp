import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { addWord, getWordsSimple, Word } from '../services/wordService';
import { auth } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

export default function IndexScreen() {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingWord, setAddingWord] = useState(false);
  const router = useRouter();

  // KELİMELERİ YÜKLE VE AUTH DİNLE
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      
      try {
        setLoading(true);
        const data = await getWordsSimple();
        setWords(data);
        console.log('✅ Kelimeler yüklendi');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        Alert.alert('⛔ Hata', errorMessage);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  

  // KELİME EKLEME FONKSİYONU
 const handleAddWord = async () => {
  if (!word.trim() || !meaning.trim()) {
    Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun!');
    return;
  }

  let newWord: Word | null = null; // Üstte tanımla
  
  try {
    setAddingWord(true);
    
    // Optimistik güncelleme için geçici ID
    newWord = {
      kelime: word.trim(),
      anlami: meaning.trim(),
      createdAt: undefined,
      tempId: Date.now().toString() // Ekstra benzersiz tanımlayıcı
    };

    setWords(prev => [newWord!, ...prev]);
    
    await addWord(word, meaning);
    
    setWord('');
    setMeaning('');
    Alert.alert('Başarılı', 'Kelime başarıyla eklendi!');

  } catch (error) {
    // Hata durumunda geçici kelimeyi kaldır
    if (newWord) {
      setWords(prev => prev.filter(item => item.tempId !== newWord!.tempId));
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Teknik hata';
    Alert.alert('Hata', errorMessage);
  } finally {
    setAddingWord(false);
  }
};

  // YÜKLENİYOR DURUMU
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Kelime Defterim</Text>

      {/* INPUT ALANLARI */}
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="İngilizce Kelime"
          placeholderTextColor="#94a3b8"
          value={word}
          onChangeText={setWord}
          editable={!addingWord}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Türkçe Anlamı"
          placeholderTextColor="#94a3b8"
          value={meaning}
          onChangeText={setMeaning}
          editable={!addingWord}
        />
      </View>

      {/* EKLEME BUTONU */}
      <TouchableOpacity
        style={[styles.button, addingWord && styles.buttonDisabled]}
        onPress={handleAddWord}
        disabled={addingWord}
      >
        {addingWord ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>➕ Yeni Kelime Ekle</Text>
        )}
      </TouchableOpacity>

      {/* KELİME LİSTESİ */}
      <FlatList
        data={words}
        keyExtractor={(item, index) => item.tempId || `word-${index}`}
        renderItem={({ item }) => (
          <View style={styles.wordCard}>
            <Text style={styles.wordText}>{item.kelime}</Text>
            <Text style={styles.meaningText}>{item.anlami}</Text>
            {item.createdAt && (
              <Text style={styles.dateText}>
                📅 {item.createdAt.toDate().toLocaleDateString('tr-TR')}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>📭 Henüz kelime eklenmedi</Text>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

// YENİ STİL DÜZENİ
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e3a8a',
    textAlign: 'center',
    marginVertical: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    fontSize: 16,
    color: '#1e293b',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 24,
  },
  wordCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  meaningText: {
    fontSize: 14,
    color: '#475569',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    marginTop: 24,
    fontStyle: 'italic',
  },
});