import { db, KATALOG_DOC, SETTINGS_DOC } from "./firebase-config.js";
import { onSnapshot, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDviEDCXO8UC4wAsN-v72G1bVyQu2rG1qk",
  authDomain: "pusharp-71b49.firebaseapp.com",
  projectId: "pusharp-71b49",
  storageBucket: "pusharp-71b49.firebasestorage.app",
  messagingSenderId: "879433057798",
  appId: "1:879433057798:web:6ca6b67c8c656fa9306587"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Firestore Docs
export const KATALOG_DOC = doc(db, "katalog", "daten");
export const SETTINGS_DOC = doc(db, "settings", "admin");
