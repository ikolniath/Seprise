// ===========================================================
// App.js - Router principal de Clínica Seprise
// ===========================================================
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import MedicoDashboard from './pages/MedicoDashboard';
import TurnDashboard from './pages/TurnDashboard';
import UsersDashboard from './pages/UsersDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/medico" element={<MedicoDashboard />} />
        <Route path="/turnos" element={<TurnDashboard />} />
        <Route path="/usuarios" element={<UsersDashboard />} />
        <Route
          path="*"
          element={
            <div className="container py-5 text-center">
              <h2 className="text-danger">404 - Página no encontrada</h2>
              <p>
                Verifica la dirección o regresa al <a href="/">inicio de sesión</a>.
              </p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
