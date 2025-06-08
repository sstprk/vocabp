import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, Alert, TouchableOpacity } from 'react-native';
import { getWordsSimple } from './services/wordService';
import { router } from 'expo-router';

const PuzzleScreen = () => {
  const gridSize = 10;
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [foundWords, setFoundWords] = useState<{ word: string; path: { row: number; col: number }[] }[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const gridContainerRef = useRef<View>(null);
  const layoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const stateRef = useRef({ grid, words, foundWords, selectedCells });

  useEffect(() => {
    stateRef.current = { grid, words, foundWords, selectedCells };
  }, [grid, words, foundWords, selectedCells]);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const wordObjects = await getWordsSimple();
        const wordList = wordObjects.map(word => word.kelime.toUpperCase());
        const filteredWords = wordList.filter(word => word.length > 0 && word.length <= gridSize);
        setWords(filteredWords.length ? filteredWords : []);

        if (filteredWords.length === 0) {
          Alert.alert(
            "Uyarı",
            "Hiç kelimeniz yok. Lütfen kelime ekledikten sonra tekrar deneyiniz.",
            [
              {
                text: "Tamam",
                onPress: () => router.push('/(tabs)/exercise'),
              },
            ]
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'BİLİNMEYEN HATA';
        setWords(message.includes('Oturumunuz açık değil') ? ['OTURUM', 'GEREKLİ'] : ['VERİTABANI', 'HATASI']);
      }
    };
    fetchWords();
  }, []);

  const generateGrid = useCallback(() => {
    if (words.length === 0) return;
    const directions = ['vertical', 'diagonal'];
    const newGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));

    words.forEach(word => {
      let placed = false, attempts = 0;
      while (!placed && attempts < 100) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        if (canPlaceWord(newGrid, word, row, col, dir)) {
          placeWord(newGrid, word, row, col, dir);
          placed = true;
        }
        attempts++;
      }
    });

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (newGrid[i][j] === '') {
          newGrid[i][j] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setGrid(newGrid);
  }, [words]);

  useEffect(() => { generateGrid(); }, [generateGrid]);

  useEffect(() => {
    const defaults = ['KELİME', 'YOK', 'OTURUM', 'GEREKLİ', 'VERİTABANI', 'HATASI'];
    if (words.length > 0 && words.length === foundWords.length && !words.some(w => defaults.includes(w))) {
      Alert.alert("Tebrikler!", "Tüm kelimeleri başarıyla buldunuz!", [{ text: "Tamam" }]);
    }
  }, [foundWords, words]);

  const handleLayout = () => {
    gridContainerRef.current?.measureInWindow((x, y, width, height) => {
      layoutRef.current = { x, y, width, height };
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderStart: (_, gestureState) => {
        const cell = cellFromCoordinatesSync(gestureState.x0, gestureState.y0);
        if (cell) setSelectedCells([cell]);
      },
      onPanResponderMove: (_, gestureState) => {
        const { selectedCells } = stateRef.current;
        if (selectedCells.length === 0) return;

        const endCell = cellFromCoordinatesSync(gestureState.moveX, gestureState.moveY);
        if (!endCell) return;

        const path = getPath(selectedCells[0], endCell);
        
        if (path.length !== selectedCells.length || !path.every((p, i) => p.row === selectedCells[i].row && p.col === selectedCells[i].col)) {
          setSelectedCells(path);
        }
      },
      onPanResponderRelease: () => {
        const { grid, words, foundWords, selectedCells } = stateRef.current;

        if (grid.length === 0 || selectedCells.length < 2) {
          setSelectedCells([]);
          return;
        }

        const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
        const reversed = selectedWord.split('').reverse().join('');

        const isAlreadyFound = (word: string) => foundWords.some(fw => fw.word === word);

        if (words.includes(selectedWord) && !isAlreadyFound(selectedWord)) {
          setFoundWords(prev => [...prev, { word: selectedWord, path: [...selectedCells] }]);
        } else if (words.includes(reversed) && !isAlreadyFound(reversed)) {
          setFoundWords(prev => [...prev, { word: reversed, path: [...selectedCells] }]);
        }

        setSelectedCells([]);
      },
    })
  ).current;

  const cellFromCoordinatesSync = (x: number, y: number): { row: number; col: number } | null => {
    const { x: layoutX, y: layoutY, width, height } = layoutRef.current;
    if (width === 0 || height === 0) return null;
    if (x >= layoutX && x <= layoutX + width && y >= layoutY && y <= layoutY + height) {
      const col = Math.floor((x - layoutX) / (width / gridSize));
      const row = Math.floor((y - layoutY) / (height / gridSize));
      return { row, col };
    }
    return null;
  };

  const getPath = (start: { row: number; col: number }, end: { row: number; col: number }) => {
    const dx = end.col - start.col;
    const dy = end.row - start.row;

    let dir: 'horizontal' | 'vertical' | 'diagonal' | null = null;
    if (dx === 0) dir = 'vertical';
    else if (dy === 0) dir = 'horizontal';
    else if (Math.abs(dx) === Math.abs(dy)) dir = 'diagonal';

    const path = [];
    if (!dir) return [start];
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    for (let i = 0; i <= steps; i++) {
      const row = start.row + Math.sign(dy) * i;
      const col = start.col + Math.sign(dx) * i;
      path.push({ row, col });
    }
    return path;
  };

  const isCellSelected = (row: number, col: number) =>
    selectedCells.some(cell => cell.row === row && cell.col === col);

  const isCellFound = (row: number, col: number) =>
    foundWords.some(word => word.path.some(c => c.row === row && c.col === col));

  const getOffsets = (dir: string, i: number) => {
    let r_offset = 0, c_offset = 0;
    switch (dir) {
      case 'horizontal': c_offset = i; break;
      case 'vertical': r_offset = i; break;
      case 'diagonal': r_offset = i; c_offset = i; break;
    }
    return { r_offset, c_offset };
  };

  const canPlaceWord = (grid: string[][], word: string, row: number, col: number, dir: string) => {
    for (let i = 0; i < word.length; i++) {
      const { r_offset, c_offset } = getOffsets(dir, i);
      const r = row + r_offset, c = col + c_offset;
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize || (grid[r][c] !== '' && grid[r][c] !== word[i])) {
        return false;
      }
    }
    return true;
  };

  const placeWord = (grid: string[][], word: string, row: number, col: number, dir: string) => {
    for (let i = 0; i < word.length; i++) {
      const { r_offset, c_offset } = getOffsets(dir, i);
      const r = row + r_offset, c = col + c_offset;
      grid[r][c] = word[i];
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.push('/(tabs)/exercise')}
      >
        <Text style={styles.backButtonText}>← Geri</Text>
      </TouchableOpacity>
      <Text style={styles.title}>PUZZLE</Text>
      <View
        style={styles.gridContainer}
        ref={gridContainerRef}
        {...panResponder.panHandlers}
        onLayout={handleLayout}
      >
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((letter, colIndex) => {
              const selected = isCellSelected(rowIndex, colIndex);
              const found = isCellFound(rowIndex, colIndex);
              return (
                <View key={colIndex} style={[
                  styles.cell,
                  { backgroundColor: selected ? '#ddd' : found ? '#2ECC71' : '#f0f0f0' },
                ]}>
                  <Text style={[styles.cellText, { color: found ? 'white' : 'black' }]}>
                    {letter}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
      <View style={styles.wordListContainer}>
        <Text style={styles.wordListTitle}>Bulunmuş Kelimeler:</Text>
        {foundWords.map((foundWordData, index) => (
          <Text key={index} style={styles.wordItem}>
            <Text style={styles.wordText}>{foundWordData.word}</Text>
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#3A86FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButtonText: {
    fontSize: 18,
    color: '#3A86FF',
    fontWeight: '600',
  },
  title: { 
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3A86FF',
    marginBottom: 20,
    textAlign: 'center',
  },
  gridContainer: { 
    width: '90%',
    aspectRatio: 1,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#3A86FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  row: { 
    flex: 1, 
    flexDirection: 'row',
  },
  cell: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#e6ecff', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    margin: 1,
    borderRadius: 4,
  },
  cellText: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#3A86FF',
  },
  wordListContainer: { 
    width: '80%', 
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#3A86FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wordListTitle: { 
    fontSize: 18, 
    fontWeight: '600',
    color: '#3A86FF',
    marginBottom: 10,
    textAlign: 'center',
  },
  wordItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e6ecff',
  },
  wordText: {
    fontSize: 16,
    color: '#333',
  },
});

export default PuzzleScreen;
