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
const adminLogin = document.getElementById('adminLogin');
const adminDashboard = document.getElementById('adminDashboard');
const adminUserEl = document.getElementById('adminUser');
const adminPasswordEl = document.getElementById('adminPassword');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLoginError = document.getElementById('adminLoginError');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const dashTotal = document.getElementById('dashTotal');
const dashMaxLevel = document.getElementById('dashMaxLevel');
const dashSession = document.getElementById('dashSession');
const dashSessionMeta = document.getElementById('dashSessionMeta');
const dashStorage = document.getElementById('dashStorage');
const dashNewBtn = document.getElementById('dashNewBtn');
const dashExportBtn = document.getElementById('dashExportBtn');
const dashRestoreBtn = document.getElementById('dashRestoreBtn');
const dashResetBtn = document.getElementById('dashResetBtn');
const clearLogBtn = document.getElementById('clearLogBtn');
const activityLogEl = document.getElementById('activityLog');
const currentAdminPassEl = document.getElementById('currentAdminPass');
const newAdminPassEl = document.getElementById('newAdminPass');
const repeatAdminPassEl = document.getElementById('repeatAdminPass');
const changeAdminPassBtn = document.getElementById('changeAdminPassBtn');
const passwordStatusEl = document.getElementById('passwordStatus');
const currentTeamPassEl = document.getElementById('currentTeamPass');
const newTeamPassEl = document.getElementById('newTeamPass');
const repeatTeamPassEl = document.getElementById('repeatTeamPass');
const changeTeamPassBtn = document.getElementById('changeTeamPassBtn');
const teamPasswordStatusEl = document.getElementById('teamPasswordStatus');
const shortcutLogin = document.getElementById('shortcutLogin');
const shortcutCloseBtn = document.getElementById('shortcutCloseBtn');
const shortcutAdminUserEl = document.getElementById('shortcutAdminUser');
const shortcutAdminPasswordEl = document.getElementById('shortcutAdminPassword');
const shortcutLoginBtn = document.getElementById('shortcutLoginBtn');
const shortcutLoginError = document.getElementById('shortcutLoginError');

const ADMIN_SESSION_KEY = 'bannkatalog_admin_session_v1';
const ADMIN_USER = 'admin';
const DEFAULT_ADMIN_PASS = 'pushadmin';
const DEFAULT_TEAM_PASS = 'pushateam';

let grundDaten = { stand: '', verstoesse: [], hinweise: [] };
let alleVerstoesse = [];
let pendingAdminAction = 'manage';
let draggedIndex = null;
let dragPlaceAfter = false;
let firebaseDb = null;
let firebaseDocRef = null;
let firebaseReady = false;
let applyingRemoteData = false;
let adminPass = DEFAULT_ADMIN_PASS;
let teamPass = DEFAULT_TEAM_PASS;
let backupDaten = null;
let activityLog = [];

const LEVEL_FARBE = {
  1: { color: '#e0982f', glow: 'rgba(224,152,47,.45)', bg: 'rgba(224,152,47,.07)' },
  2: { color: '#e57a2c', glow: 'rgba(229,122,44,.4)', bg: 'rgba(229,122,44,.07)' },
  3: { color: '#e15732', glow: 'rgba(225,87,50,.4)', bg: 'rgba(225,87,50,.08)' },
  4: { color: '#e3242f', glow: 'rgba(227,36,47,.45)', bg: 'rgba(227,36,47,.08)' },
  5: { color: '#ff1320', glow: 'rgba(255,19,32,.55)', bg: 'rgba(255,19,32,.1)' }
};

init();

