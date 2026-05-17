import { initializeApp } from "firebase/app";
// DEZE IMPORT WAS JE VERGETEN:
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJRuv4-dudOel0FkwjYJJ0O5TuUQH2Rpg",
  authDomain: "locavibes-24dce.firebaseapp.com",
  projectId: "locavibes-24dce",
  storageBucket: "locavibes-24dce.firebasestorage.app",
  messagingSenderId: "514346232936",
  appId: "1:514346232936:web:39ab7ed0d0a5f7f0f15fdd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// DEZE TWEE REGELS MOESTEN ER NOG BIJ:
// Hiermee starten we de database en sturen we de 'db' sleutel door naar App.jsx
export const db = getFirestore(app);
