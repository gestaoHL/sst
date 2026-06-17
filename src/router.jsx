import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './pages/auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import AsoPage from './pages/saude/Aso/AsoPage'
import ComingSoon from './pages/stubs/ComingSoon'

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
      { path: 'saude/absenteismo',        element: <ComingSoon modulo="Absenteísmo" /> },
      { path: 'seguranca/acidentes',     element: <ComingSoon modulo="Acidentes / CAT" /> },
      { path: 'seguranca/inspecoes',     element: <ComingSoon modulo="Inspeções" /> },
      { path: 'seguranca/permissoes',    element: <ComingSoon modulo="Permissões de Trabalho" /> },
      { path: 'epi',                     element: <ComingSoon modulo="Gestão de EPIs" /> },
      { path: 'treinamentos',            element: <ComingSoon modulo="Treinamentos" /> },
      { path: 'cipa',                    element: <ComingSoon modulo="CIPA" /> },
      { path: 'laudos',                  element: <ComingSoon modulo="Laudos / PGR" /> },
      { path: 'funcionarios',            element: <ComingSoon modulo="Funcionários" /> },
    ],
  },
])
