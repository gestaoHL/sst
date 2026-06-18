import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './pages/auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import AsoPage from './pages/saude/Aso/AsoPage'
import ComingSoon from './pages/stubs/ComingSoon'
import AcidentesPage from './pages/seguranca/Acidentes/AcidentesPage'
import EpiPage from './pages/epi/EpiPage'
import TreinamentosPage from './pages/treinamentos/TreinamentosPage'
import AbsenteismoPage from './pages/saude/Absenteismo/AbsenteismoPage'
import PcmsoPage from './pages/saude/Pcmso/PcmsoPage'
import InspecoesPage from './pages/seguranca/Inspecoes/InspecoesPage'
import PermissoesPage from './pages/seguranca/Permissoes/PermissoesPage'
import FuncionariosPage from './pages/funcionarios/FuncionariosPage'
import FuncionarioProntuario from './pages/funcionarios/FuncionarioProntuario'
import CipaPage from './pages/cipa/CipaPage'

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard',               element: <Dashboard /> },
      { path: 'saude/aso',               element: <AsoPage /> },
      { path: 'saude/pcmso',             element: <PcmsoPage /> },
      { path: 'saude/absenteismo',        element: <AbsenteismoPage /> },
      { path: 'seguranca/acidentes',     element: <AcidentesPage /> },
      { path: 'seguranca/inspecoes',     element: <InspecoesPage /> },
      { path: 'seguranca/permissoes',    element: <PermissoesPage /> },
      { path: 'epi',                     element: <EpiPage /> },
      { path: 'treinamentos',            element: <TreinamentosPage /> },
      { path: 'cipa',                    element: <CipaPage /> },
      { path: 'laudos',                  element: <ComingSoon modulo="Laudos / PGR" /> },
      { path: 'funcionarios',            element: <FuncionariosPage /> },
      { path: 'funcionarios/:id',        element: <FuncionarioProntuario /> },
    ],
  },
])
