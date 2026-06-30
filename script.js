const grid       = document.getElementById('cardGrid');
const searchEl   = document.getElementById('search');
const emptyEl    = document.getElementById('emptyState');
const countEl    = document.getElementById('resultCount');
const hinweiseEl = document.getElementById('hinweiseListe');

let alleVerstoesse = [];

// Level 1-5 -> Farbe (hex) + glow-rgba
const LEVEL_FARBE = {
  1: { color: '#00e3ff', glow: 'rgba(0,227,255,.45)', bg: 'rgba(0,227,255,.07)' },
  2: { color: '#39e0a8', glow: 'rgba(57,224,168,.4)', bg: 'rgba(57,224,168,.07)' },
  3: { color: '#ffb300', glow: 'rgba(255,179,0,.4)',  bg: 'rgba(255,179,0,.07)' },
  4: { color: '#ff7a3d', glow: 'rgba(255,122,61,.4)', bg: 'rgba(255,122,61,.08)' },
  5: { color: '#ff2e6d', glow: 'rgba(255,46,109,.5)', bg: 'rgba(255,46,109,.09)' }
};

init();

async function init(){
  try{
    const res = await fetch('strafen.json');
    const data = await res.json();
    alleVerstoesse = data.verstoesse || [];
    renderHinweise(data.hinweise || []);
  }catch(err){
    grid.innerHTML = `<p class="empty">Daten konnten nicht geladen werden. Pruefe, ob strafen.json vorhanden ist.</p>`;
    console.error(err);
    return;
  }

  render();
  searchEl.addEventListener('input', render);
}

function render(){
  const suchbegriff = searchEl.value.trim().toLowerCase();

  const gefiltert = alleVerstoesse.filter(v =>
    !suchbegriff || v.verstoss.toLowerCase().includes(suchbegriff)
  );

  countEl.textContent = `${gefiltert.length} / ${alleVerstoesse.length}`;
  emptyEl.hidden = gefiltert.length !== 0;

  grid.innerHTML = gefiltert.map(v => {
    const farbe = LEVEL_FARBE[v.level] || LEVEL_FARBE[1];
    const sterne = renderSterne(v.level, farbe.color);
    return `
      <article class="card" style="--card-color:${farbe.color}; --card-glow:${farbe.glow}; --card-bg:${farbe.bg};">
        <h2 class="card-name">${escapeHtml(v.verstoss)}</h2>
        <div class="stars" aria-label="Wanted-Level ${v.level} von 5">${sterne}</div>
        <span class="card-tag">${escapeHtml(v.strafe)}</span>
      </article>
    `;
  }).join('');
}

function renderSterne(level, color){
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

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
