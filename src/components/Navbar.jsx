// ===========================================================
// Navbar.jsx
// Barra superior reutilizable con botón de cierre de sesión
// ===========================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaUser, FaCalendarAlt, FaClipboardList, FaSignOutAlt } from 'react-icons/fa';
import '../styles/theme.css';

export default function Navbar({
  currentView = '',
  setView = () => {},
  showNavButtons = true,
}) {
  const navigate = useNavigate();

  const viewRoutes = {
    admin: '/admin',
    turnos: '/turnos',
    usuarios: '/usuarios',
  };

  const handleNavigate = (viewKey) => {
    setView(viewKey);
    const path = viewRoutes[viewKey];
    if (path) navigate(path);
  };

  const handleLogout = () => {
    // Aquí se podrían limpiar tokens o storage si existieran
    navigate('/');
  };

  return (
    <nav className="navbar d-flex justify-content-between align-items-center px-4 py-2 sticky-top">
      <div className="d-flex align-items-center gap-2">
        <div className="logo-circle d-flex align-items-center justify-content-center">
          <FaUserMd size={20} color="white" />
        </div>
        <h4 className="m-0 text-primary fw-bold">Clínica Seprise</h4>
      </div>

      <div className="d-flex align-items-center gap-2">
        {showNavButtons && (
          <div className="d-flex gap-3">
            <button
              className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavigate('admin')}
            >
              <FaClipboardList /> Panel Administración
            </button>

            <button
              className={`nav-btn ${currentView === 'turnos' ? 'active' : ''}`}
              onClick={() => handleNavigate('turnos')}
            >
              <FaCalendarAlt /> Turnos
            </button>

            <button
              className={`nav-btn ${currentView === 'usuarios' ? 'active' : ''}`}
              onClick={() => handleNavigate('usuarios')}
            >
              <FaUser /> Usuarios
            </button>
          </div>
        )}
        <button className="nav-btn logout-btn d-flex align-items-center gap-2" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
}
