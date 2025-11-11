// ===============================================================
// TurnDashboard.jsx
// Panel para administrar turnos y pagos con estética de AdminDashboard
// ===============================================================
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import TurnContainer from './containers/TurnContainer';
import PaymentContainer from './containers/PaymentContainer';
import '../styles/theme.css';

export default function TurnDashboard() {
  // Estado que indica qué pestaña está activa dentro del dashboard
  const [activeTab, setActiveTab] = useState('turnos');

  return (
    <>
      {/* Navbar global: forzamos currentView en "turnos" para resaltar la pestaña */}
      <Navbar currentView="turnos" setView={() => {}} />
      <div className="container py-5">
        <div className="card p-4 shadow-sm">
          {/* Encabezado al estilo AdminDashboard: título, botones debajo y descripción resumida */}
          <div className="mb-4">
            <h3 className="text-primary mb-3">Gestor de Turnos y Pagos</h3>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <button
                className={`nav-btn ${activeTab === 'turnos' ? 'active' : ''}`}
                onClick={() => setActiveTab('turnos')}
              >
                Turnos
              </button>
              <button
                className={`nav-btn ${activeTab === 'pagos' ? 'active' : ''}`}
                onClick={() => setActiveTab('pagos')}
              >
                Pagos
              </button>
              <button
                className={`nav-btn ${activeTab === 'resumen' ? 'active' : ''}`}
                onClick={() => setActiveTab('resumen')}
              >
                Resumen
              </button>
            </div>
       
          </div>

          {/* Contenido dinámico: cada pestaña muestra su contenedor correspondiente */}
          {activeTab === 'turnos' && <TurnContainer />}
          {activeTab === 'pagos' && <PaymentContainer />}
          {activeTab === 'resumen' && (
            <div className="dashboard-container">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="dashboard-card card-turnos">
                    <h5>Turnos del día</h5>
                    <p className="display-6">--</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="dashboard-card card-pacientes">
                    <h5>Pacientes atendidos</h5>
                    <p className="display-6">--</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="dashboard-card card-pendientes">
                    <h5>Pagos pendientes</h5>
                    <p className="display-6">--</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
