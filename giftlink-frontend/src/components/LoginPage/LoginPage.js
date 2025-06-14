import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login fehlgeschlagen');
      }

      const data = await response.json();

      // Speichere den Token im localStorage
      localStorage.setItem('authToken', data.authtoken);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem(
        'userName',
        `${data.user.firstName} ${data.user.lastName}`
      ); // Weiterleitung zur Hauptseite
      navigate('/app');
    } catch (error) {
      alert(error.message || 'Login fehlgeschlagen');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="login-card p-4 border rounded">
            <h2 className="text-center mb-4 font-weight-bold">Anmelden</h2>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="Geben Sie Ihre E-Mail-Adresse ein"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Geben Sie Ihr Passwort ein"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary w-100 mb-3"
              onClick={handleLogin}
            >
              Anmelden
            </button>

            <p className="mt-4 text-center">
              Neu hier?{' '}
              <a href="/app/register" className="text-primary">
                Hier registrieren
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
