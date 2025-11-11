// Importamos React y el hook useState para manejar estado local del componente.
import React, { useState } from 'react';

// Importamos componentes de React-Bootstrap para maquetar el formulario de forma sencilla.
import { Form, Button, Container, Card } from 'react-bootstrap';

// Exportamos el componente por defecto para poder usarlo en App.js y en las rutas.
export default function Login() {
  // Estado para el campo "rol" (médico o admin).
  const [rol, setRol] = useState('');
  // Estado para el usuario (string, por ahora sin validación).
  const [usuario, setUsuario] = useState('');
  // Estado para la contraseña.
  const [password, setPassword] = useState('');
  // Estado para mostrar un posible mensaje de error (opcional, útil al validar con BD).
  const [error, setError] = useState('');

  // Función que se dispara al enviar el formulario (submit).
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones en frontend
    if (!rol) return setError('Por favor, seleccioná un rol.');
    if (!usuario.trim()) return setError('Por favor, ingresá el usuario.');
    if (!password.trim()) return setError('Por favor, ingresá la contraseña.');

    try {
      // Petición al backend
 const response = await fetch('http://localhost:4000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, contrasena: password, rol }), // 👈 usamos 'contrasena'
      });

      const data = await response.json();

      // Si el backend responde con error
      if (!data.ok) {
        setError(data.msg || 'Usuario o contraseña inválidos.');
        setUsuario(''); // Limpia los campos
        setPassword('');
        setRol('');
        return;
      }

      // Si el login es exitoso:
if (data.user.es_medico) {
  window.location.href = '/medico';
} else {
  window.location.href = '/admin';
}
    } catch (err) {
      console.error('Error al conectar con el servidor:', err);
      setError('Error de conexión con el servidor.');
      setUsuario('');
      setPassword('');
      setRol('');
    }
  };

  // JSX de la UI del Login.
  return (
    // Contenedor de Bootstrap que centra vertical y horizontalmente el card.
    <Container className="d-flex justify-content-center align-items-center vh-100">
      {/* Card para el formulario de login */}
        <Card className="login-card">

        {/* Título de la clínica (podés reemplazar por un logo en el futuro) */}
        <h3 className="text-center mb-3">Clínica Seprise</h3>

        {/* Si hay error, lo mostramos en un alert simple (podés usar <Alert> de Bootstrap si querés) */}
        {error && (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        )}

        {/* Formulario controlado: cada input está vinculado a su estado */}
        <Form onSubmit={handleSubmit}>
          {/* Selector de rol */}
          <Form.Group className="mb-3">
            <Form.Label>Rol</Form.Label>
            <Form.Select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              aria-label="Seleccionar rol"
            >
              {/* Opción por defecto vacía */}
              <option value="">Seleccione</option>
              {/* Opción Médico */}
              <option value="medico">Médico</option>
              {/* Opción Administrador */}
              <option value="admin">Administrador</option>
            </Form.Select>
          </Form.Group>

          {/* Campo de usuario */}
          <Form.Group className="mb-3">
            <Form.Label>Usuario</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username" // Sugerencia del navegador
            />
          </Form.Group>

          {/* Campo de contraseña */}
          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingrese contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" // Sugerencia del navegador
            />
          </Form.Group>

          {/* Botón de enviar (submit) */}
          <Button type="submit" variant="primary" className="w-100">
            Iniciar sesión
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
