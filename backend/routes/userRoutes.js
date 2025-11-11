// ===============================================================
// 🧭 index.js
// Archivo principal de enrutamiento del backend
// Conecta las rutas de login, médicos y pacientes
// ===============================================================

import express from 'express';
import { loginUser } from '../controllers/userController.js'; // Controlador de login
import doctorsRoutes from './doctors.js'; // Rutas de médicos
import patientsRoutes from './patients.js'; // Rutas de pacientes
import clinicsRoutes from './clinics.js'; // Rutas de consultorios
import usersRoutes from './users.js'; // CRUD de usuarios

const router = express.Router();

// ===============================================================
// 🔐 RUTA DE LOGIN
// POST /api/login
// ===============================================================
router.post('/login', loginUser);

// ===============================================================
// 👨‍⚕️ RUTAS DE MÉDICOS
// Se usarán en /api/medicos
// ===============================================================
router.use('/doctors', doctorsRoutes);

// ===============================================================
// 🧍‍♂️ RUTAS DE PACIENTES
// Se usarán en /api/pacientes
// ===============================================================
router.use('/patients', patientsRoutes);

// ===============================================================
// RUTA DE CONSULTORIOS
router.use('/clinics', clinicsRoutes);
router.use('/users', usersRoutes);



// Exportamos el router principal para que lo use server.js
export default router;
