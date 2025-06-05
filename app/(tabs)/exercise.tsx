import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

const ExerciseScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.box, { backgroundColor: '#3A86FF' }]}
        onPress={() => router.push('/quizScreen')}
      >
        <Text style={styles.text}>Word Quiz</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.box, { backgroundColor: '#3A86FF' }]}
        onPress={() => router.push('/ImgQuizScreen')}
      >
        <Text style={styles.text}>Image Quiz</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.box, { backgroundColor: '#3A86FF' }]}
        onPress={() => router.push('/puzzleScreen')}
      >
        <Text style={styles.text}>Puzzle</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.box, { backgroundColor: '#3A86FF' }]}
        onPress={() => router.push('/brainChain')}
      >
        <Text style={styles.text}>Brain Chain</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ExerciseScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 20 : 60,
  },
  box: {
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
