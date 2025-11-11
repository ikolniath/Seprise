// ==============================================
// 🔌 db.js — conexión centralizada a MySQL
// ==============================================

import mysql from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 🧭 Forzamos a dotenv a cargar el .env desde /backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// 🧩 Creamos el pool de conexiones a MySQL
export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3307, // 🔥 aseguramos tipo número
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Verificamos la conexión al iniciar
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:');
    console.error(err);
  } else {
    console.log(
      `✅ Conexión establecida con MySQL (${process.env.DB_NAME}) en puerto ${process.env.DB_PORT}`
    );
    connection.release();
  }
});

