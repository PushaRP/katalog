// ── Team-Passwortschutz ──────────────────────────────────────────
// Passwort hier ändern. Liegt im Klartext im Code (kein echter Schutz,
// siehe README), reicht aber, um Außenstehende fernzuhalten.
const TEAM_PASSWORT = "prpusha";

const SESSION_KEY = "bannkatalog_freigeschaltet";

const lockScreen = document.getElementById('lockScreen');
const appContent = document.getElementById('appContent');
const lockForm   = document.getElementById('lockForm');
const lockInput  = document.getElementById('lockInput');
const lockError  = document.getElementById('lockError');

if (sessionStorage.getItem(SESSION_KEY) === "true") {
  freischalten();
}

lockForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  if (lockInput.value === TEAM_PASSWORT) {
    sessionStorage.setItem(SESSION_KEY, "true");
    freischalten();
  } else {
    lockError.hidden = false;
    lockInput.value = "";
    lockInput.focus();
  }
});

function freischalten(){
  lockScreen.style.display = "none";
  appContent.hidden = false;
}
