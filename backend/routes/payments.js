// ===============================================================
// routes/payments.js
// CRUD de pagos con sincronización del campo pago_id en turnos
// ===============================================================
import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();
const pool = db.promise();
const allowedPaymentTypes = ['Efectivo', 'Tarjeta Débito', 'Transferencia', 'Tarjeta Crédito'];

// ===============================================================
// GET /api/pagos
// Lista pagos con datos enriquecidos del turno, médico y paciente
// ===============================================================
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         pg.id,
         pg.monto,
         pg.tipo,
         pg.turno_id,
         t.fecha,
         t.hora,
         m.nombre AS medico_nombre,
         m.apellido AS medico_apellido,
         m.especialidad AS medico_especialidad,
         p.nombre AS paciente_nombre,
         p.apellido AS paciente_apellido
       FROM pagos pg
       LEFT JOIN turnos t ON pg.turno_id = t.id
       LEFT JOIN medicos m ON t.medico_id = m.id
       LEFT JOIN pacientes p ON t.paciente_id = p.id
       ORDER BY pg.id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al listar pagos:', error);
    res.status(500).json({ msg: 'Error al obtener los pagos.' });
  }
});

// ===============================================================
// POST /api/pagos
// Registra un pago manualmente y actualiza el turno correspondiente
// ===============================================================
router.post('/', async (req, res) => {
  const { turno_id, monto, tipo } = req.body;

  if (!turno_id || !monto || !tipo) {
    return res.status(400).json({ msg: 'turno_id, monto y tipo son obligatorios.' });
  }
  const amountNumber = Number(monto);
  if (Number.isNaN(amountNumber) || amountNumber <= 0) {
    return res.status(400).json({ msg: 'El monto debe ser mayor a cero.' });
  }
  if (!allowedPaymentTypes.includes(tipo)) {
    return res.status(400).json({ msg: 'Tipo de pago inválido.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [[turno]] = await connection.query('SELECT id FROM turnos WHERE id = ?', [turno_id]);
    if (!turno) {
      await connection.rollback();
      return res.status(404).json({ msg: 'El turno indicado no existe.' });
    }

    // Evitamos duplicar pagos para el mismo turno
    const [[existingPayment]] = await connection.query('SELECT id FROM pagos WHERE turno_id = ?', [
      turno_id,
    ]);
    if (existingPayment) {
      await connection.rollback();
      return res.status(409).json({ msg: 'Ese turno ya tiene un pago asociado.' });
    }

    const [result] = await connection.query(
      'INSERT INTO pagos (monto, tipo, turno_id) VALUES (?, ?, ?)',
      [amountNumber, tipo, turno_id]
    );
    await connection.query('UPDATE turnos SET pago_id = ? WHERE id = ?', [result.insertId, turno_id]);

    await connection.commit();
    res.status(201).json({ msg: 'Pago registrado correctamente.', id: result.insertId });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear pago:', error);
    res.status(500).json({ msg: 'Error al registrar el pago.' });
  } finally {
    connection.release();
  }
});

// ===============================================================
// PUT /api/pagos/:id
// Actualiza datos del pago sin romper la referencia del turno
// ===============================================================
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { monto, tipo } = req.body;

  if (!monto || !tipo) {
    return res.status(400).json({ msg: 'monto y tipo son obligatorios.' });
  }
  const amountNumber = Number(monto);
  if (Number.isNaN(amountNumber) || amountNumber <= 0) {
    return res.status(400).json({ msg: 'El monto debe ser mayor a cero.' });
  }
  if (!allowedPaymentTypes.includes(tipo)) {
    return res.status(400).json({ msg: 'Tipo de pago inválido.' });
  }

  try {
    const [result] = await pool.query('UPDATE pagos SET monto = ?, tipo = ? WHERE id = ?', [
      amountNumber,
      tipo,
      id,
    ]);

    if (!result.affectedRows) {
      return res.status(404).json({ msg: 'El pago no existe.' });
    }

    res.json({ msg: 'Pago actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    res.status(500).json({ msg: 'Error al actualizar el pago.' });
  }
});

// ===============================================================
// DELETE /api/pagos/:id
// Elimina el pago y limpia la referencia en turnos
// ===============================================================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [[payment]] = await connection.query('SELECT turno_id FROM pagos WHERE id = ?', [id]);
    if (!payment) {
      await connection.rollback();
      return res.status(404).json({ msg: 'El pago no existe.' });
    }

    await connection.query('DELETE FROM pagos WHERE id = ?', [id]);
    await connection.query('UPDATE turnos SET pago_id = NULL WHERE id = ?', [payment.turno_id]);

    await connection.commit();
    res.json({ msg: 'Pago eliminado correctamente.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar pago:', error);
    res.status(500).json({ msg: 'Error al eliminar el pago.' });
  } finally {
    connection.release();
  }
});

export default router;
