import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const QuizScreen = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const question = 'What is the synonym of "happy"?';
  const options = ['Sad', 'Joyful', 'Angry', 'Tired'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Vocably</Text>
        <Text style={styles.subTitle}>Quiz</Text>
      </View>

      {/* Question Card */}
      <View style={styles.card}>
        <Text style={styles.question}>{question}</Text>
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === index && styles.selectedOption,
              ]}
              onPress={() => setSelectedOption(index)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOption === index && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Buttons outside the card */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.passButton} activeOpacity={0.7}>
          <Text style={styles.passButtonText}>Pass</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} activeOpacity={0.7}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 24,
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
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#3A86FF',
    borderColor: '#1c54b2',
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
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  passButton: {
    backgroundColor: '#d0dbff',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3A86FF',
  },
  passButtonText: {
    color: '#3A86FF',
    fontWeight: '700',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#3A86FF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#1c54b2',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
