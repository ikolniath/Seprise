// ===============================================================
// routes/users.js
// CRUD para la tabla usuarios (admin vs médico) con contraseñas hasheadas
// ===============================================================
import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';

const router = express.Router();
const pool = db.promise();
const SALT_ROUNDS = 10;

// ===============================================================
// GET /api/users
// ===============================================================
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, usuario, es_medico FROM usuarios ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ msg: 'Error al obtener usuarios.' });
  }
});

// ===============================================================
// POST /api/users
// ===============================================================
router.post('/', async (req, res) => {
  const { usuario, contrasena, es_medico } = req.body;

  if (!usuario || !contrasena || typeof es_medico === 'undefined') {
    return res.status(400).json({ msg: 'usuario, contrasena y es_medico son obligatorios.' });
  }

  try {
    const hashed = await bcrypt.hash(contrasena, SALT_ROUNDS);
    await pool.query(
      'INSERT INTO usuarios (usuario, contrasena, es_medico) VALUES (?, ?, ?)',
      [usuario, hashed, es_medico ? 1 : 0]
    );
    res.status(201).json({ msg: 'Usuario creado correctamente.' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    const sqlMessage = error?.sqlMessage || '';
    if (sqlMessage.includes('Duplicate')) {
      return res.status(409).json({ msg: 'El usuario ya existe.' });
    }
    res.status(500).json({ msg: 'Error al crear el usuario.' });
  }
});

// ===============================================================
// PUT /api/users/:id
// ===============================================================
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { usuario, contrasena, es_medico } = req.body;

  if (!usuario || typeof es_medico === 'undefined') {
    return res.status(400).json({ msg: 'usuario y es_medico son obligatorios.' });
  }

  try {
    let query = 'UPDATE usuarios SET usuario = ?, es_medico = ?';
    const params = [usuario, es_medico ? 1 : 0];

    if (contrasena) {
      const hashed = await bcrypt.hash(contrasena, SALT_ROUNDS);
      query += ', contrasena = ?';
      params.push(hashed);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);
    if (!result.affectedRows) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    res.json({ msg: 'Usuario actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    const sqlMessage = error?.sqlMessage || '';
    if (sqlMessage.includes('Duplicate')) {
      return res.status(409).json({ msg: 'El usuario ya existe.' });
    }
    res.status(500).json({ msg: 'Error al actualizar el usuario.' });
  }
});

// ===============================================================
// DELETE /api/users/:id
// ===============================================================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    if (!result.affectedRows) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }
    res.json({ msg: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ msg: 'Error al eliminar el usuario.' });
  }
});

export default router;
