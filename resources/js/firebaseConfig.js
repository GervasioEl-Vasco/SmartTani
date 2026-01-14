// resources/js/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// --- ISI DATA INI DARI FIREBASE CONSOLE ---
// (Project Settings > General > Your Apps > npm)
const firebaseConfig = {
  apiKey: "AIzaSyC76imMONqZYNWVaNzaREElioJmHzn5UAs",
  authDomain: "smarttani-a4a11.firebaseapp.com",
  databaseURL: "https://smarttani-a4a11-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smarttani-a4a11",
  storageBucket: "smarttani-a4a11.firebasestorage.app",
  messagingSenderId: "345666748538",
  appId: "1:345666748538:web:7db38b029f9f996a12fbc3",
  measurementId: "G-GXGQEBWXE1"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Export database agar bisa dipakai di halaman lain
export const db = getDatabase(app);