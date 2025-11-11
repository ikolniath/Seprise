// ==============================
// 🔐 Script: encryptUsers.js
// Descripción: encripta (hashea) las contraseñas de todos los usuarios 
// en la tabla 'usuarios' utilizando bcrypt, de forma segura.
// ==============================

// Importamos utilidades del sistema para manejar rutas
import path from 'path';
import { fileURLToPath } from 'url';

// Importamos las dependencias necesarias
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';

// ==============================
// 🧭 Carga manual del archivo .env
// (esto es importante porque el script se ejecuta dentro de /utils,
// y por defecto dotenv buscaría un .env ahí, no en la carpeta /backend)
const __filename = fileURLToPath(import.meta.url);   // Ruta absoluta del archivo actual
const __dirname = path.dirname(__filename);          // Carpeta actual (utils)
dotenv.config({ path: path.join(__dirname, '../.env') }); // Cargamos el .env que está una carpeta arriba
// ==============================

// Número de "rondas" de cifrado. A mayor número, más seguro pero más lento.
// 10 es un valor recomendado estándar.
const saltRounds = 10;

// ==============================
// 🔁 Función principal
// ==============================
const encryptUsers = async () => {
  try {
    // Consulta a la base de datos: obtenemos todos los usuarios
    db.query('SELECT id, contrasena FROM usuarios', async (err, users) => {
      if (err) {
        // Si hay error, lo mostramos en consola y terminamos el proceso
        console.error('❌ Error al consultar usuarios:', err.message);
        console.error('🔎 Detalle completo:', err);
        process.exit(1);
      }

      // Contador de usuarios actualizados
      let updated = 0;

      // Recorremos cada usuario
      for (const user of users) {
        const contrasena = user.contrasena;

        // Si la contraseña ya está hasheada (empieza con $2b$ o $2a$), la salteamos
        if (contrasena.startsWith('$2b$') || contrasena.startsWith('$2a$')) {
          continue;
        }

        // Encriptamos la contraseña original
        const hashed = await bcrypt.hash(contrasena, saltRounds);

        // Actualizamos la contraseña en la base de datos con la versión encriptada
        db.query('UPDATE usuarios SET contrasena = ? WHERE id = ?', [hashed, user.id]);
        updated++;
      }

      // Mostramos el resultado final
      console.log(`✅ Encriptación completada. Usuarios actualizados: ${updated}`);

      // Cerramos el pool de conexiones para liberar recursos
      db.end();
      process.exit();
    });
  } catch (error) {
    // Si algo falla fuera del query (por ejemplo, conexión interrumpida)
    console.error('⚠️ Error inesperado:', error.message);
    db.end();
    process.exit(1);
  }
};

// ==============================
// ▶️ Ejecutamos la función principal
// ==============================
encryptUsers();
