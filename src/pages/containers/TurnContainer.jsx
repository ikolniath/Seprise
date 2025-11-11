// ===============================================================
// TurnContainer.jsx
// Lógica completa para: buscar paciente por DNI, validar horarios
// hábiles, bloquear especialidad y crear pago asociado al turno.
// ===============================================================
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000/api';
const PAYMENT_TYPES = ['Efectivo', 'Tarjeta Débito', 'Transferencia', 'Tarjeta Crédito'];
const MAX_DAYS_AHEAD = 20;

// Genera los horarios en formato HH:00 entre las 09 y las 18 inclusive
const TIME_SLOTS = Array.from({ length: 10 }, (_, index) =>
  `${String(9 + index).padStart(2, '0')}:00`
);

const initialForm = {
  id: null,
  fecha: '',
  hora: '',
  medico_id: '',
  especialidad: '',
  paciente_id: '',
  monto: '',
  tipo_pago: '',
};

const initialPatientState = {
  dni: '',
  data: null,
  loading: false,
};

const addDays = (date, amount) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
};

const formatDateInput = (date) => date.toISOString().slice(0, 10);

const isWeekday = (isoDate) => {
  const day = new Date(isoDate).getDay();
  return day >= 1 && day <= 5;
};

const formatHumanDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  });

