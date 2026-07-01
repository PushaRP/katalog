const LOCK_DEFAULT_TEAM_PASS = 'pushateam';
const LOCK_SESSION_KEY = 'bannkatalog_freigeschaltet';

const lockScreen = document.getElementById('lockScreen');
const appContent = document.getElementById('appContent');
const lockForm = document.getElementById('lockForm');
const lockInput = document.getElementById('lockInput');
const lockError = document.getElementById('lockError');

let lockTeamPass = LOCK_DEFAULT_TEAM_PASS;

initLock();

async function initLock(){
  await ladeTeamPasswort();

  if (sessionStorage.getItem(LOCK_SESSION_KEY) === 'true') {
    freischalten();
  }

  lockForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (lockInput.value === lockTeamPass) {
      sessionStorage.setItem(LOCK_SESSION_KEY, 'true');
      freischalten();
    } else {
      lockError.hidden = false;
      lockInput.value = '';
      lockInput.focus();
    }
  });
}

async function ladeTeamPasswort(){
  const settings = window.PUSHA_FIREBASE || {};
  const isConfigured = Boolean(
    settings.enabled &&
    settings.config &&
    settings.config.apiKey &&
    settings.config.projectId &&
    !String(settings.config.apiKey).includes('HIER_EINTRAGEN') &&
    !String(settings.config.projectId).includes('HIER_EINTRAGEN') &&
    window.firebase?.initializeApp &&
    window.firebase?.firestore
  );

  if (!isConfigured) return;

  try{
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(settings.config);
    }
    const db = window.firebase.firestore();
    const ref = db
      .collection(settings.collection || 'ban_katalog')
      .doc(settings.dataDoc || 'live');
    const snapshot = await ref.get();
    const data = snapshot.exists ? snapshot.data() : null;
    if (data?.teamPass) lockTeamPass = String(data.teamPass);

    ref.onSnapshot((liveSnapshot) => {
      const liveData = liveSnapshot.exists ? liveSnapshot.data() : null;
      if (liveData?.teamPass) lockTeamPass = String(liveData.teamPass);
    });
  }catch(err){
    console.warn('Startpasswort konnte nicht aus Firebase geladen werden, Standard aktiv:', err);
  }
}

function freischalten(){
  lockScreen.style.display = 'none';
  appContent.hidden = false;
}
