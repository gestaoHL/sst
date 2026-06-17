import { useAuth } from './useAuth'

export function useRole() {
  const { perfil } = useAuth()
  return {
    isSesmt:  perfil?.papel === 'sesmt',
    isGestor: perfil?.papel === 'gestor',
    setorId:  perfil?.setor_id ?? null,
  }
}
