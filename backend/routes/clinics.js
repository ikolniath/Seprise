// ===============================================================
// 🏥 clinics.js
// CRUD para gestión de consultorios (nombre, número, estado)
// ===============================================================

import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// ===============================================================
// 📄 GET /api/clinics
// ===============================================================
router.get('/', (req, res) => {
  db.query('SELECT * FROM consultorios', (err, results) => {
    if (err) {
      console.error('❌ Error al obtener consultorios:', err);
      return res.status(500).json({ error: 'Error al obtener consultorios' });
    }
    res.json(results);
  });
});

// ===============================================================
// ➕ POST /api/clinics
// ===============================================================
router.post('/', (req, res) => {
  const { nombre, num_consultorio, estado } = req.body;

  if (!nombre || !num_consultorio) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = 'INSERT INTO consultorios (nombre, num_consultorio, estado) VALUES (?, ?, ?)';
  db.query(sql, [nombre, num_consultorio, estado ? 1 : 0], (err, result) => {
    if (err) {
      console.error('❌ Error al insertar consultorio:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Error al insertar consultorio' });
    }
    console.log('✅ Consultorio agregado ID:', result.insertId);
    res.json({ msg: '✅ Consultorio agregado correctamente', id: result.insertId });
  });
});

// ===============================================================
// ✏️ PUT /api/clinics/:id
// ===============================================================
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, num_consultorio, estado } = req.body;

  const sql = 'UPDATE consultorios SET nombre=?, num_consultorio=?, estado=? WHERE id=?';
  db.query(sql, [nombre, num_consultorio, estado ? 1 : 0, id], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar consultorio:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Error al actualizar consultorio' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Consultorio no encontrado' });
    }
    console.log(`✅ Consultorio ID ${id} actualizado`);
    res.json({ msg: '✅ Consultorio actualizado correctamente' });
  });
});

// ===============================================================
// 🗑️ DELETE /api/clinics/:id
// ===============================================================
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM consultorios WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar consultorio:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Error al eliminar consultorio' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Consultorio no encontrado' });
    }
    console.log(`🗑️ Consultorio ID ${id} eliminado correctamente`);
    res.json({ msg: '🗑️ Consultorio eliminado correctamente' });
  });
});

export default router;
