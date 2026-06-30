const grid       = document.getElementById('cardGrid');
const searchEl   = document.getElementById('search');
const emptyEl    = document.getElementById('emptyState');
const countEl    = document.getElementById('resultCount');
const hinweiseEl = document.getElementById('hinweiseListe');

let alleVerstoesse = [];

// Level 1-5 -> Farbe (hex) + glow-rgba — von Ember-Gold (leicht) zu Blutrot (schwer)
const LEVEL_FARBE = {
  1: { color: '#e0982f', glow: 'rgba(224,152,47,.45)', bg: 'rgba(224,152,47,.07)' },
  2: { color: '#e57a2c', glow: 'rgba(229,122,44,.4)',  bg: 'rgba(229,122,44,.07)' },
  3: { color: '#e15732', glow: 'rgba(225,87,50,.4)',   bg: 'rgba(225,87,50,.08)' },
  4: { color: '#e3242f', glow: 'rgba(227,36,47,.45)',  bg: 'rgba(227,36,47,.08)' },
  5: { color: '#ff1320', glow: 'rgba(255,19,32,.55)',  bg: 'rgba(255,19,32,.1)' }
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