async function init(){
  try{
    grundDaten = await ladeGrundDaten();
    const remoteDaten = await initFirebaseSync();
    alleVerstoesse = remoteDaten?.verstoesse || normalisiereVerstoesse(grundDaten.verstoesse || []);
    if (remoteDaten?.hinweise?.length) grundDaten.hinweise = remoteDaten.hinweise;
    if (remoteDaten?.adminPass) adminPass = remoteDaten.adminPass;
    if (remoteDaten?.teamPass) teamPass = remoteDaten.teamPass;
    renderHinweise(grundDaten.hinweise || []);
    if (firebaseReady && !remoteDaten?.hasStartDaten) {
      await schreibeStartdatenInFirebase();
    }
    starteFirebaseLiveSync();
  }catch(err){
    grid.innerHTML = '<p class="empty">Daten konnten nicht geladen werden. Pruefe, ob strafen.json vorhanden ist.</p>';
    console.error(err);
    return;
  }

  render();
  bindeEvents();
  updateAdminControls();
}

async function ladeGrundDaten(){
  try{
    const res = await fetch('strafen.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`strafen.json HTTP ${res.status}`);
    return await res.json();
  }catch(err){
    console.warn('strafen.json konnte nicht geladen werden, eingebettete Startdaten aktiv:', err);
    if (typeof DEFAULT_KATALOG_DATEN !== 'undefined') return DEFAULT_KATALOG_DATEN;
    return { stand: '', verstoesse: [], hinweise: [] };
  }
}

function bindeEvents(){
  searchEl.addEventListener('input', render);
  openAdminBtn.addEventListener('click', () => openAdminGate('new'));
  openManageBtn.addEventListener('click', () => openAdminGate('manage'));
  sortByLevelBtn.addEventListener('click', sortiereNachSternen);
  closeAdminBtn.addEventListener('click', closeAdmin);
  newEntryBtn.addEventListener('click', leereForm);
  entryForm.addEventListener('submit', speichereEintrag);
  exportBtn.addEventListener('click', exportiereJson);
  restoreBtn.addEventListener('click', stelleBackupWiederHer);
  resetBtn.addEventListener('click', resetAdminDaten);
  adminLoginBtn.addEventListener('click', doAdminLogin);
  adminPasswordEl.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') doAdminLogin();
  });
  adminLogoutBtn.addEventListener('click', doAdminLogout);
  dashNewBtn.addEventListener('click', leereForm);
  dashExportBtn.addEventListener('click', exportiereJson);
  dashRestoreBtn.addEventListener('click', stelleBackupWiederHer);
  dashResetBtn.addEventListener('click', resetAdminDaten);
  clearLogBtn.addEventListener('click', clearActivityLog);
  changeAdminPassBtn.addEventListener('click', aendereAdminPasswort);
  changeTeamPassBtn.addEventListener('click', aendereTeamPasswort);
  shortcutLoginBtn.addEventListener('click', doShortcutLogin);
  shortcutCloseBtn.addEventListener('click', hideShortcutLogin);
  shortcutAdminPasswordEl.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') doShortcutLogin();
  });

  adminOverlay.addEventListener('click', (ev) => {
    if (ev.target === adminOverlay) closeAdmin();
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      closeAdmin();
      hideShortcutLogin();
    }
    if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === 'a') {
      ev.preventDefault();
      if (isAdminLoggedIn()) {
        updateAdminControls();
        openAdminGate('manage');
      } else {
        showShortcutLogin();
      }
    }
  });
}

function normalisiereVerstoesse(verstoesse){
  return verstoesse.map((v) => ({
    verstoss: String(v.verstoss || '').trim(),
    strafe: String(v.strafe || '').trim(),
    level: begrenzeLevel(v.level)
  })).filter(v => v.verstoss && v.strafe);
}

function sortiereVerstoesse(verstoesse){
  return [...verstoesse].sort((a, b) => {
    const levelDiff = begrenzeLevel(a.level) - begrenzeLevel(b.level);
    if (levelDiff !== 0) return levelDiff;
    return a.verstoss.localeCompare(b.verstoss, 'de', { sensitivity: 'base' });
  });
}

function sortiereAlleVerstoesse(){
  alleVerstoesse = sortiereVerstoesse(alleVerstoesse);
}

