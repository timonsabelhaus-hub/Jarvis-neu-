JARVIS – sauberer Neustart

Dateien: index.html, netlify.toml und netlify/functions/jarvis.mjs.

WICHTIG: API-Schlüssel NICHT in index.html, nicht in GitHub und nicht im Chat eintragen.
Netlify: Project configuration / Environment variables -> OPENAI_API_KEY -> Secret value.
Danach muss die komplette Projektstruktur über GitHub mit Netlify verbunden deployt werden.

Repository-Struktur: index.html und netlify.toml im Hauptordner; jarvis.mjs im Unterordner netlify/functions/.
Build command leer lassen; Publish directory = .; Functions directory = netlify/functions.

Diese Version nutzt OpenAI API (gpt-4o-mini). API-Abrechnung ist getrennt von ChatGPT und kann Kosten verursachen.
