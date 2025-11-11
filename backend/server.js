// ===============================================================
// server.js
// Punto de entrada del backend: configura Express y monta rutas
// ===============================================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/userRoutes.js';
import turnsRoutes from './routes/turns.js';
import paymentsRoutes from './routes/payments.js';

// ---------------------------------------------------------------
// Configuración de entorno (equivalente a __dirname en ESM)
// ---------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// ---------------------------------------------------------------
// Inicialización de Express + middlewares base
// ---------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------
// Rutas de la API
// ---------------------------------------------------------------
// apiRoutes ya expone /login, /patients, /doctors y /clinics
app.use('/api', apiRoutes);
app.use('/api/turnos', turnsRoutes);
app.use('/api/pagos', paymentsRoutes);

// ---------------------------------------------------------------
// Servidor HTTP
// ---------------------------------------------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
