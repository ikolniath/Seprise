// ===============================================================
// MedicoDashboard.jsx
// Vista del médico: tabla de turnos sin edición + logout
// ===============================================================
import React from 'react';
import Navbar from '../components/Navbar';
import DoctorTurnContainer from './containers/DoctorTurnContainer';
import '../styles/theme.css';

export default function MedicoDashboard() {
  return (
    <>
      <Navbar currentView="medico" setView={() => {}} showNavButtons={false} />
      <div className="container py-5">
        <div className="card p-4 shadow-sm">
          <h3 className="text-primary mb-4">Agenda de Turnos</h3>
          <DoctorTurnContainer />
        </div>
      </div>
    </>
  );
}