function fuegeNachSternGruppeEin(eintrag){
  const level = begrenzeLevel(eintrag.level);
  let insertIndex = alleVerstoesse.length;

  for (let i = alleVerstoesse.length - 1; i >= 0; i--){
    const aktuellesLevel = begrenzeLevel(alleVerstoesse[i].level);
    if (aktuellesLevel <= level) {
      insertIndex = i + 1;
      break;
    }
  }

  alleVerstoesse.splice(insertIndex, 0, eintrag);
}

function sortiereNachSternen(){
  if (!requireAdmin()) return;
  erstelleBackup('VOR_SORT');
  sortiereAlleVerstoesse();
  speichereAdminDaten();
  logAction('SORT', 'Nach Sternen sortiert');
  render();
  renderCommandCenter();
  renderAdminListe();
}

function getFirebaseSettings(){
  return window.PUSHA_FIREBASE || {};
}

function istFirebaseKonfiguriert(settings){
  return Boolean(
    settings.enabled &&
    settings.config &&
    settings.config.apiKey &&
    settings.config.projectId &&
    !String(settings.config.apiKey).includes('HIER_EINTRAGEN') &&
    !String(settings.config.projectId).includes('HIER_EINTRAGEN') &&
    window.firebase?.initializeApp &&
    window.firebase?.firestore
  );
}

async function initFirebaseSync(){
  const settings = getFirebaseSettings();
  if (!istFirebaseKonfiguriert(settings)) return null;

  try{
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(settings.config);
    }
    firebaseDb = window.firebase.firestore();
    firebaseDocRef = firebaseDb
      .collection(settings.collection || 'ban_katalog')
      .doc(settings.dataDoc || 'live');
    firebaseReady = true;

    const snapshot = await firebaseDocRef.get();
    if (!snapshot.exists) return { hasStartDaten: false };

    const data = snapshot.data() || {};

    return {
      verstoesse: normalisiereVerstoesse(data.verstoesse || []),
      hinweise: Array.isArray(data.hinweise) ? data.hinweise : [],
      adminPass: data.adminPass ? String(data.adminPass) : DEFAULT_ADMIN_PASS,
      teamPass: data.teamPass ? String(data.teamPass) : DEFAULT_TEAM_PASS,
      hasStartDaten: Array.isArray(data.verstoesse) && data.verstoesse.length > 0
    };
  }catch(err){
    firebaseReady = false;
    console.warn('Firebase konnte nicht gestartet werden, lokaler Modus aktiv:', err);
    return null;
  }
}

function baueFirebaseDaten(){
  return {
    stand: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString(),
    verstoesse: alleVerstoesse,
    hinweise: grundDaten.hinweise || [],
    adminPass: getAdminPass(),
    teamPass: getTeamPass()
  };
}

function getHeuteId(){
  return new Date().toISOString().slice(0, 10);
}

async function speichereTagesBackup(daten){
  if (!firebaseReady || !firebaseDb) return;

  const settings = getFirebaseSettings();
  const backupCollection = settings.backupCollection || 'ban_katalog_backups';
  const backupRef = firebaseDb.collection(backupCollection).doc(getHeuteId());
  const backupDaten = {
    ...daten,
    backupDate: getHeuteId(),
    backupType: 'daily',
    sourceDoc: `${settings.collection || 'ban_katalog'}/${settings.dataDoc || 'live'}`
  };

  await backupRef.set(backupDaten, { merge: true });
}

async function schreibeStartdatenInFirebase(){
  if (!firebaseReady || !firebaseDocRef) return;
  alleVerstoesse = normalisiereVerstoesse(grundDaten.verstoesse || []);
  adminPass = adminPass || DEFAULT_ADMIN_PASS;
  teamPass = teamPass || DEFAULT_TEAM_PASS;
  await speichereFirebaseDaten();
  logAction('SEED', `${alleVerstoesse.length} Startdaten in Firestore geschrieben`);
}

async function speichereFirebaseDaten(){
  if (!firebaseReady || !firebaseDocRef || applyingRemoteData) return;
  try{
    const daten = baueFirebaseDaten();
    await firebaseDocRef.set(daten, { merge: true });
    await speichereTagesBackup(daten);
  }catch(err){
    console.warn('Firebase speichern fehlgeschlagen, lokale Daten bleiben erhalten:', err);
  }
}

