// ===============================================================
// routes/turns.js
// Rutas para la gestión integral de turnos + creación de pagos asociados
// ===============================================================
import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();
const pool = db.promise(); // wrapper promisificado para usar async/await

// --------------------------- Helpers ---------------------------
const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const normalizeTime = (value) => {
  if (!value) return null;
  const [hh = '', mm = ''] = value.split(':');
  const hour = Number(hh);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) return null;
  return `${String(hour).padStart(2, '0')}:${(mm || '00').padStart(2, '0')}:00`;
};

const isWeekday = (dateString) => {
  const day = new Date(dateString).getDay();
  return day >= 1 && day <= 5; // 1 = lunes, 5 = viernes
};

const isFutureDate = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const valueDate = new Date(dateString);
  return valueDate > today; // solo fechas futuras
};

const isWithinRange = (dateString, days = 20) => {
  const target = new Date(dateString);
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  limit.setHours(23, 59, 59, 999);
  return target <= limit;
};

const isValidHour = (timeString) => {
  if (!timeString) return false;
  const hour = Number(timeString.split(':')[0]);
  return hour >= 9 && hour <= 18;
};

const allowedPaymentTypes = ['Efectivo', 'Tarjeta Débito', 'Transferencia', 'Tarjeta Crédito'];

// ===============================================================
// GET /api/turnos
// Devuelve turnos con info de paciente, médico y pago (sin exponer pago_id)
// ===============================================================
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         t.id,
         t.fecha,
         t.hora,
         t.medico_id,
         t.paciente_id,
         t.especialidad,
         m.nombre AS medico_nombre,
         m.apellido AS medico_apellido,
         m.especialidad AS medico_especialidad,
         p.nombre AS paciente_nombre,
         p.apellido AS paciente_apellido,
         p.dni AS paciente_dni,
         pg.monto AS pago_monto,
         pg.tipo AS pago_tipo
       FROM turnos t
       LEFT JOIN medicos m ON t.medico_id = m.id
       LEFT JOIN pacientes p ON t.paciente_id = p.id
       LEFT JOIN pagos pg ON t.pago_id = pg.id
       ORDER BY t.fecha DESC, t.hora DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al listar turnos:', error);
    res.status(500).json({ msg: 'Error al obtener turnos' });
  }
});

// ===============================================================
// GET /api/turnos/ocupados?medicoId=1&fecha=2025-11-09
// Retorna las horas ya tomadas por un médico en una fecha dada
// ===============================================================
router.get('/ocupados', async (req, res) => {
  const { medicoId, fecha, excludeId } = req.query;

  if (!medicoId || !fecha) {
    return res.status(400).json({ msg: 'medicoId y fecha son obligatorios.' });
  }

  const normalizedDate = normalizeDate(fecha);
  if (!normalizedDate) {
    return res.status(400).json({ msg: 'Formato de fecha inválido.' });
  }

  try {
    const params = [medicoId, normalizedDate];
    let query = 'SELECT hora FROM turnos WHERE medico_id = ? AND fecha = ?';

    const excludeNumeric = Number(excludeId);
    if (excludeId && !Number.isNaN(excludeNumeric)) {
      query += ' AND id <> ?';
      params.push(excludeNumeric);
    }

    const [rows] = await pool.query(
      query,
      params
    );

    const hours = rows.map((row) => row.hora?.slice(0, 5)).filter(Boolean);
    res.json({ occupied: hours });
  } catch (error) {
    console.error('Error al obtener horarios ocupados:', error);
    res.status(500).json({ msg: 'Error al obtener horarios ocupados' });
  }
});