const generateFutureDates = () => {
  const result = [];
  const today = new Date();
  for (let i = 1; i <= MAX_DAYS_AHEAD; i += 1) {
    const candidate = addDays(today, i);
    const iso = formatDateInput(candidate);
    if (isWeekday(iso)) {
      result.push({ value: iso, label: formatHumanDate(iso) });
    }
  }
  return result;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

export default function TurnContainer() {
  const [turnos, setTurnos] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [patientState, setPatientState] = useState(initialPatientState);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [occupiedHours, setOccupiedHours] = useState([]);

  const availableDates = useMemo(generateFutureDates, []);

  useEffect(() => {
    loadTurnos();
    loadMedicos();
  }, []);

  useEffect(() => {
    if (formData.medico_id && formData.fecha) {
      fetchOccupiedHours(formData.medico_id, formData.fecha, formData.id);
    } else {
      setOccupiedHours([]);
    }
  }, [formData.medico_id, formData.fecha, formData.id]);

  const loadTurnos = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/turnos`);
      const normalized = data.map((turno) => {
        const pacienteNombre = [turno.paciente_nombre, turno.paciente_apellido]
          .filter(Boolean)
          .join(' ')
          .trim() || 'Sin asignar';
        const medicoNombre = [turno.medico_nombre, turno.medico_apellido]
          .filter(Boolean)
          .join(' ')
          .trim() || 'Sin asignar';

        return {
          id: turno.id,
          fecha: turno.fecha,
          fechaBonita: turno.fecha ? new Date(turno.fecha).toLocaleDateString() : '',
          hora: turno.hora,
          horaCorta: turno.hora ? turno.hora.slice(0, 5) : '',
          medico_id: turno.medico_id,
          paciente_id: turno.paciente_id,
          especialidad: turno.especialidad,
          medicoNombre,
          pacienteNombre,
          pacienteDetalle: {
            nombre: turno.paciente_nombre || '',
            apellido: turno.paciente_apellido || '',
          },
          pacienteDni: turno.paciente_dni,
          pagoMonto: turno.pago_monto,
          pagoTipo: turno.pago_tipo,
        };
      });
      setTurnos(normalized);
    } catch (error) {
      console.error('Error al cargar turnos', error);
      alert('No se pudieron cargar los turnos.');
    } finally {
      setLoading(false);
    }
  };

  const loadMedicos = async () => {
    try {
      const { data } = await axios.get(`${API}/doctors`);
      setMedicos(data || []);
    } catch (error) {
      console.error('Error al cargar médicos', error);
      alert('No se pudieron cargar los médicos.');
    }
  };

  const fetchOccupiedHours = async (medicoId, fecha, excludeId) => {
    try {
      const params = new URLSearchParams({ medicoId, fecha });
      if (excludeId) params.append('excludeId', excludeId);
      const { data } = await axios.get(`${API}/turnos/ocupados?${params.toString()}`);
      setOccupiedHours(data.occupied || []);
    } catch (error) {
      console.error('Error al verificar disponibilidad', error);
      setOccupiedHours([]);
    }
  };

  const handlePatientSearch = async () => {
    if (!patientState.dni.trim()) {
      alert('Por favor, ingresa un DNI.');
      return;
    }

    try {
      setPatientState((prev) => ({ ...prev, loading: true }));
      const { data } = await axios.get(
        `${API}/patients/buscar/${patientState.dni.trim()}`
      );
      setPatientState({
        dni: data.dni,
        data,
        loading: false,
      });
      setFormData((prev) => ({ ...prev, paciente_id: data.id }));
    } catch (error) {
      console.error('Paciente no encontrado', error);
      alert('No existe un paciente con ese DNI.');
      setPatientState({ dni: '', data: null, loading: false });
    }
  };

  const handleDoctorChange = (value) => {
    const doctor = medicos.find((m) => String(m.id) === String(value));
    setFormData((prev) => ({
      ...prev,
      medico_id: value,
      especialidad: doctor?.especialidad || '',
      hora: '', // obligamos a elegir nuevamente el horario
    }));
  };

  const handleDateChange = (value) => {
    if (!value) {
      setFormData((prev) => ({ ...prev, fecha: '' }));
      return;
    }

    setFormData((prev) => ({ ...prev, fecha: value, hora: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientState.data) {
      alert('Primero debes seleccionar un paciente válido.');
      return;
    }
    if (!formData.medico_id || !formData.fecha || !formData.hora) {
      alert('Completa médico, fecha y hora.');
      return;
    }
    if (occupiedHours.includes(formData.hora)) {
      alert('Ese horario ya está ocupado para el médico seleccionado.');
      return;
    }
    if (!formData.monto || Number(formData.monto) <= 0) {
      alert('Ingresa un monto válido.');
      return;
    }
    if (!formData.tipo_pago || !PAYMENT_TYPES.includes(formData.tipo_pago)) {
      alert('Selecciona un tipo de pago válido.');
      return;
    }

    const payload = {
      dni: patientState.data.dni,
      medico_id: formData.medico_id,
      fecha: formData.fecha,
      hora: formData.hora,
      monto: Number(formData.monto),
      tipo_pago: formData.tipo_pago,
    };

    try {
      if (formData.id) {
        await axios.put(`${API}/turnos/${formData.id}`, payload);
        alert('Turno actualizado correctamente.');
      } else {
        await axios.post(`${API}/turnos`, payload);
        alert('Turno creado correctamente.');
      }
      handleReset();
      loadTurnos();
    } catch (error) {
      console.error('Error al guardar turno', error?.response || error);
      alert(error?.response?.data?.msg || 'No se pudo guardar el turno.');
    }
  };

  const handleEdit = (turno) => {
    setShowForm(true);
    const [firstWord = '', ...restWords] = (turno.pacienteNombre || '').split(' ');
    setPatientState({
      dni: turno.pacienteDni || '',
      data: {
        id: turno.paciente_id,
        dni: turno.pacienteDni,
        nombre: turno.pacienteDetalle?.nombre || firstWord,
        apellido: turno.pacienteDetalle?.apellido || restWords.join(' '),
      },
      loading: false,
    });
    setFormData({
      id: turno.id,
      fecha: turno.fecha ? turno.fecha.slice(0, 10) : '',
      hora: turno.horaCorta || '',
      medico_id: turno.medico_id || '',
      especialidad: turno.especialidad || '',
      paciente_id: turno.paciente_id || '',
      monto: turno.pagoMonto || '',
      tipo_pago: turno.pagoTipo || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este turno?')) return;
    try {
      await axios.delete(`${API}/turnos/${id}`);
      alert('Turno eliminado correctamente.');
      loadTurnos();
    } catch (error) {
      console.error('Error al eliminar turno', error?.response || error);
      alert(error?.response?.data?.msg || 'No se pudo eliminar el turno.');
    }
  };

  const handleReset = () => {
    setShowForm(false);
    setFormData(initialForm);
    setPatientState(initialPatientState);
    setOccupiedHours([]);
  };

  const turnosFiltrados = useMemo(() => {
    const term = search.toLowerCase();
    return turnos.filter((turno) => {
      const fields = [
        turno.medicoNombre,
        turno.pacienteNombre,
        turno.especialidad,
        turno.pagoTipo,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return fields.includes(term);
    });
  }, [turnos, search]);

  return (
    <div className="turn-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="text-primary mb-0">Gestión de turnos</h5>
          <small className="text-muted">Crea nuevos turnos con validaciones clínicas</small>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Cerrar' : '+ Nuevo turno'}
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          {/* Paso 1: búsqueda de paciente por DNI */}
          <div className="card border-0 shadow-sm p-3 mb-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label">DNI del paciente *</label>
                <input
                  className="form-control"
                  placeholder="Ej: 12345678"
                  value={patientState.dni}
                  onChange={(e) =>
                    setPatientState((prev) => ({ ...prev, dni: e.target.value }))
                  }
                  disabled={patientState.loading}
                />
              </div>
              <div className="col-md-2">
                <button
                  className="btn btn-outline-primary w-100"
                  type="button"
                  onClick={handlePatientSearch}
                  disabled={patientState.loading}
                >
                  {patientState.loading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              {patientState.data && (
                <div className="col-md-6">
                  <div className="alert alert-success mb-0">
                    Paciente: <strong>{`${patientState.data.nombre} ${patientState.data.apellido}`}</strong>{' '}
                    (DNI {patientState.data.dni})
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Paso 2: formulario solo si hay paciente */}
          {patientState.data && (
            <form className="row g-3" onSubmit={handleSubmit}>
              <div className="col-md-3">
                <label className="form-label">Médico *</label>
                <select
                  className="form-select"
                  value={formData.medico_id}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                >
                  <option value="">Seleccione</option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} {m.apellido}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Especialidad</label>
                <input
                  className="form-control"
                  value={formData.especialidad}
                  readOnly
                  placeholder="Se completa automáticamente"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Fecha *</label>
                <select
                  className="form-select"
                  value={formData.fecha}
                  onChange={(e) => handleDateChange(e.target.value)}
                >
                  <option value="">Seleccione</option>
                  {availableDates.map((date) => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Hora *</label>
                <select
                  className="form-select"
                  value={formData.hora}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hora: e.target.value }))}
                  disabled={!formData.fecha || !formData.medico_id}
                >
                  <option value="">Seleccione</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot} disabled={occupiedHours.includes(slot)}>
                      {slot} {occupiedHours.includes(slot) ? '(Ocupado)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Monto del turno *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={formData.monto}
                  onChange={(e) => setFormData((prev) => ({ ...prev, monto: e.target.value }))}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Tipo de pago *</label>
                <select
                  className="form-select"
                  value={formData.tipo_pago}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tipo_pago: e.target.value }))}
                >
                  <option value="">Seleccione</option>
                  {PAYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 text-end">
                <button type="submit" className="btn btn-success me-2">
                  Guardar
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleReset}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="input-group mb-3">
        <span className="input-group-text">Buscar</span>
        <input
          type="text"
          className="form-control"
          placeholder="Paciente, médico, especialidad o tipo de pago..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Médico</th>
              <th>Especialidad</th>
              <th>Paciente</th>
              <th>Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnosFiltrados.map((turno) => (
              <tr key={turno.id}>
                <td>{turno.fechaBonita}</td>
                <td>{turno.horaCorta}</td>
                <td>{turno.medicoNombre}</td>
                <td>{turno.especialidad || 'No definida'}</td>
                <td>{turno.pacienteNombre}</td>
                <td>
                  {turno.pagoMonto
                    ? `${formatCurrency(turno.pagoMonto)} - ${turno.pagoTipo || ''}`
                    : 'Sin pago'}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(turno)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(turno.id)}
                  >
                    Eliminar
                  </button>
                </td>
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
