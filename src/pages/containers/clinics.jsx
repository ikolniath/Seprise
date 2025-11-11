// ===============================================================
// 🏥 ClinicContainer.jsx
// Gestión completa de consultorios (Bootstrap + Axios + React Hooks)
// ===============================================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000/api/clinics';

export default function ClinicContainer() {
  const [clinics, setClinics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    num_consultorio: '',
    estado: true,
  });

  // ===============================================================
  // 📡 Cargar consultorios desde la API
  // ===============================================================
  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      const { data } = await axios.get(API);
      setClinics(data);
    } catch (error) {
      console.error('❌ Error al cargar consultorios:', error);
    }
  };

  // ===============================================================
  // 💾 Guardar / actualizar consultorio
  // ===============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.num_consultorio) {
      alert('Complete los campos obligatorios');
      return;
    }

    try {
      if (formData.id) {
        await axios.put(`${API}/${formData.id}`, formData);
        alert('Consultorio actualizado correctamente');
      } else {
        await axios.post(API, formData);
        alert('Consultorio agregado correctamente');
      }

      setShowForm(false);
      setFormData({ id: null, nombre: '', num_consultorio: '', estado: true });
      loadClinics();
    } catch (error) {
      console.error('❌ Error al guardar consultorio:', error);
      alert('Error al guardar consultorio');
    }
  };

  // ===============================================================
  // ✏️ Editar consultorio existente
  // ===============================================================
  const handleEdit = (clinic) => {
    setFormData(clinic);
    setShowForm(true);
  };

  // ===============================================================
  // 🗑️ Eliminar consultorio
  // ===============================================================
  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar este consultorio?')) {
      try {
        await axios.delete(`${API}/${id}`);
        alert('Consultorio eliminado correctamente');
        loadClinics();
      } catch (error) {
        console.error('❌ Error al eliminar consultorio:', error);
      }
    }
  };

  // ===============================================================
  // 🔍 Filtro de búsqueda
  // ===============================================================
  const filteredClinics = clinics.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  // ===============================================================
  // 🖥️ Render principal
  // ===============================================================
  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="text-primary mb-0">Gestor de Clinicas</h5>
          <small className="text-muted">Agregar, editar o eliminar clinicas</small>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cerrar' : '+ Nueva Clinica'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="row g-3 mb-4">
          <div className="col-md-5">
            <input
              className="form-control"
              placeholder="Nombre *"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Clinica número *"
              value={formData.num_consultorio}
              onChange={(e) =>
                setFormData({ ...formData, num_consultorio: e.target.value })
              }
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={formData.estado ? 'true' : 'false'}
              onChange={(e) =>
                setFormData({ ...formData, estado: e.target.value === 'true' })
              }
            >
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </select>
          </div>

          <div className="col-12 text-end">
            <button className="btn btn-success me-2" type="submit">
              Guardar
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ id: null, nombre: '', num_consultorio: '', estado: true });
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="input-group mb-3">
        <span className="input-group-text">🔍</span>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Clinica Numero</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredClinics.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>{c.num_consultorio}</td>
              <td>{c.estado ? 'Activa' : 'Inactiva'}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => handleEdit(c)}
                >
                  ✏️
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(c.id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}

          {filteredClinics.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No results
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

