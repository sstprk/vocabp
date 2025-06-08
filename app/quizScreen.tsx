import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, doc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAdminWords, getUserWords } from './services/wordService';

interface QuestionData {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  correctCount: number;
}

const TOTAL_QUESTIONS = 10;

const QuizScreen: React.FC = () => {
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerIsCorrect, setAnswerIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const getWordFrequency = async (): Promise<number> => {
    const freq = await AsyncStorage.getItem('wordFrequency');
    return freq ? parseInt(freq, 10) : 5;
  };

  const fetchQuestions = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;

    const frequency = await getWordFrequency();

    // Admin ve kullanıcı kelimelerini çek
    const adminWords = await getAdminWords();
    let userWords = await getUserWords(user.uid);

    // Her zaman frequency kadar admin kelimesi, kalanını kullanıcı kelimeleriyle doldur
    const selectedAdminWords = adminWords.sort(() => 0.5 - Math.random()).slice(0, frequency);
    let selectedUserWords = userWords.sort(() => 0.5 - Math.random()).slice(0, TOTAL_QUESTIONS - frequency);

    let questionsPool = [...selectedAdminWords, ...selectedUserWords];

    // Eğer toplam soru sayısı 10'dan azsa, adminWords ile tamamla
    if (questionsPool.length < TOTAL_QUESTIONS) {
      const extraAdminWords = adminWords
        .filter(w => !selectedAdminWords.includes(w))
        .sort(() => 0.5 - Math.random())
        .slice(0, TOTAL_QUESTIONS - questionsPool.length);
      questionsPool = [...questionsPool, ...extraAdminWords];
    }

    // Soru formatına dönüştür
    const questionsArr: QuestionData[] = questionsPool.map((word, idx) => {
      // 3 yanlış şık için havuzdan farklı kelimeler seç
      let wrongOptionsPool = questionsPool.filter(w => w !== word);
      const wrongOptions: string[] = [];
      while (wrongOptions.length < 3 && wrongOptionsPool.length > 0) {
        const randomIndex = Math.floor(Math.random() * wrongOptionsPool.length);
        wrongOptions.push(wrongOptionsPool[randomIndex].anlami);
        wrongOptionsPool.splice(randomIndex, 1);
      }
      const correctAnswer = word.anlami;
      const options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);
      const correctOptionIndex = options.findIndex(opt => opt === correctAnswer);
      return {
        id: word.tempId || `word-${idx}`,
        question: word.kelime,
        options,
        correctOptionIndex,
        correctCount: word.correctCount || 0,
      };
    });

    setQuestions(questionsArr);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswerIsCorrect(null);
    setLoading(false);
  };

  const handleOptionPress = async (index: number) => {
    if (selectedOption !== null) return; // Zaten cevap verilmiş

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = index === currentQuestion.correctOptionIndex;
    setSelectedOption(index);
    setAnswerIsCorrect(isCorrect);

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setWrongCount(prev => prev + 1);
    }

    const user = auth.currentUser;
    if (!user) return;

    const wordRef = doc(db, 'users', user.uid, 'words', currentQuestion.id);

    if (isCorrect) {
      const newCount = currentQuestion.correctCount + 1;
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + newCount);
      await updateDoc(wordRef, {
        correctCount: newCount,
        nextReview: Timestamp.fromDate(nextReviewDate),
      });
    } else {
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + 1);
      await updateDoc(wordRef, {
        correctCount: 0,
        nextReview: Timestamp.fromDate(nextReviewDate),
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setAnswerIsCorrect(null);
    } else {
      // Test bitti
      setQuestions([]);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.question}>Yükleniyor...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.finishedText}>Tebrikler! {correctCount} soruyu doğru cevapladınız!</Text>
        <Text style={styles.finishedText}>Bugünlük testin bitti!</Text>
        <Text style={styles.summaryText}>Doğru: {correctCount}  |  Yanlış: {wrongCount}</Text>
        <Text style={styles.analysisText}>Toplam Sorular: {correctCount + wrongCount}</Text>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => {
            setCorrectCount(0);
            setWrongCount(0);
            router.push('/homePage');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.homeButtonText}>Tamam</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/homePage')}
      >
        <Text style={styles.backButtonText}>← Geri</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>Vocably</Text>
        <Text style={styles.subTitle}>Quiz</Text>
      </View>

      <Text style={styles.counterText}>
        {currentQuestionIndex + 1} / {questions.length}
      </Text>

      <View style={styles.card}>
        <Text style={styles.question}>{currentQuestion.question}</Text>
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, idx) => {
            const isCorrectOption = idx === currentQuestion.correctOptionIndex;
            let optionStyle = styles.optionButton;
            let optionTextStyle = styles.optionText;

            if (selectedOption !== null) {
              if (isCorrectOption) {
                optionStyle = { ...optionStyle, ...styles.correctOption };
                optionTextStyle = { ...optionTextStyle, ...styles.selectedOptionText };
              } else if (idx === selectedOption) {
                optionStyle = { ...optionStyle, ...styles.wrongOption };
                optionTextStyle = { ...optionTextStyle, ...styles.selectedOptionText };
              } else {
                optionStyle = { ...optionStyle, borderColor: '#ccc' };
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                style={optionStyle}
                onPress={() => handleOptionPress(idx)}
                disabled={selectedOption !== null}
                activeOpacity={0.7}
              >
                <Text style={optionTextStyle}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {selectedOption !== null && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion} activeOpacity={0.7}>
            <Text style={styles.nextButtonText}>Sonraki</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#3A86FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3A86FF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3A86FF',
    marginRight: 12,
  },
  subTitle: {
    fontSize: 20,
    color: '#555',
    fontWeight: '600',
  },
  counterText: {
    fontSize: 18,
    color: '#555',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 6,
    shadowColor: '#3A86FF',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    color: '#222',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 14,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#e6ecff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  correctOption: {
    backgroundColor: '#3A86FF',
    borderColor: '#1c54b2',
  },
  wrongOption: {
    backgroundColor: '#ff4d4d',
    borderColor: '#b22222',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '700',
  },
  actions: {
    marginTop: 20,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#3A86FF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  nextButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
  },
  finishedText: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '700',
    color: '#333',
  },
   homeButton: {
    backgroundColor: '#3A86FF',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
    alignSelf: 'center',
  },
  homeButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  summaryText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3A86FF',
    marginBottom: 24,
    textAlign: 'center',
  },
  analysisText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3A86FF',
    marginBottom: 24,
    textAlign: 'center',
  },
});
