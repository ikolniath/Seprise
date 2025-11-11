// ===============================================================
// DoctorTurnContainer.jsx
// Listado de turnos solo lectura para el panel del médico
// ===============================================================
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000/api';

export default function DoctorTurnContainer() {
  const [turnos, setTurnos] = useState([]);
  const [searchDni, setSearchDni] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTurnos();
  }, []);

  const loadTurnos = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/turnos`);
      const normalized = data.map((turno) => ({
        id: turno.id,
        fecha: turno.fecha ? new Date(turno.fecha).toLocaleDateString() : '',
        hora: turno.hora ? turno.hora.slice(0, 5) : '',
        medico: [turno.medico_nombre, turno.medico_apellido].filter(Boolean).join(' ').trim(),
        especialidad: turno.especialidad || turno.medico_especialidad || 'Sin especialidad',
        paciente: [turno.paciente_nombre, turno.paciente_apellido].filter(Boolean).join(' ').trim(),
        pacienteDni: turno.paciente_dni || '',
        pago: turno.pago_monto
          ? `${new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
            }).format(turno.pago_monto)} - ${turno.pago_tipo || ''}`
          : 'Sin pago',
      }));
      setTurnos(normalized);
    } catch (error) {
      console.error('Error al cargar turnos', error);
      alert('No se pudieron cargar los turnos.');
    } finally {
      setLoading(false);
    }
  };

  const turnosFiltrados = useMemo(() => {
    if (!searchDni.trim()) return turnos;
    const term = searchDni.trim().toLowerCase();
    return turnos.filter((turno) => turno.pacienteDni.toLowerCase().includes(term));
  }, [turnos, searchDni]);

  return (
    <div className="doctor-turn-container">
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">Buscar por DNI del paciente</label>
          <input
            className="form-control"
            placeholder="Ej: 12345678"
            value={searchDni}
            onChange={(e) => setSearchDni(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>DNI</th>
              <th>Médico</th>
              <th>Especialidad</th>
              <th>Pago</th>
            </tr>
          </thead>
          <tbody>
            {turnosFiltrados.map((turno) => (
              <tr key={turno.id}>
                <td>{turno.fecha}</td>
                <td>{turno.hora}</td>
                <td>{turno.paciente}</td>
                <td>{turno.pacienteDni}</td>
                <td>{turno.medico}</td>
                <td>{turno.especialidad}</td>
                <td>{turno.pago}</td>
              </tr>
            ))}
            {!turnosFiltrados.length && (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No hay turnos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <p className="text-center text-muted mt-3">Cargando...</p>}
    </div>
  );
}
