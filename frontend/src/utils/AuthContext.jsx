import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null); // null = not logged in, 'admin' or 'customer'
  const [userEmail, setUserEmail] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (email, role) => {
    setUserEmail(email);
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUserEmail(null);
    setUserRole(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ userRole, userEmail, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
