const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // path'i servise göre değiştir
const fs = require('fs');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const dbAdmin = admin.firestore();

const adminWords = [
  { kelime: "apple", anlami: "elma" },
  { kelime: "book", anlami: "kitap" },
  { kelime: "car", anlami: "araba" },
  { kelime: "dog", anlami: "köpek" },
  { kelime: "house", anlami: "ev" },
  { kelime: "sun", anlami: "güneş" },
  { kelime: "water", anlami: "su" },
  { kelime: "tree", anlami: "ağaç" },
  { kelime: "school", anlami: "okul" },
  { kelime: "computer", anlami: "bilgisayar" },
  { kelime: "phone", anlami: "telefon" },
  { kelime: "pen", anlami: "kalem" },
  { kelime: "door", anlami: "kapı" },
  { kelime: "table", anlami: "masa" },
  { kelime: "chair", anlami: "sandalye" },
  { kelime: "bird", anlami: "kuş" },
  { kelime: "milk", anlami: "süt" },
  { kelime: "bread", anlami: "ekmek" },
  { kelime: "flower", anlami: "çiçek" },
  { kelime: "rain", anlami: "yağmur" },
  { kelime: "cloud", anlami: "bulut" },
  { kelime: "mountain", anlami: "dağ" },
  { kelime: "river", anlami: "nehir" },
  { kelime: "star", anlami: "yıldız" },
  { kelime: "music", anlami: "müzik" },
  { kelime: "fish", anlami: "balık" },
  { kelime: "city", anlami: "şehir" },
  { kelime: "street", anlami: "sokak" },
  { kelime: "window", anlami: "pencere" },
  { kelime: "friend", anlami: "arkadaş" },
  { kelime: "schoolbag", anlami: "okul çantası" },
  { kelime: "garden", anlami: "bahçe" },
  { kelime: "riverbank", anlami: "nehir kenarı" },
  { kelime: "train", anlami: "tren" },
  { kelime: "bus", anlami: "otobüs" },
  { kelime: "bottle", anlami: "şişe" },
  { kelime: "clock", anlami: "saat" },
  { kelime: "windowpane", anlami: "cam" },
  { kelime: "mirror", anlami: "ayna" },
  { kelime: "shoe", anlami: "ayakkabı" },
  { kelime: "hat", anlami: "şapka" },
  { kelime: "coat", anlami: "mont" },
  { kelime: "key", anlami: "anahtar" },
  { kelime: "bag", anlami: "çantа" },
  { kelime: "lamp", anlami: "lamba" },
  { kelime: "pencil", anlami: "kurşun kalem" },
  { kelime: "notebook", anlami: "defter" },
  { kelime: "paper", anlami: "kağıt" },
  { kelime: "clockwise", anlami: "saat yönünde" },
];

function generateTempId() {
  return Math.random().toString(36).substr(2, 9);
}

async function uploadAdminWords() {
  for (const word of adminWords) {
    try {
      await dbAdmin.collection('admin_words').add({
        kelime: word.kelime,
        anlami: word.anlami,
        tempId: generateTempId(),
        createdAt: admin.firestore.Timestamp.now(),
        correctCount: 0,
        imagePath: null,
      });
      console.log(`Added: ${word.kelime} - ${word.anlami}`);
    } catch (error) {
      console.error('Error adding word:', error);
    }
  }
  console.log('Upload complete.');
}

uploadAdminWords();


