// ===============================================================
// 🧬 PatientContainer.jsx
// Gestión completa de pacientes (Bootstrap + Axios)
// - Endpoints: /api/patients (GET/POST/PUT/DELETE)
// - Maneja fecha_nacimiento (DATE) correctamente
// ===============================================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000/api'; // 👈 base del backend

export default function PatientContainer() {
  // Lista de pacientes que vienen de la BD
  const [pacientes, setPacientes] = useState([]);

  // Control de mostrar/ocultar el formulario
  const [showForm, setShowForm] = useState(false);

  // Texto del buscador
  const [search, setSearch] = useState('');

  // Estado del formulario (alta/edición)
  const [formData, setFormData] = useState({
    id: null,
    dni: '',
    nombre: '',
    apellido: '',
    telefono: '',
    fecha_nacimiento: '', // 👈 string en formato YYYY-MM-DD para el input date
    domicilio: '',
    email: '',
    obra_social: '',
  });

  // Cargar todos los pacientes al montar
  useEffect(() => {
    cargarPacientes();
  }, []);

  // ==============================
  // 🔹 Cargar todos los pacientes
  // ==============================
  const cargarPacientes = async () => {
    try {
      const { data } = await axios.get(`${API}/patients`);

      // Normalizamos: id y fecha_nacimiento en formato legible para tabla
      const normalized = data.map((p) => ({
        ...p,
        // id robusto: id o _id
        id: p.id ?? p._id ?? null,
        // guardamos también una versión formateada para mostrar en la tabla
        _fechaMostrar: p.fecha_nacimiento
          ? new Date(p.fecha_nacimiento).toLocaleDateString()
          : '',
      }));

      setPacientes(normalized);
    } catch (error) {
      console.error('Error al cargar pacientes', error);
      alert('No se pudieron cargar los pacientes.');
    }
  };

  // ==========================================
  // 🔹 Guardar (alta) o actualizar (edición)
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación mínima
    if (!formData.dni || !formData.nombre || !formData.apellido) {
      alert('DNI, Nombre y Apellido son obligatorios.');
      return;
    }

    // Aseguramos que la fecha se envíe como YYYY-MM-DD (lo que espera MySQL DATE)
    // Si el input está vacío, mandamos null
    const payload = {
      ...formData,
      fecha_nacimiento: formData.fecha_nacimiento?.trim()
        ? formData.fecha_nacimiento
        : null,
    };

    try {
      if (formData.id) {
        // EDITAR
        await axios.put(`${API}/patients/${formData.id}`, payload);
        alert('Paciente actualizado correctamente');
      } else {
        // CREAR
        await axios.post(`${API}/patients`, payload);
        alert('Paciente agregado correctamente');
      }

      // Reset de formulario y recarga
      setShowForm(false);
      setFormData({
        id: null,
        dni: '',
        nombre: '',
        apellido: '',
        telefono: '',
        fecha_nacimiento: '',
        domicilio: '',
        email: '',
        obra_social: '',
      });
      cargarPacientes();
    } catch (error) {
      console.error('Error al guardar paciente', error?.response || error);
      alert(error?.response?.data?.msg || 'Error al guardar el paciente.');
    }
  };

  // ==============================
  // 🔹 Editar: precarga el form
  // ==============================
  const handleEdit = (paciente) => {
    setFormData({
      id: paciente.id,
      dni: paciente.dni || '',
      nombre: paciente.nombre || '',
      apellido: paciente.apellido || '',
      telefono: paciente.telefono || '',
      // Para el input type="date" necesitamos YYYY-MM-DD. Si viene con time, lo cortamos.
      fecha_nacimiento: paciente.fecha_nacimiento
        ? String(paciente.fecha_nacimiento).slice(0, 10)
        : '',
      domicilio: paciente.domicilio || '',
      email: paciente.email || '',
      obra_social: paciente.obra_social || '',
    });
    setShowForm(true);
  };

  // ==============================
  // 🔹 Eliminar
  // ==============================
  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este paciente?')) return;
    try {
      await axios.delete(`${API}/patients/${id}`);
      alert('Paciente eliminado');
      cargarPacientes();
    } catch (error) {
      console.error('Error al eliminar', error);
      alert('No se pudo eliminar el paciente.');
    }
  };

  // ==============================
  // 🔎 Filtro de búsqueda
  // ==============================
  const pacientesFiltrados = pacientes.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.apellido || '').toLowerCase().includes(q) ||
      (p.dni || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header de sección */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="text-primary mb-0">Gestión de Pacientes</h5>
          <small className="text-muted">Alta, modificación y consulta de pacientes</small>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cerrar' : '+ Nuevo Paciente'}
        </button>
      </div>

      {/* Formulario (alta/edición) */}
      {showForm && (
        <form onSubmit={handleSubmit} className="row g-3 mb-4">
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="DNI *"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Nombre *"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Apellido *"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              placeholder="Fecha de nacimiento"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            />
          </div>

          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Domicilio"
              value={formData.domicilio}
              onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Obra Social"
              value={formData.obra_social}
              onChange={(e) => setFormData({ ...formData, obra_social: e.target.value })}
            />
          </div>

          <div className="col-12 text-end">
            <button className="btn btn-success me-2" type="submit">
              Guardar
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {setShowForm(false);
                            setFormData({
                id: null,
                dni: '',
                nombre: '',
                apellido: '',
                telefono: '',
                fecha_nacimiento: '',
                domicilio: '',
                email: '',
                obra_social: '',
            });
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Buscador */}
      <div className="input-group mb-3">
        <span className="input-group-text">🔍</span>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre, apellido, DNI o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Teléfono</th>
            <th>Fecha Nac.</th>
            <th>Obra Social</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientesFiltrados.map((p) => (
            <tr key={p.id}>
              <td>{p.dni}</td>
              <td>{p.nombre}</td>
              <td>{p.apellido}</td>
              <td>{p.telefono}</td>
              {/* Mostramos la fecha bonita si existe */}
              <td>{p._fechaMostrar}</td>
              <td>{p.obra_social}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => handleEdit(p)}
                >
                  ✏️
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(p.id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}

          {pacientesFiltrados.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
