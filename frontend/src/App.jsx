import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Registro from './pages/Registro';
import DashboardEmpresas from './pages/DashboardEmpresas';
import DashboardVinculacion from './pages/DashboardVinculacion';
import DashboardEstudiante from './pages/DashboardEstudiante';
import DashboardProfesores from './pages/DashboardProfesores';
import VerProyecto from './pages/VerProyecto';
import VerAlumno from './pages/VerAlumno';

import RutaProtegida from './components/RutaProtegida';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🟢 RUTAS PÚBLICAS (Cualquiera puede entrar) 🟢 */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/proyecto/:id" element={<VerProyecto />} />

        {/* 🔴 RUTAS PROTEGIDAS (Requieren token y rol específico) 🔴 */}
        
        {/* Solo Rol 3 (Empresa) */}
        <Route 
          path="/dashboard-empresa/*" 
          element={
            <RutaProtegida rolesPermitidos={['3']}>
              <DashboardEmpresas />
            </RutaProtegida>
          } 
        />
        
        {/* Solo Rol 1 (Vinculación / Admin) */}
        <Route 
          path="/dashboard-vinculacion/*" 
          element={
            <RutaProtegida rolesPermitidos={['1']}>
              <DashboardVinculacion />
            </RutaProtegida>
          } 
        />
        
        {/* Solo Rol 4 (Profesor) */}
        <Route 
          path="/dashboard-profesores/*" 
          element={
            <RutaProtegida rolesPermitidos={['4']}>
              <DashboardProfesores />
            </RutaProtegida>
          } 
        />
        
        {/* Solo Rol 2 (Estudiante) */}
        <Route 
          path="/dashboard-estudiante/*" 
          element={
            <RutaProtegida rolesPermitidos={['2']}>
              <DashboardEstudiante />
            </RutaProtegida>
          } 
        />

        {/* Ver Alumno: Solo pedimos que esté logueado (cualquier rol que tenga cuenta puede ver perfiles) */}
        <Route 
          path="/ver-alumno/:id" 
          element={
            <RutaProtegida>
              <VerAlumno />
            </RutaProtegida>
          } 
        />

        {/* 🛑 RUTA COMODÍN (Si escriben una URL que no existe, los manda al inicio) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}