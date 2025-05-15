import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

export default function IndexScreen() {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [words, setWords] = useState<{ kelime: string; anlami: string }[]>([]);

  const addWord = () => {
    if (word.trim() === '' || meaning.trim() === '') return;

    setWords([...words, { kelime: word, anlami: meaning }]);
    setWord('');
    setMeaning('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📘 Kelime Ekle</Text>

      <TextInput
        style={styles.input}
        placeholder="Kelime"
        value={word}
        onChangeText={setWord}
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Anlamı"
        value={meaning}
        onChangeText={setMeaning}
        placeholderTextColor="#666"
      />

      <TouchableOpacity style={styles.button} onPress={addWord}>
        <Text style={styles.buttonText}>+ Ekle</Text>
      </TouchableOpacity>

      <Text style={styles.listTitle}>📚 Kelimelerim</Text>

      <FlatList
        data={words}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.wordItem}>
            <Text style={styles.wordText}>
              {item.kelime} 
            </Text>
            <Text style={styles.wordText}>
              {item.anlami}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz hiç kelime eklenmedi.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#E6F0FA',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: '#3B82F6',
    borderWidth: 1,
    color: '#000',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 10,
  },
  wordItem: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderColor: '#93C5FD',
    borderWidth: 1,
  },
  wordText: {
    fontSize: 16,
    color: '#111827',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 10,
  },
});