function starteFirebaseLiveSync(){
  if (!firebaseReady || !firebaseDocRef) return;
  firebaseDocRef.onSnapshot((snapshot) => {
    if (!snapshot.exists) return;
    const data = snapshot.data() || {};
    const remoteVerstoesse = normalisiereVerstoesse(data.verstoesse || []);
    if (!remoteVerstoesse.length) return;

    const currentJson = JSON.stringify(alleVerstoesse);
    const remoteJson = JSON.stringify(remoteVerstoesse);
    const remoteAdminPass = data.adminPass ? String(data.adminPass) : adminPass;
    const remoteTeamPass = data.teamPass ? String(data.teamPass) : teamPass;
    if (currentJson === remoteJson && remoteAdminPass === adminPass && remoteTeamPass === teamPass) return;

    applyingRemoteData = true;
    alleVerstoesse = remoteVerstoesse;
    if (Array.isArray(data.hinweise)) grundDaten.hinweise = data.hinweise;
    adminPass = remoteAdminPass;
    teamPass = remoteTeamPass;
    speichereAdminDaten();
    renderHinweise(grundDaten.hinweise || []);
    render();
    renderCommandCenter();
    renderAdminListe();
    applyingRemoteData = false;
  }, (err) => {
    console.warn('Firebase Live-Sync fehlgeschlagen:', err);
  });
}

function speichereAdminDaten(){
  speichereFirebaseDaten();
}

function erstelleBackup(reason = 'MANUELL'){
  backupDaten = {
    ts: Date.now(),
    reason,
    stand: new Date().toISOString().slice(0, 10),
    verstoesse: alleVerstoesse,
    hinweise: grundDaten.hinweise || []
  };
  return backupDaten;
}

function ladeBackup(){
  if (!backupDaten) return null;
  const verstoesse = normalisiereVerstoesse(backupDaten.verstoesse || []);
  if (!verstoesse.length) return null;
  return { ...backupDaten, verstoesse };
}

function formatiereBackupZeit(backup){
  if (!backup) return 'kein Backup';
  return new Date(backup.ts).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function isAdminLoggedIn(){
  try{
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return session.user === ADMIN_USER && Date.now() - session.ts < 1000 * 60 * 60 * 2;
  }catch{
    return false;
  }
}

function getAdminPass(){
  return adminPass || DEFAULT_ADMIN_PASS;
}

function getTeamPass(){
  return teamPass || DEFAULT_TEAM_PASS;
}

function clearPasswordForm(){
  currentAdminPassEl.value = '';
  newAdminPassEl.value = '';
  repeatAdminPassEl.value = '';
  currentTeamPassEl.value = '';
  newTeamPassEl.value = '';
  repeatTeamPassEl.value = '';
}

function setPasswordStatus(message, type = 'error'){
  passwordStatusEl.textContent = message;
  passwordStatusEl.hidden = false;
  passwordStatusEl.classList.toggle('is-ok', type === 'ok');
}

function aendereAdminPasswort(){
  if (!requireAdmin()) return;

  const currentPass = currentAdminPassEl.value;
  const newPass = newAdminPassEl.value.trim();
  const repeatPass = repeatAdminPassEl.value.trim();

  if (currentPass !== getAdminPass()) {
    setPasswordStatus('Aktuelles Passwort ist falsch.');
    logAction('PASS-FAIL', 'Falsches aktuelles Passwort');
    return;
  }

  if (newPass.length < 4) {
    setPasswordStatus('Neues Passwort muss mindestens 4 Zeichen haben.');
    return;
  }

  if (newPass !== repeatPass) {
    setPasswordStatus('Neues Passwort stimmt nicht ueberein.');
    return;
  }

  adminPass = newPass;
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ user: ADMIN_USER, ts: Date.now() }));
  clearPasswordForm();
  setPasswordStatus('Passwort wurde geaendert.', 'ok');
  logAction('PASS', 'Admin Passwort geaendert');
  speichereFirebaseDaten();
  renderCommandCenter();
}

