import { renderHook } from '@testing-library/react'
import { AuthContext } from '../contexts/AuthContext'
import { useRole } from '../hooks/useRole'

function wrapper(perfil) {
  return ({ children }) => (
    <AuthContext.Provider value={{ session: {}, perfil, loading: false }}>
      {children}
    </AuthContext.Provider>
  )
}

test('isSesmt true quando papel é sesmt', () => {
  const { result } = renderHook(() => useRole(), {
    wrapper: wrapper({ papel: 'sesmt', setor_id: null }),
  })
  expect(result.current.isSesmt).toBe(true)
  expect(result.current.isGestor).toBe(false)
})

test('isGestor true quando papel é gestor', () => {
  const { result } = renderHook(() => useRole(), {
    wrapper: wrapper({ papel: 'gestor', setor_id: 5 }),
  })
  expect(result.current.isGestor).toBe(true)
  expect(result.current.setorId).toBe(5)
})

test('setorId null quando sesmt', () => {
  const { result } = renderHook(() => useRole(), {
    wrapper: wrapper({ papel: 'sesmt', setor_id: null }),
  })
  expect(result.current.setorId).toBeNull()
})
