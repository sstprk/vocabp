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
  Image,
  Platform,
} from 'react-native';
import { addWord, getWordsSimple, deleteWord, Word } from '../services/wordService';
import { auth } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Timestamp } from 'firebase/firestore';

export default function IndexScreen() {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingWord, setAddingWord] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const router = useRouter();

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

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) {
        Alert.alert('İptal', 'Görsel seçilmedi.');
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      Alert.alert('Hata', 'Görsel seçilirken hata oluştu.');
      return null;
    }
  };

  const onPressPickImage = async () => {
    if (addingWord) return;

    const pickedImage = await handlePickImage();
    if (pickedImage) {
      setSelectedImageUri(pickedImage);
      Alert.alert('✅ Başarılı', 'Görsel seçildi.');
    }
  };

  const handleAddWord = async () => {
    if (!word.trim() || !meaning.trim()) {
      Alert.alert('Uyarı', 'Lütfen İngilizce kelime ve Türkçe anlamını girin!');
      return;
    }

    if (!selectedImageUri) {
      Alert.alert('Uyarı', 'Lütfen önce bir görsel seçin!');
      return;
    }

    try {
      setAddingWord(true);

      // Görseli cihazda saklama
      const fileName = selectedImageUri.split('/').pop() || `${Date.now()}.jpg`;
      const imagesDir = `${FileSystem.documentDirectory}images`;

      const dirInfo = await FileSystem.getInfoAsync(imagesDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
      }

      const newPath = `${imagesDir}/${fileName}`;
      await FileSystem.copyAsync({
        from: selectedImageUri,
        to: newPath,
      });

      // Yeni kelime nesnesi oluştur
      const newWord: Word = {
        kelime: word.trim(),
        anlami: meaning.trim(),
        createdAt: Timestamp.now(),
        tempId: Date.now().toString(),
        imagePath: newPath,
      };

      // Listeye hemen ekle (createdAt gösterimi için)
      setWords(prev => [newWord, ...prev]);

      // Veritabanına ekle
      await addWord(word.trim(), meaning.trim(), newPath);

      // Temizle
      setWord('');
      setMeaning('');
      setSelectedImageUri(null);

      Alert.alert('✅ Başarılı', 'Kelime başarıyla eklendi!');
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Kelime eklenirken bir hata oluştu.');
    } finally {
      setAddingWord(false);
    }
  };

  const handleDelete = (item: Word) => {
    Alert.alert(
      'Silmek istediğine emin misin?',
      `"${item.kelime}" kelimesi silinecek.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWord(item.tempId || item.kelime);
              setWords(prev => prev.filter(w => w !== item));
              Alert.alert('✅ Başarılı', 'Kelime silindi');
            } catch {
              Alert.alert('⛔ Hata', 'Kelime silinemedi');
            }
          },
        },
      ]
    );
  };

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

      {/* Seçilen görsel küçük önizleme */}
      {selectedImageUri && (
        <Image
          source={{ uri: selectedImageUri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      )}

      <TouchableOpacity
        style={[styles.button, addingWord && styles.buttonDisabled]}
        onPress={onPressPickImage}
        disabled={addingWord}
      >
        <Text style={styles.buttonText}>🖼️ Görsel Seç</Text>
      </TouchableOpacity>

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

      <FlatList
        data={words}
        keyExtractor={(item, index) => item.tempId || `word-${index}`}
        renderItem={({ item }) => (
          <View style={styles.wordCard}>
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.wordText}>{item.kelime}</Text>
                <Text style={styles.meaningText}>{item.anlami}</Text>
                {item.createdAt && typeof item.createdAt.toDate === 'function' && (
                  <Text style={styles.dateText}>
                    📅 {item.createdAt.toDate().toLocaleDateString('tr-TR')}
                  </Text>
                )}
              </View>

              {item.imagePath ? (
                <Image
                  source={{ uri: item.imagePath }}
                  style={styles.wordImage}
                  resizeMode="cover"
                />
              ) : null}
            </View>
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
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'center',
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
    position: 'relative',
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
  deleteIcon: {
    position: 'absolute',
    top: 6,
    right: 8,
    zIndex: 1,
    padding: 4,
  },
  deleteText: {
    fontSize: 14,
  },
  wordImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 12,
  },
});
