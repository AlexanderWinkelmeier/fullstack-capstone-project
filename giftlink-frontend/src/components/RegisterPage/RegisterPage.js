import React, { useState } from 'react';
// KORRIGIERT: Die <Link>-Komponente für die Navigation importieren
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // NEU: Zustände für Ladeindikatoren und Fehlermeldungen für besseres UX
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // KORRIGIERT: Die Funktion wird durch das Absenden des Formulars ausgelöst
  const handleSubmit = async (e) => {
    // Verhindert das Neuladen der Seite durch das Formular
    e.preventDefault();

    setIsLoading(true);
    setError(''); // Fehler bei jedem neuen Versuch zurücksetzen

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Wirft einen Fehler, der im catch-Block gefangen wird
        throw new Error(errorData.message || 'Registrierung fehlgeschlagen.');
      }

      // Bei Erfolg: Navigiere zur Login-Seite mit einer Erfolgsmeldung
      // (Die Meldung wird über den "state" der Navigation übergeben)
      navigate('/app/login', {
        state: { message: 'Registrierung erfolgreich! Bitte melden Sie sich an.' },
      });
    } catch (err) {
      // KORRIGIERT: Fehler im UI anzeigen statt mit alert()
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      // NEU: Ladezustand beenden, egal ob erfolgreich oder nicht
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="register-card p-4 border rounded">
            <h2 className="text-center mb-4 font-weight-bold">Registrieren</h2>
            
            {/* KORRIGIERT: Ein <form>-Element verwenden */}
            <form onSubmit={handleSubmit}>
              {/* NEU: Anzeige für Fehlermeldungen */}
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">
                  Vorname
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="form-control"
                  placeholder="Dein Vorname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required // HTML5-Validierung hinzufügen
                />
              </div>

              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">
                  Nachname
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="form-control"
                  placeholder="Dein Nachname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  E-Mail
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="Deine E-Mail-Adresse"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Passwort
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Dein Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6" // Beispiel für eine Validierungsregel
                />
              </div>

              <button
                type="submit" // KORRIGIERT: Button-Typ ist "submit"
                className="btn btn-primary w-100 mb-3"
                disabled={isLoading} // NEU: Button deaktivieren während des Ladens
              >
                {isLoading ? 'Registriere...' : 'Registrieren'}
              </button>
            </form>

            <p className="mt-4 text-center">
              Bereits Mitglied?{' '}
              {/* KORRIGIERT: <Link> für die Navigation ohne Neuladen verwenden */}
              <Link to="/app/login" className="text-primary">
                Anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;