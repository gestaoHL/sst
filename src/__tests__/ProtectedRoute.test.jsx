import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import ProtectedRoute from '../components/auth/ProtectedRoute'

function wrap(session, loading, children) {
  return (
    <AuthContext.Provider value={{ session, loading, perfil: null }}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={<ProtectedRoute>{children}</ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

test('mostra conteúdo quando autenticado', () => {
  render(wrap({ user: 'x' }, false, <div>Conteúdo Protegido</div>))
  expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument()
})

test('redireciona para /login quando sem sessão', () => {
  render(wrap(null, false, <div>Conteúdo Protegido</div>))
  expect(screen.getByText('Login Page')).toBeInTheDocument()
})

test('mostra loading quando ainda carregando', () => {
  render(wrap(null, true, <div>Conteúdo</div>))
  expect(screen.getByText('Carregando...')).toBeInTheDocument()
})
