// assets/js/firebase-init.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBOO2Y_qsTn89JSqI9wyOgDZ2qFP7SVLgY",
  authDomain: "flavomix-orders.firebaseapp.com",
  projectId: "flavomix-orders",
  storageBucket: "flavomix-orders.firebasestorage.app",
  messagingSenderId: "850740654284",
  appId: "1:850740654284:web:751def35208d207f559269"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export db so other modules can use it
export { db };