function setTeamPasswordStatus(message, type = 'error'){
  teamPasswordStatusEl.textContent = message;
  teamPasswordStatusEl.hidden = false;
  teamPasswordStatusEl.classList.toggle('is-ok', type === 'ok');
}

function aendereTeamPasswort(){
  if (!requireAdmin()) return;

  const currentPass = currentTeamPassEl.value;
  const newPass = newTeamPassEl.value.trim();
  const repeatPass = repeatTeamPassEl.value.trim();

  if (currentPass !== getTeamPass()) {
    setTeamPasswordStatus('Aktuelles Startpasswort ist falsch.');
    logAction('TEAM-PASS-FAIL', 'Falsches aktuelles Startpasswort');
    return;
  }

  if (newPass.length < 4) {
    setTeamPasswordStatus('Neues Startpasswort muss mindestens 4 Zeichen haben.');
    return;
  }

  if (newPass !== repeatPass) {
    setTeamPasswordStatus('Neues Startpasswort stimmt nicht ueberein.');
    return;
  }

  teamPass = newPass;
  clearPasswordForm();
  setTeamPasswordStatus('Startpasswort wurde geaendert.', 'ok');
  logAction('TEAM-PASS', 'Startseiten Passwort geaendert');
  speichereFirebaseDaten();
  renderCommandCenter();
}

function updateAdminControls(){
  const loggedIn = isAdminLoggedIn();
  adminToolbar.classList.toggle('is-visible', loggedIn);
  grid.querySelectorAll('.card').forEach((card) => {
    card.draggable = loggedIn;
  });
}

function render(){
  const suchbegriff = searchEl.value.trim().toLowerCase();
  const gefiltert = alleVerstoesse.filter(v =>
    !suchbegriff || v.verstoss.toLowerCase().includes(suchbegriff) || v.strafe.toLowerCase().includes(suchbegriff)
  );

  countEl.textContent = `${gefiltert.length} / ${alleVerstoesse.length}`;
  emptyEl.hidden = gefiltert.length !== 0;

  grid.innerHTML = gefiltert.map((v, index) => {
    const originalIndex = alleVerstoesse.indexOf(v);
    const farbe = LEVEL_FARBE[v.level] || LEVEL_FARBE[1];
    return `
      <article class="card" data-index="${originalIndex}" draggable="${isAdminLoggedIn()}" style="--card-color:${farbe.color}; --card-glow:${farbe.glow}; --card-bg:${farbe.bg};">
        ${isAdminLoggedIn() ? `<button type="button" class="card-edit-btn" data-card-edit="${originalIndex}">EDIT</button>` : ''}
        <h2 class="card-name">${escapeHtml(v.verstoss)}</h2>
        <div class="stars" aria-label="Wanted-Level ${v.level} von 5">${renderSterne(v.level)}</div>
        <span class="card-tag">${escapeHtml(v.strafe)}</span>
      </article>
    `;
  }).join('');

  bindeDragDrop(grid.querySelectorAll('.card'));
  grid.querySelectorAll('[data-card-edit]').forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const index = Number(btn.dataset.cardEdit);
      adminOverlay.classList.add('open');
      zeigeDashboard();
      ladeInForm(index);
    });
  });
}

function renderAdminListe(){
  adminListEl.innerHTML = alleVerstoesse.map((v, index) => {
    return `
      <div class="admin-row" data-index="${index}" draggable="true">
        <div>
          <p class="admin-row-title">${escapeHtml(v.verstoss)}</p>
          <div class="admin-row-meta">${v.level} Sterne · ${escapeHtml(v.strafe)}</div>
        </div>
        <div class="admin-row-actions">
          <button type="button" class="admin-btn small" data-edit="${index}">Bearbeiten</button>
          <button type="button" class="admin-btn small danger" data-delete="${index}">Loeschen</button>
        </div>
      </div>
    `;
  }).join('');

  adminListEl.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => ladeInForm(Number(btn.dataset.edit)));
  });

  adminListEl.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => loescheEintrag(Number(btn.dataset.delete)));
  });

  bindeDragDrop(adminListEl.querySelectorAll('.admin-row'));
}

