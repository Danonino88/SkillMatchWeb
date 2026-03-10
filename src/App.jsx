import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Registro from './pages/Registro';
import DashboardEmpresas from './pages/DashboardEmpresas';
import DashboardVinculacion from './pages/DashboardVinculacion';
import DashboardEstudiante from './pages/DashboardEstudiante';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                        element={<LandingPage />} />
        <Route path="/login"                   element={<Login />} />
        <Route path="/registro"                element={<Registro />} />
        <Route path="/dashboard-empresa/*"     element={<DashboardEmpresas />} />
        <Route path="/dashboard-vinculacion/*" element={<DashboardVinculacion />} />
        <Route path="/dashboard-estudiante/*"  element={<DashboardEstudiante />} />
        <Route path="*"                        element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}