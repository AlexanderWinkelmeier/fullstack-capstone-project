import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';

// 1. Umbenannt für mehr Klarheit (Best Practice)
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(null); // null als Initialwert ist oft besser als ""

  // 2. Gekapselte Login/Logout-Funktionen statt direkter Setter
  // useCallback verhindert, dass die Funktionen bei jedem Render neu erstellt werden
  const login = useCallback((name) => {
    setUserName(name);
    setIsLoggedIn(true);
    // Hier könnte man z.B. auch ein Token im localStorage speichern
  }, []); // Leeres Abhängigkeitsarray, da die Funktion sich nie ändert

  const logout = useCallback(() => {
    setUserName(null);
    setIsLoggedIn(false);
    // Hier könnte man das Token aus dem localStorage entfernen
  }, []); // Leeres Abhängigkeitsarray

  // 3. useMemo zur Performance-Optimierung
  // Das value-Objekt wird nur neu erstellt, wenn sich isLoggedIn oder userName ändert.
  const value = useMemo(() => ({
    isLoggedIn,
    userName,
    login,
    logout
  }), [isLoggedIn, userName, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Der Custom Hook greift jetzt auf den umbenannten Context zu
export const useAuth = () => useContext(AuthContext);

// Beispiel für die Verwendung in einer Komponente (nur zur Demonstration)
/*
function LoginButton() {
  const { login } = useAuth();
  return <button onClick={() => login("Anna")}>Login</button>;
}

function UserProfile() {
  const { isLoggedIn, userName, logout } = useAuth();
  if (!isLoggedIn) return null;
  return (
    <div>
      Welcome, {userName}! <button onClick={logout}>Logout</button>
    </div>
  );
}
*/
