import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJRuv4-dudOel0FkwjYJJ0O5TuUQH2Rpg",
  authDomain: "locavibes-24dce.firebaseapp.com",
  projectId: "locavibes-24dce",
  storageBucket: "locavibes-24dce.firebasestorage.app",
  messagingSenderId: "514346232936",
  appId: "1:514346232936:web:39ab7ed0d0a5f7f0f15fdd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
