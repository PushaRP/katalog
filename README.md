# GTA RP – Ban-Katalog

Statische Webseite mit eurem Strafenkatalog (Verstoß → Strafe) als Nachschlagewerk fürs Team. Läuft komplett ohne Backend über **GitHub Pages**.

## Dateien

- `index.html` – Seitenstruktur
- `style.css` – Design
- `script.js` – Suche, Tabellen-Rendering
- `lock.js` – Passwortschutz (nur fürs Team sichtbar)
- `strafen.json` – **Hier passt du die Strafen an** (kein Programmieren nötig)

## Strafe ändern oder neuen Verstoß hinzufügen

Öffne `strafen.json` und ergänze im Array `verstoesse`:

```json
{ "verstoss": "Neuer Verstoß", "strafe": "5 Tage Ban" }
```

Schreibst du `"Permanenter Ban"` als Strafe, wird die Zeile automatisch rot statt amber hervorgehoben.

Die Hinweise unten auf der Seite stehen im Array `hinweise` — Reihenfolge und Text frei anpassbar.

## Team-Passwort ändern

Öffne `lock.js` und ändere:

```js
const TEAM_PASSWORT = "andereswort";
```

⚠️ Nur Sichtschutz, keine echte Sicherheit — der Code liegt öffentlich auf GitHub. Für ein internes Regelwerk reicht das meist aus. Falls die Seite ohnehin für alle Spieler sichtbar sein soll, kannst du `lock.js` und den Lock-Screen-Block aus `index.html` einfach entfernen.

## Auf GitHub Pages veröffentlichen

1. Neues Repository auf GitHub erstellen (z. B. `ban-katalog`).
2. Alle Dateien hochladen (`index.html`, `style.css`, `script.js`, `lock.js`, `strafen.json`).
3. Im Repo zu **Settings → Pages** gehen.
4. Branch `main`, Ordner `/ (root)` auswählen, speichern.
5. Nach ca. 1 Minute erreichbar unter `https://DEINNAME.github.io/ban-katalog/`.

## Lokal testen

```bash
python3 -m http.server 8000
# dann im Browser: http://localhost:8000
```
