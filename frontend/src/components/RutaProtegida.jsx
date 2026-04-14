import { Navigate } from 'react-router-dom';

export default function RutaProtegida({ children, rolesPermitidos }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // 1. Si no hay sesión (token), lo mandamos directo al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si definimos roles permitidos y el usuario no tiene el correcto, lo sacamos
  if (rolesPermitidos && !rolesPermitidos.includes(String(user.id_rol))) {
    console.warn("Acceso denegado: No tienes el rol necesario para esta vista.");
    return <Navigate to="/" replace />; // Lo mandamos a la página principal
  }

  // 3. Si todo está en orden, lo dejamos pasar a la vista que pidió
  return children;
}