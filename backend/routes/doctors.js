// ===========================================================
// 👨‍⚕️ routes/doctors.js
// Rutas completas para la gestión de médicos (CRUD)
// ===========================================================

import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// ===========================================================
// 🔹 GET /api/doctors
// Obtiene todos los médicos registrados
// ===========================================================
router.get('/', (req, res) => {
  const query = 'SELECT * FROM medicos';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener médicos:', err);
      return res.status(500).json({ msg: 'Error interno del servidor' });
    }
    res.json(results);
  });
});

// ===========================================================
// 🔹 GET /api/doctors/search/:dni
// Busca un médico por su DNI
// ===========================================================
router.get('/search/:dni', (req, res) => {
  const { dni } = req.params;
  const query = 'SELECT * FROM medicos WHERE dni = ?';

  db.query(query, [dni], (err, results) => {
    if (err) {
      console.error('❌ Error al buscar médico:', err);
      return res.status(500).json({ msg: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ msg: 'Médico no encontrado' });
    }

    res.json(results[0]);
  });
});

// ===========================================================
// 🔹 POST /api/doctors
// Registra un nuevo médico
// ===========================================================
router.post('/', (req, res) => {
  const {
    dni,
    nombre,
    apellido,
    telefono,
    fecha_nacimiento,
    domicilio,
    email,
    especialidad,
  } = req.body;

  // Validación de campos obligatorios
  if (!dni || !nombre || !apellido || !especialidad) {
    return res.status(400).json({ msg: 'Faltan campos obligatorios' });
  }

  const query = `
    INSERT INTO medicos 
      (dni, nombre, apellido, telefono, fecha_nacimiento, domicilio, email, especialidad)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [dni, nombre, apellido, telefono, fecha_nacimiento, domicilio, email, especialidad],
    (err) => {
      if (err) {
        console.error('❌ Error al crear médico:', err);
        return res.status(500).json({ msg: 'Error al registrar médico' });
      }

      res.json({ msg: '✅ Médico agregado correctamente' });
    }
  );
});

// ===========================================================
// 🔹 PUT /api/doctors/:id
// Actualiza un médico existente por ID
// ===========================================================
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    dni,
    nombre,
    apellido,
    telefono,
    fecha_nacimiento,
    domicilio,
    email,
    especialidad,
  } = req.body;

  const query = `
    UPDATE medicos 
    SET dni=?, nombre=?, apellido=?, telefono=?, fecha_nacimiento=?, domicilio=?, email=?, especialidad=? 
    WHERE id=?
  `;

  db.query(
    query,
    [dni, nombre, apellido, telefono, fecha_nacimiento, domicilio, email, especialidad, id],
    (err) => {
      if (err) {
        console.error('❌ Error al actualizar médico:', err);
        return res.status(500).json({ msg: 'Error al actualizar médico' });
      }

      res.json({ msg: '✅ Médico actualizado correctamente' });
    }
  );
});

// ===========================================================
// 🔹 DELETE /api/doctors/:id
// Elimina un médico por ID
// ===========================================================
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM medicos WHERE id = ?';

  db.query(query, [id], (err) => {
    if (err) {
      console.error('❌ Error al eliminar médico:', err);
      return res.status(500).json({ msg: 'Error al eliminar médico' });
    }

    res.json({ msg: '🗑️ Médico eliminado correctamente' });
  });
});

export default router;
