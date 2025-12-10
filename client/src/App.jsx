// client/src/App.jsx - LOGIN FIRST
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* KHÔNG LOGIN → LOGIN PAGE */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} 
      />
      {/* ĐÃ LOGIN → PRODUCTS PAGE */}
      <Route 
        path="/" 
        element={isAuthenticated ? <ProductsPage /> : <Navigate to="/login" />} 
      />
      {/* DEFAULT → LOGIN TRƯỚC */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
