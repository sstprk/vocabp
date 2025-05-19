import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { InferenceClient } from '@huggingface/inference';
import { getWordsSimple, Word } from './services/wordService';
import { useNavigation } from '@react-navigation/native';

// Replace with your Hugging Face API key (free tier available)
const client = new InferenceClient(process.env.EXPO_PUBLIC_HUGGING_FACE_API_KEY);

const BrainChain = () => {
  const navigation = useNavigation();
  const [availableWords, setAvailableWords] = useState<Word[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [story, setStory] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [fetchingWords, setFetchingWords] = useState<boolean>(false);

  // Fetch words from database on component mount
  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setFetchingWords(true);
      const words = await getWordsSimple();
      setAvailableWords(words);
    } catch (err) {
      console.error('Error fetching words:', err);
      setError('Kelimeler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setFetchingWords(false);
    }
  };

  const handleWordSelect = (word: string, index: number) => {
    const newSelectedWords = [...selectedWords];
    newSelectedWords[index] = word;
    setSelectedWords(newSelectedWords);
  };

  const handleWordToggle = (word: string) => {
    if (selectedWords.includes(word)) {
      // Remove word if already selected
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else if (selectedWords.length < 5) {
      // Add word if less than 5 words are selected
      setSelectedWords([...selectedWords, word]);
    } else {
      // Show error if trying to select more than 5 words
      setError('En fazla 5 kelime seçebilirsiniz.');
    }
  };

  const generateStory = async () => {
    // Validate inputs
    if (selectedWords.length !== 5) {
      setError('Lütfen tam olarak 5 kelime seçin.');
      return;
    }

    if (selectedWords.some(word => !word.trim())) {
      setError('Lütfen tüm kelime seçimlerini yapın.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Generate story using Cerebras Inference Provider
      const storyResponse = await client.chatCompletion({
        provider: 'hf-inference',
        model: "Qwen/Qwen3-235B-A22B",
        messages: [
          {
            role: 'user',
            content: `Create a short story in Turkish that incorporates these 5 English words: ${selectedWords.join(', ')}. The English words should be capitalized and placed naturally in the Turkish text. The story should be simple and engaging for language learners.`,
          },
        ],
      },
      );
  
      // Yanıt formatını kontrol edin ve uygun şekilde işleyin
      console.log("API yanıtı:", storyResponse.choices[0].message);
  
      // Cerebras API yanıt formatına göre uyarlayın
      const generatedStory = storyResponse.choices[0].message.content;
      if (generatedStory) {
        setStory(generatedStory);
      } else {
        setError('Hikaye oluşturulamadı. Lütfen tekrar deneyin.');
      }

      // Generate image using Fal AI Inference Provider
      const imageResponse = await client.textToImage({
        provider: 'hf-inference',
        model: "black-forest-labs/FLUX.1-dev",
        inputs: `An illustration for a story about: ${selectedWords.join(', ')}`,
        parameters:{ num_inference_steps: 5},
        }
      );

      // Blob'u base64'e dönüştür
      const blob = new Blob([imageResponse]);
      const reader = new FileReader();
      
      // FileReader ile blob'u base64'e çevir
      const base64Image = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });
      
      setImageUrl(base64Image);
    } catch (err) {
      console.error('Error generating content:', err);
      console.error('Error details:', err);
      setError(`İçerik oluşturulurken bir hata oluştu: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Görseli kaydetme fonksiyonu
  const saveImage = async () => {
    if (!imageUrl) {
      Alert.alert('Hata', 'Kaydedilecek görsel bulunamadı.');
      return;
    }

    try {
      // Burada görseli kaydetme işlemi yapılacak
      // Expo Share API veya React Native CameraRoll kullanılabilir
      Alert.alert('Bilgi', 'Görsel kaydetme özelliği henüz eklenmedi.');
    } catch (err) {
      console.error('Error saving image:', err);
      Alert.alert('Hata', 'Görsel kaydedilirken bir hata oluştu.');
    }
  };

  // Replace the WordSelector component with the following
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Kelime Hikayesi Oluşturucu</Text>
      </View>
      <Text style={styles.subtitle}>Kelimelerinizden 5 tanesini seçin ve öğrenmenizi kolaylaştıracak bir hikaye oluşturun</Text>
      
      {fetchingWords ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0066cc" />
          <Text style={styles.loadingText}>Kelimeler yükleniyor...</Text>
        </View>
      ) : availableWords.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>Henüz kelime eklenmemiş. Lütfen önce kelime ekleyin.</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={fetchWords}
          >
            <Text style={styles.refreshButtonText}>Yenile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.wordsContainer}>
          <Text style={styles.selectionInfo}>
            {selectedWords.length}/5 kelime seçildi
          </Text>
          {availableWords.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={styles.wordCheckboxContainer}
              onPress={() => handleWordToggle(word.kelime)}
            >
              <View style={[
                styles.checkbox, 
                selectedWords.includes(word.kelime) && styles.checkboxSelected
              ]}>
                {selectedWords.includes(word.kelime) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <View style={styles.wordInfo}>
                <Text style={styles.wordText}>{word.kelime}</Text>
                <Text style={styles.wordMeaning}>{word.anlami}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <TouchableOpacity 
        style={[styles.button, (availableWords.length === 0 || selectedWords.length !== 5) && styles.buttonDisabled]} 
        onPress={generateStory}
        disabled={loading || availableWords.length === 0 || selectedWords.length !== 5}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Oluşturuluyor...' : 'Hikaye Oluştur'}
        </Text>
      </TouchableOpacity>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Hikaye ve görsel oluşturuluyor...</Text>
        </View>
      )}
      
      {story ? (
        <View style={styles.resultContainer}>
          <Text style={styles.storyTitle}>Hikayeniz:</Text>
          <Text style={styles.storyText}>{story}</Text>
          
          {imageUrl ? (
            <View style={styles.imageContainer}>
              <Text style={styles.imageTitle}>Hikaye Görseli:</Text>
              <Image source={{ uri: imageUrl }} style={styles.image} />
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveImage}
              >
                <Text style={styles.saveButtonText}>Görseli Kaydet</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? 20 : 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 30, // To balance the back button
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  wordsContainer: {
    marginBottom: 20,
  },
  selectionInfo: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
    color: '#0066cc',
  },
  wordCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#0066cc',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0066cc',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  wordMeaning: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#a0c4e4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectorContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  selector: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dropdownItemSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  refreshButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  imageContainer: {
    marginTop: 10,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  saveButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BrainChain;
