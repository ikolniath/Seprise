// ===============================================================
// 🧍‍♂️ patients.js
// CRUD de pacientes con formato seguro de fecha_nacimiento
// ===============================================================

import express from 'express';
import { db } from '../config/db.js';
const router = express.Router();

// Helper para fechas
const formatDate = (value) => {
  if (!value) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  if (typeof value === 'string' && value.includes('T')) return value.split('T')[0];
  const d = new Date(value);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ===============================================================
// 📄 GET /api/patients
// ===============================================================
router.get('/', (req, res) => {
  db.query('SELECT * FROM pacientes', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener pacientes' });
    res.json(results);
  });
});

// ===============================================================
// 🔍 GET /api/patients/buscar/:dni
// ===============================================================
router.get('/buscar/:dni', (req, res) => {
  const { dni } = req.params;
  db.query('SELECT * FROM pacientes WHERE dni = ?', [dni], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar paciente' });
    if (!results.length) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(results[0]);
  });
});

// ===============================================================
// ➕ POST /api/patients
// ===============================================================
router.post('/', (req, res) => {
  let { dni, nombre, apellido, telefono, fecha_nacimiento, domicilio, email, obra_social } = req.body;
  fecha_nacimiento = formatDate(fecha_nacimiento);
  const sql = `INSERT INTO pacientes (dni, nombre, apellido, telefono, fecha_nacimiento, domicilio, email, obra_social)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [dni, nombre, apellido, telefono, fecha_nacimiento, domicilio, email, obra_social], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al insertar paciente', detalle: err.sqlMessage });
    res.json({ msg: '✅ Paciente agregado correctamente', id: result.insertId });
  });
});

// ===============================================================
// ✏️ PUT /api/patients/:id
// ===============================================================
router.put('/:id', (req, res) => {
  const { id } = req.params;
  let { dni, nombre, apellido, telefono, fecha_nacimiento, domicilio, email, obra_social } = req.body;
  fecha_nacimiento = formatDate(fecha_nacimiento);
  const sql = `UPDATE pacientes SET dni=?, nombre=?, apellido=?, telefono=?, fecha_nacimiento=?, domicilio=?, email=?, obra_social=? WHERE id=?`;
  db.query(sql, [dni, nombre, apellido, telefono, fecha_nacimiento, domicilio, email, obra_social, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar paciente', detalle: err.sqlMessage });
    if (!result.affectedRows) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json({ msg: '✅ Paciente actualizado correctamente' });
  });
});

// ===============================================================
// 🗑️ DELETE /api/patients/:id
// ===============================================================
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM pacientes WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar paciente', detalle: err.sqlMessage });
    if (!result.affectedRows) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json({ msg: '🗑️ Paciente eliminado correctamente' });
  });
});

export default router;
