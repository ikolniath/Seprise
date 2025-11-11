// ===========================================================
// 🧭 AdminDashboard.jsx
// Panel principal del administrador con pestañas de gestión
// ===========================================================

import React, { useState } from 'react';
import Navbar from '../components/Navbar'; // Navbar global
import PatientContainer from './containers/PatientContainer'; // ✅ Ruta corregida
import DoctorContainer from './containers/DoctorContainer';   // ✅ Ruta corregida
import ClinicContainer from './containers/clinics';         // ✅ Ruta corregida
import '../styles/theme.css'; // ✅ Ruta correcta desde /pages

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pacientes');

  return (
    <>
      <Navbar currentView="admin" setView={() => {}} />
      <div className="container py-5">
        <div className="card p-4 shadow-sm">
          <h3 className="text-primary mb-4">Panel de Administración</h3>

          {/* Menú de secciones */}
          <div className="d-flex gap-3 mb-4">
            <button
              className={`nav-btn ${activeTab === 'pacientes' ? 'active' : ''}`}
              onClick={() => setActiveTab('pacientes')}
            >
              Pacientes
            </button>
            <button
              className={`nav-btn ${activeTab === 'medicos' ? 'active' : ''}`}
              onClick={() => setActiveTab('medicos')}
            >
              Médicos
            </button>
            <button
              className={`nav-btn ${activeTab === 'consultorios' ? 'active' : ''}`}
              onClick={() => setActiveTab('consultorios')}
            >
              Consultorios
            </button>
          </div>

          {/* Contenedor dinámico */}
          {activeTab === 'pacientes' && <PatientContainer />}
          {activeTab === 'medicos' && <DoctorContainer />}
          {activeTab === 'consultorios' && <ClinicContainer />}
        </div>
      </div>
    </>
  );
}