function bindeDragDrop(items){
  items.forEach((item) => {
    item.addEventListener('dragstart', (ev) => {
      if (ev.target.closest('button')) {
        ev.preventDefault();
        return;
      }
      if (!requireAdmin()) {
        ev.preventDefault();
        return;
      }
      draggedIndex = Number(item.dataset.index);
      dragPlaceAfter = false;
      item.classList.add('is-dragging');
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setData('text/plain', String(draggedIndex));
    });

    item.addEventListener('dragover', (ev) => {
      if (draggedIndex === null) return;
      ev.preventDefault();
      const rect = item.getBoundingClientRect();
      const horizontalGrid = item.classList.contains('card');
      dragPlaceAfter = horizontalGrid
        ? ev.clientX > rect.left + rect.width / 2
        : ev.clientY > rect.top + rect.height / 2;
      item.classList.toggle('is-drop-before', !dragPlaceAfter);
      item.classList.toggle('is-drop-after', dragPlaceAfter);
      ev.dataTransfer.dropEffect = 'move';
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('is-drop-before', 'is-drop-after');
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('is-dragging', 'is-drop-before', 'is-drop-after');
      draggedIndex = null;
      dragPlaceAfter = false;
    });

    item.addEventListener('drop', (ev) => {
      ev.preventDefault();
      item.classList.remove('is-drop-before', 'is-drop-after');
      const targetIndex = Number(item.dataset.index);
      verschiebeEintrag(draggedIndex, targetIndex, dragPlaceAfter);
      draggedIndex = null;
      dragPlaceAfter = false;
    });
  });
}

function verschiebeEintrag(vonIndex, zielIndex, nachZiel){
  if (!requireAdmin()) return;
  if (!Number.isInteger(vonIndex) || !Number.isInteger(zielIndex)) return;
  if (vonIndex === zielIndex) return;
  if (!alleVerstoesse[vonIndex] || !alleVerstoesse[zielIndex]) return;

  erstelleBackup('VOR_REORDER');
  const [eintrag] = alleVerstoesse.splice(vonIndex, 1);
  let insertIndex = zielIndex;
  if (vonIndex < zielIndex) insertIndex -= 1;
  if (nachZiel) insertIndex += 1;
  insertIndex = Math.max(0, Math.min(insertIndex, alleVerstoesse.length));
  alleVerstoesse.splice(insertIndex, 0, eintrag);
  speichereAdminDaten();
  logAction('REORDER', `${eintrag.verstoss} verschoben`);
  render();
  renderCommandCenter();
  renderAdminListe();
}

function openAdminGate(action = 'manage'){
  pendingAdminAction = action;
  if (isAdminLoggedIn()) {
    adminOverlay.classList.add('open');
    zeigeDashboard();
  } else {
    showShortcutLogin();
  }
}

function closeAdmin(){
  adminOverlay.classList.remove('open');
}

function zeigeLogin(){
  adminLogin.hidden = false;
  adminDashboard.hidden = true;
  adminLoginError.hidden = true;
  adminUserEl.value = ADMIN_USER;
  adminPasswordEl.value = '';
  setTimeout(() => adminPasswordEl.focus(), 50);
}

function zeigeDashboard(){
  adminLogin.hidden = true;
  adminDashboard.hidden = false;
  clearPasswordForm();
  passwordStatusEl.hidden = true;
  teamPasswordStatusEl.hidden = true;
  renderCommandCenter();
  renderAdminListe();
  if (pendingAdminAction === 'new') leereForm();
}

function doAdminLogin(){
  attemptAdminLogin(adminUserEl.value.trim(), adminPasswordEl.value, adminLoginError, adminPasswordEl, true);
}

function doShortcutLogin(){
  attemptAdminLogin(
    shortcutAdminUserEl.value.trim(),
    shortcutAdminPasswordEl.value,
    shortcutLoginError,
    shortcutAdminPasswordEl,
    true
  );
}

