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

## Firebase-Datenbank (gemeinsamer Zugriff fürs Team)

Der Katalog wird jetzt in einer **Firestore-Datenbank** gespeichert statt nur lokal im Browser. Das heißt: Wenn ein Teammitglied etwas ändert, sehen alle anderen es automatisch — ohne Neuladen.

### Einmaliges Setup in der Firebase Console

1. Gehe zu [console.firebase.google.com](https://console.firebase.google.com) → dein Projekt `pusharp-71b49`.
2. Links im Menü **Firestore Database** → **Datenbank erstellen** (falls noch nicht geschehen).
3. Region wählen (z. B. `eur3 (europe-west)`), **Testmodus** oder eigene Regeln (siehe unten).
4. Unter **Regeln** (Rules-Tab) folgendes eintragen und **Veröffentlichen**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /katalog/{docId} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Wichtig:** Diese Regel erlaubt jedem mit dem Firebase-Config (der im Quellcode öffentlich sichtbar ist) Lese- **und Schreibzugriff** auf die Datenbank — unabhängig vom Passwort-Screen der Seite, da dieser nur clientseitig prüft. Für ein internes Team-Tool ist das üblich und akzeptabel, aber falls ihr strengere Sicherheit wollt, müsstet ihr echtes Firebase Authentication einbauen (deutlich mehr Aufwand).

### Dateien, die dazugekommen sind

- `firebase-config.js` – enthält eure Firebase-Projektdaten und die Verbindung zu Firestore
- `index.html` lädt jetzt zusätzlich die Firebase-SDKs (per CDN) vor `script.js`

### Wie die Daten jetzt fließen

- Beim ersten Laden: Falls die Firestore-Datenbank noch leer ist, wird sie automatisch mit dem Inhalt von `strafen.json` befüllt.
- Danach ist **Firestore die Wahrheit** — `strafen.json` wird nur noch als Erstbefüllung / Reset-Vorlage gebraucht.
- Jede Änderung (Eintrag hinzufügen/bearbeiten/löschen/sortieren) wird sofort in Firestore geschrieben und live an alle offenen Browser-Tabs verteilt.
- Backups und das Aktivitätsprotokoll bleiben weiterhin **lokal im Browser** (nicht geteilt) — das ist eine bewusste Vereinfachung, kann bei Bedarf später ebenfalls in Firestore verschoben werden.

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
