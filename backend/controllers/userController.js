// =============================================
// 🧠 userController.js — Lógica de autenticación
// =============================================
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';

// Controlador para el login
export const loginUser = (req, res) => {
  const { usuario, contrasena, rol } = req.body;

  // Validaciones simples
  if (!usuario || !contrasena || rol === undefined) {
    return res.status(400).json({ ok: false, msg: 'Datos incompletos.' });
  }

  // Buscamos el usuario en la base de datos
  db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario], async (err, results) => {
    if (err) {
      console.error('❌ Error en la consulta:', err.message);
      return res.status(500).json({ ok: false, msg: 'Error del servidor.' });
    }

    // Si no existe el usuario
    if (results.length === 0) {
      return res.status(401).json({ ok: false, msg: 'Usuario o contraseña incorrectos.' });
    }

    const user = results[0];

    // Comparamos la contraseña con bcrypt
    const match = await bcrypt.compare(contrasena, user.contrasena);

    if (!match) {
      return res.status(401).json({ ok: false, msg: 'Usuario o contraseña incorrectos.' });
    }

    // Validamos que el rol elegido coincida con el tipo de usuario (campo es_medico)
    const esMedico = Boolean(user.es_medico); // 1 = médico, 0 = admin

    if ((rol === 'medico' && !esMedico) || (rol === 'admin' && esMedico)) {
      return res.status(403).json({ ok: false, msg: 'Rol no autorizado para este usuario.' });
    }

    // Si todo va bien
    return res.status(200).json({
      ok: true,
      msg: 'Inicio de sesión correcto.',
      user: {
        id: user.id,
        usuario: user.usuario,
        es_medico: esMedico,
      },
    });
  });
};