function attemptAdminLogin(user, pass, errorEl, passwordEl, openDashboardAfterLogin){
  if (user === ADMIN_USER && pass === getAdminPass()) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ user, ts: Date.now() }));
    logAction('LOGIN', 'Admin eingeloggt');
    updateAdminControls();
    render();
    hideShortcutLogin();
    if (openDashboardAfterLogin) {
      adminOverlay.classList.add('open');
      zeigeDashboard();
    }
    return;
  }
  errorEl.hidden = false;
  passwordEl.value = '';
  logAction('LOGIN-FAIL', `Fehlversuch fuer Benutzer "${user || '-'}"`);
}

function doAdminLogout(){
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  logAction('LOGOUT', 'Admin ausgeloggt');
  updateAdminControls();
  render();
  closeAdmin();
  showShortcutLogin();
}

function requireAdmin(){
  if (isAdminLoggedIn()) return true;
  showShortcutLogin();
  return false;
}

function showShortcutLogin(){
  shortcutLogin.hidden = false;
  shortcutLoginError.hidden = true;
  shortcutAdminUserEl.value = ADMIN_USER;
  shortcutAdminPasswordEl.value = '';
  setTimeout(() => shortcutAdminPasswordEl.focus(), 50);
}

function hideShortcutLogin(){
  shortcutLogin.hidden = true;
  shortcutLoginError.hidden = true;
  shortcutAdminPasswordEl.value = '';
}

function leereForm(){
  adminTitle.textContent = 'Neuer Eintrag';
  entryIndexEl.value = '';
  entryNameEl.value = '';
  entryPenaltyEl.value = '';
  entryLevelEl.value = '1';
  entryNameEl.focus();
}

function ladeInForm(index){
  const eintrag = alleVerstoesse[index];
  if (!eintrag) return;
  adminTitle.textContent = 'Eintrag bearbeiten';
  entryIndexEl.value = String(index);
  entryNameEl.value = eintrag.verstoss;
  entryPenaltyEl.value = eintrag.strafe;
  entryLevelEl.value = String(eintrag.level);
}

function speichereEintrag(ev){
  ev.preventDefault();
  if (!requireAdmin()) return;

  const eintrag = {
    verstoss: entryNameEl.value.trim(),
    strafe: entryPenaltyEl.value.trim(),
    level: begrenzeLevel(entryLevelEl.value)
  };

  if (!eintrag.verstoss || !eintrag.strafe) return;

  const index = entryIndexEl.value === '' ? -1 : Number(entryIndexEl.value);
  erstelleBackup(index >= 0 ? 'VOR_EDIT' : 'VOR_ADD');
  if (index >= 0 && alleVerstoesse[index]) {
    alleVerstoesse[index] = eintrag;
    logAction('EDIT', `Eintrag bearbeitet: ${eintrag.verstoss}`);
  } else {
    fuegeNachSternGruppeEin(eintrag);
    logAction('ADD', `Eintrag hinzugefuegt: ${eintrag.verstoss}`);
  }

  speichereAdminDaten();
  render();
  renderCommandCenter();
  renderAdminListe();
  leereForm();
}

function loescheEintrag(index){
  if (!requireAdmin()) return;
  const eintrag = alleVerstoesse[index];
  if (!eintrag) return;
  if (!confirm(`Eintrag wirklich loeschen?\n\n${eintrag.verstoss}`)) return;
  erstelleBackup('VOR_DELETE');
  alleVerstoesse.splice(index, 1);
  logAction('DELETE', `Eintrag geloescht: ${eintrag.verstoss}`);
  speichereAdminDaten();
  render();
  renderCommandCenter();
  renderAdminListe();
  leereForm();
}

function resetAdminDaten(){
  if (!requireAdmin()) return;
  if (!confirm('Alle Admin-Aenderungen verwerfen und strafen.json neu laden?')) return;
  erstelleBackup('VOR_RESET');
  alleVerstoesse = normalisiereVerstoesse(grundDaten.verstoesse || []);
  logAction('RESET', 'Admin-Aenderungen verworfen');
  speichereAdminDaten();
  render();
  renderCommandCenter();
  renderAdminListe();
  leereForm();
}