// ===============================================================
// POST /api/turnos
// Crea un turno y su pago asociado en una sola transacción
// ===============================================================
router.post('/', async (req, res) => {
  const { dni, medico_id, fecha, hora, monto, tipo_pago } = req.body;

  // Validaciones de payload
  if (!dni || !medico_id || !fecha || !hora || !monto || !tipo_pago) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });
  }

  const normalizedDate = normalizeDate(fecha);
  const normalizedTime = normalizeTime(hora);

  if (!normalizedDate || !normalizedTime) {
    return res.status(400).json({ msg: 'Fecha u hora inválidas.' });
  }
  if (!isWeekday(normalizedDate)) {
    return res.status(400).json({ msg: 'Solo se permiten turnos de lunes a viernes.' });
  }
  if (!isFutureDate(normalizedDate)) {
    return res.status(400).json({ msg: 'La fecha debe ser futura.' });
  }
  if (!isWithinRange(normalizedDate)) {
    return res.status(400).json({ msg: 'Solo se permiten turnos hasta 20 días adelante.' });
  }
  if (!isValidHour(normalizedTime)) {
    return res.status(400).json({ msg: 'La hora debe estar entre las 09:00 y las 18:00.' });
  }

  const amountNumber = Number(monto);
  if (Number.isNaN(amountNumber) || amountNumber <= 0) {
    return res.status(400).json({ msg: 'El monto debe ser un número mayor a cero.' });
  }
  if (!allowedPaymentTypes.includes(tipo_pago)) {
    return res.status(400).json({ msg: 'Tipo de pago inválido.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1) Validar paciente por DNI
    const [patientRows] = await connection.query(
      'SELECT id, nombre, apellido FROM pacientes WHERE dni = ?',
      [dni]
    );
    if (!patientRows.length) {
      await connection.rollback();
      return res.status(404).json({ msg: 'No existe un paciente con ese DNI.' });
    }
    const patient = patientRows[0];

    // 2) Validar médico y obtener especialidad
    const [doctorRows] = await connection.query(
      'SELECT id, especialidad FROM medicos WHERE id = ?',
      [medico_id]
    );
    if (!doctorRows.length) {
      await connection.rollback();
      return res.status(404).json({ msg: 'El médico seleccionado no existe.' });
    }
    const doctor = doctorRows[0];

    // 3) Validar disponibilidad del médico
    const [busyRows] = await connection.query(
      'SELECT id FROM turnos WHERE medico_id = ? AND fecha = ? AND hora = ?',
      [medico_id, normalizedDate, normalizedTime]
    );
    if (busyRows.length) {
      await connection.rollback();
      return res.status(409).json({ msg: 'Ese horario ya está asignado para este médico.' });
    }

    // 4) Insertar turno
    const [turnResult] = await connection.query(
      `INSERT INTO turnos (fecha, hora, medico_id, especialidad, paciente_id)
       VALUES (?, ?, ?, ?, ?)`,
      [normalizedDate, normalizedTime, medico_id, doctor.especialidad, patient.id]
    );
    const turnoId = turnResult.insertId;

    // 5) Insertar pago asociado
    const [paymentResult] = await connection.query(
      `INSERT INTO pagos (monto, tipo, turno_id)
       VALUES (?, ?, ?)`,
      [amountNumber, tipo_pago, turnoId]
    );
    const pagoId = paymentResult.insertId;

    // 6) Actualizar turno con el id del pago (campo interno, no se expone)
    await connection.query('UPDATE turnos SET pago_id = ? WHERE id = ?', [pagoId, turnoId]);

    await connection.commit();
    res.status(201).json({
      msg: 'Turno creado correctamente.',
      turnoId,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear turno:', error);
    res.status(500).json({ msg: 'Error al crear el turno.' });
  } finally {
    connection.release();
  }
});

// ===============================================================
// PUT /api/turnos/:id
// Permite reprogramar un turno y actualizar su pago
// ===============================================================
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { dni, medico_id, fecha, hora, monto, tipo_pago } = req.body;

  if (!dni || !medico_id || !fecha || !hora || !monto || !tipo_pago) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });
  }

  const normalizedDate = normalizeDate(fecha);
  const normalizedTime = normalizeTime(hora);

  if (!normalizedDate || !normalizedTime) {
    return res.status(400).json({ msg: 'Fecha u hora inválidas.' });
  }
  if (!isWeekday(normalizedDate) || !isFutureDate(normalizedDate) || !isWithinRange(normalizedDate)) {
    return res.status(400).json({ msg: 'La fecha debe ser un día hábil y dentro de los próximos 20 días.' });
  }
  if (!isValidHour(normalizedTime)) {
    return res.status(400).json({ msg: 'La hora debe estar entre las 09:00 y las 18:00.' });
  }

  const amountNumber = Number(monto);
  if (Number.isNaN(amountNumber) || amountNumber <= 0) {
    return res.status(400).json({ msg: 'El monto debe ser un número mayor a cero.' });
  }
  if (!allowedPaymentTypes.includes(tipo_pago)) {
    return res.status(400).json({ msg: 'Tipo de pago inválido.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[turnoActual]] = await connection.query('SELECT * FROM turnos WHERE id = ?', [id]);
    if (!turnoActual) {
      await connection.rollback();
      return res.status(404).json({ msg: 'El turno no existe.' });
    }

    const [[patient]] = await connection.query('SELECT id FROM pacientes WHERE dni = ?', [dni]);
    if (!patient) {
      await connection.rollback();
      return res.status(404).json({ msg: 'El paciente no existe.' });
    }

    const [[doctor]] = await connection.query('SELECT id, especialidad FROM medicos WHERE id = ?', [
      medico_id,
    ]);
    if (!doctor) {
      await connection.rollback();
      return res.status(404).json({ msg: 'El médico no existe.' });
    }

    const [busyRows] = await connection.query(
      'SELECT id FROM turnos WHERE medico_id = ? AND fecha = ? AND hora = ? AND id <> ?',
      [medico_id, normalizedDate, normalizedTime, id]
    );
    if (busyRows.length) {
      await connection.rollback();
      return res.status(409).json({ msg: 'Ese horario ya está asignado para este médico.' });
    }

    await connection.query(
      `UPDATE turnos 
       SET fecha = ?, hora = ?, medico_id = ?, especialidad = ?, paciente_id = ?
       WHERE id = ?`,
      [normalizedDate, normalizedTime, medico_id, doctor.especialidad, patient.id, id]
    );

    if (turnoActual.pago_id) {
      await connection.query(
        'UPDATE pagos SET monto = ?, tipo = ? WHERE id = ?',
        [amountNumber, tipo_pago, turnoActual.pago_id]
      );
    } else {
      const [paymentResult] = await connection.query(
        `INSERT INTO pagos (monto, tipo, turno_id)
         VALUES (?, ?, ?)`,
        [amountNumber, tipo_pago, id]
      );
      await connection.query('UPDATE turnos SET pago_id = ? WHERE id = ?', [
        paymentResult.insertId,
        id,
      ]);
    }

    await connection.commit();
    res.json({ msg: 'Turno actualizado correctamente.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar turno:', error);
    res.status(500).json({ msg: 'Error al actualizar el turno.' });
  } finally {
    connection.release();
  }
});

// ===============================================================
// DELETE /api/turnos/:id
// Elimina el turno y su pago asociado
// ===============================================================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [[turno]] = await connection.query('SELECT id FROM turnos WHERE id = ?', [id]);
    if (!turno) {
      await connection.rollback();
      return res.status(404).json({ msg: 'El turno no existe.' });
    }

    await connection.query('DELETE FROM pagos WHERE turno_id = ?', [id]);
    await connection.query('DELETE FROM turnos WHERE id = ?', [id]);

    await connection.commit();
    res.json({ msg: 'Turno eliminado correctamente.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar turno:', error);
    res.status(500).json({ msg: 'Error al eliminar el turno.' });
  } finally {
    connection.release();
  }
});

export default router;
