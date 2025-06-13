import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        console.log("Inside handleLogin");
    };

    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="login-card p-4 border rounded">
              <h2 className="text-center mb-4 font-weight-bold">Anmelden</h2>
              
              <div className="mb-3">
                <label htmlFor="email" className="form-label">E-Mail-Adresse</label>
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
                <label htmlFor="password" className="form-label">Passwort</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Geben Sie Ihr Passwort ein"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button className="btn btn-primary w-100 mb-3" onClick={handleLogin}>
                Anmelden
              </button>

              <p className="mt-4 text-center">
                Neu hier? <a href="/app/register" className="text-primary">Hier registrieren</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
}

export default LoginPage;