function stelleBackupWiederHer(){
  if (!requireAdmin()) return;
  const backup = ladeBackup();
  if (!backup) {
    alert('Es ist noch kein Backup vorhanden.');
    return;
  }
  const zeit = formatiereBackupZeit(backup);
  if (!confirm(`Backup von ${zeit} wiederherstellen?\n\nAktuelle Eintraege werden vorher gesichert.`)) return;
  erstelleBackup('VOR_RESTORE');
  alleVerstoesse = backup.verstoesse;
  speichereAdminDaten();
  logAction('RESTORE', `Backup wiederhergestellt: ${zeit}`);
  render();
  renderCommandCenter();
  renderAdminListe();
  leereForm();
}

function exportiereJson(){
  if (!requireAdmin()) return;
  const daten = {
    stand: new Date().toISOString().slice(0, 10),
    verstoesse: alleVerstoesse,
    hinweise: grundDaten.hinweise || []
  };
  const blob = new Blob([JSON.stringify(daten, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'strafen.json';
  a.click();
  URL.revokeObjectURL(url);
  logAction('EXPORT', 'strafen.json exportiert');
  renderCommandCenter();
}

function renderCommandCenter(){
  const maxLevel = alleVerstoesse.reduce((max, v) => Math.max(max, v.level), 0);
  const backup = ladeBackup();
  dashTotal.textContent = String(alleVerstoesse.length);
  dashMaxLevel.textContent = String(maxLevel);
  dashSession.textContent = isAdminLoggedIn() ? 'ON' : 'OFF';
  dashSessionMeta.textContent = isAdminLoggedIn() ? `admin · ${new Date().toLocaleTimeString('de-DE')} Uhr` : 'nicht eingeloggt';
  dashStorage.textContent = firebaseReady ? 'FIREBASE' : (backup ? 'BACKUP' : 'JSON');
  [dashRestoreBtn, restoreBtn].forEach((btn) => {
    btn.disabled = !backup;
    btn.title = backup ? `Backup: ${formatiereBackupZeit(backup)}` : 'Noch kein Backup vorhanden';
  });
  renderActivityLog();
}

function getActivityLog(){
  return activityLog;
}

function logAction(action, detail){
  activityLog.unshift({
    ts: Date.now(),
    user: ADMIN_USER,
    action,
    detail
  });
  activityLog = activityLog.slice(0, 80);
}

function renderActivityLog(){
  const log = getActivityLog();
  if (!log.length) {
    activityLogEl.innerHTML = '<div class="activity-row"><span>-</span><span class="activity-action">LEER</span><span class="activity-detail">Noch keine Aktivitaet.</span></div>';
    return;
  }
  activityLogEl.innerHTML = log.slice(0, 20).map(item => {
    const zeit = new Date(item.ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return `<div class="activity-row"><span>${zeit}</span><span class="activity-action">${escapeHtml(item.action)}</span><span class="activity-detail">${escapeHtml(item.detail)}</span></div>`;
  }).join('');
}

function clearActivityLog(){
  if (!requireAdmin()) return;
  activityLog = [];
  logAction('SECURITY', 'Aktivitaetslog geleert');
  renderCommandCenter();
}

function renderSterne(level){
  let html = '';
  for (let i = 1; i <= 5; i++){
    const filled = i <= level;
    html += `<svg viewBox="0 0 24 24" class="${filled ? 'filled' : 'empty'}"><polygon points="12,2 15,9 23,9.5 17,15 19,23 12,18.5 5,23 7,15 1,9.5 9,9"/></svg>`;
  }
  return html;
}

function renderHinweise(hinweise){
  hinweiseEl.innerHTML = hinweise.map(h => `<li>${escapeHtml(h)}</li>`).join('');
}

function begrenzeLevel(level){
  const nr = Number(level);
  if (!Number.isFinite(nr)) return 1;
  return Math.min(5, Math.max(1, Math.round(nr)));
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
