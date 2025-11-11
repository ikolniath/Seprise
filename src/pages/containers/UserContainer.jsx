// ===============================================================
// UserContainer.jsx
// CRUD de usuarios del sistema (admin vs médico) con contraseñas hashed
// ===============================================================
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000/api';
const ROLE_OPTIONS = [
  { value: false, label: 'Usuario Administrativo' },
  { value: true, label: 'Médico' },
];

const initialForm = {
  id: null,
  usuario: '',
  contrasena: '',
  es_medico: false,
};

export default function UserContainer() {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsuarios();
  }, []);

  // Trae la lista completa de usuarios
  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/users`);
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error al cargar usuarios', error);
      alert('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.usuario.trim()) {
      alert('El nombre de usuario es obligatorio.');
      return;
    }

    const payload = {
      usuario: formData.usuario.trim(),
      es_medico: Boolean(formData.es_medico),
    };

    if (formData.contrasena.trim()) {
      payload.contrasena = formData.contrasena.trim();
    } else if (!formData.id) {
      alert('La contraseña es obligatoria para un usuario nuevo.');
      return;
    }

    try {
      if (formData.id) {
        await axios.put(`${API}/users/${formData.id}`, payload);
        alert('Usuario actualizado correctamente.');
      } else {
        await axios.post(`${API}/users`, payload);
        alert('Usuario creado correctamente.');
      }
      handleReset();
      loadUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario', error?.response || error);
      alert(error?.response?.data?.msg || 'No se pudo guardar el usuario.');
    }
  };

  const handleEdit = (usuario) => {
    setShowForm(true);
    setFormData({
      id: usuario.id,
      usuario: usuario.usuario,
      contrasena: '',
      es_medico: Boolean(usuario.es_medico),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este usuario?')) return;
    try {
      await axios.delete(`${API}/users/${id}`);
      alert('Usuario eliminado correctamente.');
      loadUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario', error?.response || error);
      alert(error?.response?.data?.msg || 'No se pudo eliminar el usuario.');
    }
  };

  const handleReset = () => {
    setShowForm(false);
    setFormData(initialForm);
  };

  const usuariosFiltrados = useMemo(() => {
    const term = search.toLowerCase();
    return usuarios.filter((user) =>
      [user.usuario, user.es_medico ? 'medico' : 'admin'].join(' ').toLowerCase().includes(term)
    );
  }, [usuarios, search]);

  return (
    <div className="user-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="text-primary mb-0">Gestión de usuarios</h5>
          <small className="text-muted">Controla el acceso de administradores y médicos</small>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Cerrar' : '+ Nuevo usuario'}
        </button>
      </div>

      {showForm && (
        <form className="row g-3 mb-4" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <label className="form-label">Usuario *</label>
            <input
              className="form-control"
              value={formData.usuario}
              onChange={(e) => setFormData((prev) => ({ ...prev, usuario: e.target.value }))}
              placeholder="Ej: admin"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">
              {formData.id ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
            </label>
            <input
              type="password"
              className="form-control"
              value={formData.contrasena}
              onChange={(e) => setFormData((prev) => ({ ...prev, contrasena: e.target.value }))}
              placeholder={formData.id ? 'Dejar vacío para mantener' : '••••••'}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Rol *</label>
            <select
              className="form-select"
              value={formData.es_medico ? 'true' : 'false'}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, es_medico: e.target.value === 'true' }))
              }
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.label} value={String(option.value)}>
                  {option.label}
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

      <div className="input-group mb-3">
        <span className="input-group-text">Buscar</span>
        <input
          type="text"
          className="form-control"
          placeholder="Filtra por nombre de usuario o rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.usuario}</td>
                <td>
                  <span className={`badge ${user.es_medico ? 'bg-info' : 'bg-secondary'}`}>
                    {user.es_medico ? 'Médico' : 'Administrativo'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(user)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(user.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {!usuariosFiltrados.length && (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  No hay usuarios para mostrar.
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
