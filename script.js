import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

/* ================= FIREBASE CONFIG (HIER EINTRAGEN) ================= */
const firebaseConfig = {
  apiKey: "AIzaSyDviEDCXO8UC4wAsN-v72G1bVyQu2rG1qk",
  authDomain: "pusharp-71b49.firebaseapp.com",
  projectId: "pusharp-71b49",
  storageBucket: "pusharp-71b49.firebasestorage.app",
  messagingSenderId: "879433057798",
  appId: "1:879433057798:web:6ca6b67c8c656fa9306587",
  measurementId: "G-9RY36C7YGW"
};

/* ================= FIREBASE INIT ================= */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, "verstoesse");

/* ================= DOM ================= */
const grid = document.getElementById('cardGrid');
const searchEl = document.getElementById('search');
const emptyEl = document.getElementById('emptyState');
const countEl = document.getElementById('resultCount');
const hinweiseEl = document.getElementById('hinweiseListe');

const openAdminBtn = document.getElementById('openAdminBtn');
const openManageBtn = document.getElementById('openManageBtn');
const sortByLevelBtn = document.getElementById('sortByLevelBtn');
const adminToolbar = document.querySelector('.admin-toolbar');
const adminOverlay = document.getElementById('adminOverlay');
const closeAdminBtn = document.getElementById('closeAdminBtn');
const adminTitle = document.getElementById('adminTitle');
const entryForm = document.getElementById('entryForm');
const entryIndexEl = document.getElementById('entryIndex');
const entryNameEl = document.getElementById('entryName');
const entryPenaltyEl = document.getElementById('entryPenalty');
const entryLevelEl = document.getElementById('entryLevel');
const newEntryBtn = document.getElementById('newEntryBtn');
const adminListEl = document.getElementById('adminList');
const exportBtn = document.getElementById('exportBtn');
const restoreBtn = document.getElementById('restoreBtn');
const resetBtn = document.getElementById('resetBtn');

/* ================= STATE ================= */
let grundDaten = { stand: '', verstoesse: [], hinweise: [] };
let alleVerstoesse = [];
let draggedIndex = null;
let dragPlaceAfter = false;

/* ================= INIT ================= */
init();

async function init(){
  try{
    const res = await fetch('strafen.json', { cache: 'no-store' });
    grundDaten = await res.json();

    alleVerstoesse = normalisiereVerstoesse(grundDaten.verstoesse || []);
    renderHinweise(grundDaten.hinweise || []);
  } catch(err){
    grid.innerHTML = "<p>Daten konnten nicht geladen werden</p>";
    console.error(err);
    return;
  }

  render();
  bindeEvents();
  startFirebaseSync();
}

/* ================= FIREBASE SYNC ================= */
function startFirebaseSync(){
  onValue(dbRef, (snapshot) => {
    const data = snapshot.val();

    if (data?.verstoesse) {
      alleVerstoesse = normalisiereVerstoesse(data.verstoesse);
    }

    render();
    renderAdminListe();
  });
}

/* ================= FIREBASE SAVE ================= */
function speichereAdminDaten(){
  set(dbRef, {
    verstoesse: alleVerstoesse,
    stand: new Date().toISOString()
  });
}

/* ================= EVENTS ================= */
function bindeEvents(){
  searchEl.addEventListener('input', render);
  entryForm.addEventListener('submit', speichereEintrag);
  newEntryBtn.addEventListener('click', leereForm);
}

/* ================= RENDER ================= */
function render(){
  const search = searchEl.value.toLowerCase();

  const gefiltert = alleVerstoesse.filter(v =>
    v.verstoss.toLowerCase().includes(search) ||
    v.strafe.toLowerCase().includes(search)
  );

  countEl.textContent = `${gefiltert.length} / ${alleVerstoesse.length}`;
  emptyEl.hidden = gefiltert.length !== 0;

  grid.innerHTML = gefiltert.map((v, i) => `
    <div class="card">
      <h3>${v.verstoss}</h3>
      <p>${v.strafe}</p>
      <small>Level ${v.level}</small>
    </div>
  `).join('');
}

/* ================= CRUD ================= */
function speichereEintrag(e){
  e.preventDefault();

  const eintrag = {
    verstoss: entryNameEl.value,
    strafe: entryPenaltyEl.value,
    level: Number(entryLevelEl.value)
  };

  alleVerstoesse.push(eintrag);

  speichereAdminDaten();   // 🔥 Firebase SAVE
  render();
  entryForm.reset();
}

function leereForm(){
  entryForm.reset();
}

/* ================= HELPERS ================= */
function normalisiereVerstoesse(arr){
  return arr.map(v => ({
    verstoss: v.verstoss || "",
    strafe: v.strafe || "",
    level: Number(v.level || 1)
  }));
}

function renderHinweise(h){
  hinweiseEl.innerHTML = (h || []).map(x => `<li>${x}</li>`).join('');
}
