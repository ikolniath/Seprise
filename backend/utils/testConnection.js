import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2';

// 🧭 Cargamos el .env con ruta absoluta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Intentando conectar con MySQL...');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar:', err.message);
  } else {
    console.log(`✅ Conectado correctamente al puerto ${process.env.DB_PORT}`);
    connection.query('SELECT DATABASE() AS db, NOW() AS fecha', (err2, results) => {
      if (err2) console.error('⚠️ Error al hacer query:', err2.message);
      else console.log('📘 Base actual:', results[0].db, '🕒 Fecha:', results[0].fecha);
      connection.end();
    });
  }
});
