import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { collection, getDocs, doc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useRouter } from 'expo-router';

interface QuestionData {
  id: string;
  imagePath: string; // soru artık resim yolu olacak
  options: string[]; // şıklar ingilizce kelimeler
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

  useEffect(() => {
    fetchQuestions();
  }, []);

 const fetchQuestions = async () => {
  setLoading(true);
  const user = auth.currentUser;
  if (!user) return;

  const wordsRef = collection(db, 'users', user.uid, 'words');

  // nextReview filtresi kaldırıldı, tüm kelimeler alınıyor
  const allSnapshot = await getDocs(wordsRef);
  const allDocs = allSnapshot.docs;

  if (allDocs.length === 0) {
    setQuestions([]);
    setLoading(false);
    return;
  }

  // Rastgele 10 tane seç (ya da varsa daha az)
  let selectedDocs = allDocs;
  if (allDocs.length > TOTAL_QUESTIONS) {
    selectedDocs = allDocs.sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS);
  }

  const questionsArr: QuestionData[] = [];

  for (const docItem of selectedDocs) {
    const correctData = docItem.data();

    // Yanlış seçenekler: doğru kelime hariç 3 tane random kelime (İngilizce)
    let wrongOptionsPool = allDocs.filter(d => d.id !== docItem.id);
    const wrongOptions: string[] = [];

    while (wrongOptions.length < 3 && wrongOptionsPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * wrongOptionsPool.length);
      wrongOptions.push(wrongOptionsPool[randomIndex].data().english);
      wrongOptionsPool.splice(randomIndex, 1);
    }

    const correctAnswer = correctData.english;
    const options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);
    const correctOptionIndex = options.findIndex(opt => opt === correctAnswer);

    questionsArr.push({
      id: docItem.id,
      imagePath: correctData.imagePath || '',
      options,
      correctOptionIndex,
      correctCount: correctData.correctCount || 0,
    });
  }

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
        <Text style={styles.finishedText}>Bugünlük testin bitti!</Text>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push('/homePage')}
          activeOpacity={0.7}
        >
          <Text style={styles.homeButtonText}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vocably</Text>
        <Text style={styles.subTitle}>Quiz</Text>
      </View>

      <Text style={styles.counterText}>
        {currentQuestionIndex + 1} / {questions.length}
      </Text>

      <View style={styles.card}>
        {/* Soru olarak resim gösteriliyor */}
        {currentQuestion.imagePath ? (
          <Image
            source={{ uri: currentQuestion.imagePath }}
            style={styles.questionImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.question}>Resim bulunamadı.</Text>
        )}

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
  questionImage: {
    width: '100%',
    height: 200,
    marginBottom: 24,
    borderRadius: 12,
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
});
