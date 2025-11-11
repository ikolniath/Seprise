// ===============================================================
// UsersDashboard.jsx
// Dashboard sencillo que reutiliza la Navbar y monta el UserContainer
// ===============================================================
import React from 'react';
import Navbar from '../components/Navbar';
import UserContainer from './containers/UserContainer';
import '../styles/theme.css';

export default function UsersDashboard() {
  return (
    <>
      <Navbar currentView="usuarios" setView={() => {}} />
      <div className="container py-5">
        <div className="card p-4 shadow-sm">
          <h3 className="text-primary mb-4">Panel de usuarios</h3>
          <UserContainer />
        </div>
      </div>
    </>
  );
}
