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
      { path: 'saude/pcmso',             element: <ComingSoon modulo="PCMSO" /> },
      { path: 'saude/absenteismo',        element: <AbsenteismoPage /> },
      { path: 'seguranca/acidentes',     element: <AcidentesPage /> },
      { path: 'seguranca/inspecoes',     element: <ComingSoon modulo="Inspeções" /> },
      { path: 'seguranca/permissoes',    element: <ComingSoon modulo="Permissões de Trabalho" /> },
      { path: 'epi',                     element: <EpiPage /> },
      { path: 'treinamentos',            element: <TreinamentosPage /> },
      { path: 'cipa',                    element: <ComingSoon modulo="CIPA" /> },
      { path: 'laudos',                  element: <ComingSoon modulo="Laudos / PGR" /> },
      { path: 'funcionarios',            element: <ComingSoon modulo="Funcionários" /> },
    ],
  },
])
