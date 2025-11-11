CREATE DATABASE IF NOT EXISTS clinica_seprise;
USE clinica_seprise;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    es_medico BOOLEAN NOT NULL DEFAULT 0
);

INSERT INTO usuarios (usuario, contrasena, es_medico)
VALUES 
('admin', 'admin123', false),
('medico1', 'medico123', true);

DELIMITER //

CREATE PROCEDURE validar_usuario (
    IN p_usuario VARCHAR(50),
    IN p_contrasena VARCHAR(255)
)
BEGIN
    SELECT id, usuario 
    FROM usuarios
    WHERE usuario = p_usuario 
      AND contrasena = p_contrasena;
END //

DELIMITER ;

CREATE TABLE pacientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dni VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  telefono VARCHAR(30),
  domicilio VARCHAR(150),
  email VARCHAR(100),
  obra_social VARCHAR(100)
);

CREATE TABLE medicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dni VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  telefono VARCHAR(30),
  domicilio VARCHAR(150),
  email VARCHAR(100),
  especialidad VARCHAR(100)
);


CREATE TABLE consultorios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  num_consultorio INT NOT NULL,
  estado BOOLEAN DEFAULT TRUE
);


CREATE TABLE turnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  medico_id INT NOT NULL,
  especialidad VARCHAR(100),
  paciente_id INT NOT NULL,
  pago_id INT,
  FOREIGN KEY (medico_id) REFERENCES medicos(id),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);

CREATE TABLE pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  monto DECIMAL(10,2) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  turno_id INT,
  FOREIGN KEY (turno_id) REFERENCES turnos(id)
);


INSERT INTO pacientes (dni, nombre, apellido, fecha_nacimiento, telefono, domicilio, email, obra_social)
VALUES
('30123123', 'María', 'Gómez', '1980-11-09', '1134567890', 'Av. Corrientes 1234', 'maria@gmail.com', 'OSDE'),
('29234111', 'Luis', 'Pérez', '1999-15-04', '1145678901', 'Calle Falsa 123', 'luisperez@gmail.com', 'Swiss Medical');

INSERT INTO medicos (dni, nombre, apellido, fecha_nacimiento, telefono, domicilio, email, especialidad)
VALUES
('25123123', 'Carlos', 'Martínez', '1999-15-04', '1156789012', 'Av. Libertador 500', 'cmartinez@clinica.com', 'Cardiología'),
('27654321', 'Laura', 'Sánchez', '1999-15-04', '1167890123', 'San Martín 250', 'lsanchez@clinica.com', 'Pediatría');


 