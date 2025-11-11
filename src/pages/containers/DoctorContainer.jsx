// ===============================================================
// 👨‍⚕️ DoctorContainer.jsx
// Gestión completa de médicos (Bootstrap + Axios + React Hooks)
// ===============================================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DoctorContainer() {
  const [doctores, setDoctores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    id: null,
    dni: '',
    nombre: '',
    apellido: '',
    telefono: '',
    fecha_nacimiento: '',
    domicilio: '',
    email: '',
    especialidad: '',
  });

  // ===============================================================
  // 📡 Cargar médicos desde la API
  // ===============================================================
  useEffect(() => {
    cargarDoctores();
  }, []);

  const cargarDoctores = async () => {
    try {
      const { data } = await axios.get('http://localhost:4000/api/doctors');

      // 🔹 Normalizamos los datos (en especial la fecha)
      const normalized = data.map((d) => ({
        ...d,
        id: d.id ?? d._id ?? null,
        // para mostrar en la tabla de forma legible
        _fechaMostrar: d.fecha_nacimiento
          ? new Date(d.fecha_nacimiento).toLocaleDateString()
          : '',
      }));

      setDoctores(normalized);
    } catch (error) {
      console.error('❌ Error al cargar médicos', error);
    }
  };

  // ===============================================================
  // 💾 Guardar o actualizar médico
  // ===============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.apellido || !formData.dni) {
      alert('Complete los campos obligatorios');
      return;
    }

    // Normalizamos fecha_nacimiento antes de enviar
    const payload = {
      ...formData,
      fecha_nacimiento: formData.fecha_nacimiento?.trim()
        ? formData.fecha_nacimiento
        : null,
    };

    try {
      if (formData.id) {
        await axios.put(`http://localhost:4000/api/doctors/${formData.id}`, payload);
        alert('Médico actualizado correctamente');
      } else {
        await axios.post('http://localhost:4000/api/doctors', payload);
        alert('Médico agregado correctamente');
      }

      // Reset del formulario
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
        especialidad: '',
      });

      cargarDoctores();
    } catch (error) {
      console.error('❌ Error al guardar médico', error);
      alert('Ocurrió un error al guardar el médico');
    }
  };

  // ===============================================================
  // ✏️ Editar médico existente
  // ===============================================================
  const handleEdit = (doctor) => {
    setFormData({
      id: doctor.id,
      dni: doctor.dni || '',
      nombre: doctor.nombre || '',
      apellido: doctor.apellido || '',
      telefono: doctor.telefono || '',
      // ✅ Cortamos la fecha para que encaje con input type="date"
      fecha_nacimiento: doctor.fecha_nacimiento
        ? String(doctor.fecha_nacimiento).slice(0, 10)
        : '',
      domicilio: doctor.domicilio || '',
      email: doctor.email || '',
      especialidad: doctor.especialidad || '',
    });
    setShowForm(true);
  };

  // ===============================================================
  // 🗑️ Eliminar médico
  // ===============================================================
  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar este médico?')) {
      try {
        await axios.delete(`http://localhost:4000/api/doctors/${id}`);
        alert('Médico eliminado correctamente');
        cargarDoctores();
      } catch (error) {
        console.error('❌ Error al eliminar médico', error);
      }
    }
  };

  // ===============================================================
  // 🔍 Filtro de búsqueda
  // ===============================================================
  const doctoresFiltrados = doctores.filter((d) => {
    const q = search.toLowerCase();
    return (
      (d.nombre || '').toLowerCase().includes(q) ||
      (d.apellido || '').toLowerCase().includes(q) ||
      (d.dni || '').toLowerCase().includes(q) ||
      (d.especialidad || '').toLowerCase().includes(q)
    );
  });

  // ===============================================================
  // 🖥️ Render principal
  // ===============================================================
  return (
    <div>
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="text-primary mb-0">Gestión de Médicos</h5>
          <small className="text-muted">Alta, modificación y consulta de médicos</small>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cerrar' : '+ Nuevo Médico'}
        </button>
      </div>

      {/* Formulario */}
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
              className="form-control"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            />
          </div>
          <div className="col-md-4">
            <input
              type="date"
              className="form-control"
              placeholder="Fecha de nacimiento"
              value={formData.fecha_nacimiento}
              onChange={(e) =>
                setFormData({ ...formData, fecha_nacimiento: e.target.value })
              }
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
              placeholder="Especialidad"
              value={formData.especialidad}
              onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
            />
          </div>

          {/* Botones */}
          <div className="col-12 text-end">
            <button className="btn btn-success me-2" type="submit">
              Guardar
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
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
                  especialidad: '',
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
          placeholder="Buscar por nombre, apellido, DNI o especialidad..."
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
            <th>Especialidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {doctoresFiltrados.map((d) => (
            <tr key={d.id}>
              <td>{d.dni}</td>
              <td>{d.nombre}</td>
              <td>{d.apellido}</td>
              <td>{d.telefono}</td>
              {/* ✅ Fecha formateada */}
              <td>{d._fechaMostrar}</td>
              <td>{d.especialidad}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => handleEdit(d)}
                >
                  ✏️
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(d.id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}

          {doctoresFiltrados.length === 0 && (
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
