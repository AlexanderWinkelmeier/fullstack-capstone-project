// config.js

// 1. Die Umgebungsvariable in eine eigene Konstante auslagern.
const backendUrl = process.env.REACT_APP_BACKEND_URL;

// 2. Prüfen, ob die Variable gesetzt ist. Wenn nicht, einen Fehler werfen.
//    Dies stoppt die Anwendung sofort und macht klar, was das Problem ist.
if (!backendUrl) {
  throw new Error("FATAL: REACT_APP_BACKEND_URL ist nicht definiert. Bitte prüfen Sie Ihre .env-Datei oder die Umgebungsvariablen.");
}

// 3. Das Konfigurationsobjekt erstellen.
const config = {
  backendUrl: backendUrl,
};

// Das console.log kann zur Bestätigung während der Entwicklung nützlich sein.
console.log(`Backend-URL erfolgreich konfiguriert: ${config.backendUrl}`);

// 4. 'export default' verwenden, da dies die gängigste Methode ist,
//    wenn eine Datei nur ein Hauptobjekt exportiert.
export default config;