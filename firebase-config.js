// ── Firebase Konfiguration ──────────────────────────────────────
// Diese Datei verbindet die Seite mit eurer gemeinsamen Firestore-Datenbank.
// Der API-Key hier ist ÖFFENTLICH sichtbar per Design von Firebase — das ist
// normal und kein Sicherheitsproblem für sich. Der eigentliche Schutz kommt
// über die Firestore-Sicherheitsregeln in der Firebase Console (siehe README).

const firebaseConfig = {
  apiKey: "AIzaSyDviEDCXO8UC4wAsN-v72G1bVyQu2rG1qk",
  authDomain: "pusharp-71b49.firebaseapp.com",
  projectId: "pusharp-71b49",
  storageBucket: "pusharp-71b49.firebasestorage.app",
  messagingSenderId: "879433057798",
  appId: "1:879433057798:web:6ca6b67c8c656fa9306587",
  measurementId: "G-9RY36C7YGW"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Ein einziges Dokument haelt den kompletten Katalog.
// Aenderung durch irgendein Teammitglied -> alle anderen sehen es live.
const KATALOG_DOC = db.collection('katalog').doc('daten');
