import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha inválidos.')
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-metro-navy flex items-center justify-center font-sans">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="inline-block bg-metro-accent text-metro-navy font-bold text-sm px-4 py-2 rounded-md tracking-widest mb-3">
            METRO-DF
          </span>
          <h1 className="text-white text-xl font-bold">Saúde e Segurança do Trabalho</h1>
          <p className="text-white/40 text-sm mt-1">Acesso restrito a colaboradores</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <h2 className="text-metro-navy text-[15px] font-bold mb-6">Entrar na plataforma</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">
                E-mail corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border-[1.5px] border-gray-200 rounded-md text-[13px] outline-none focus:border-metro-primary transition-colors font-sans"
                placeholder="seu@metro.df.gov.br"
              />
            </div>
            <div className="mb-6">
              <label className="block text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-3 py-2 border-[1.5px] border-gray-200 rounded-md text-[13px] outline-none focus:border-metro-primary transition-colors font-sans"
                placeholder="••••••••"
              />
            </div>
            {erro && (
              <p className="text-red-600 text-xs mb-4 bg-red-50 px-3 py-2 rounded-md">{erro}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-metro-primary hover:bg-metro-dark text-white font-semibold py-2.5 rounded-md text-sm transition-colors disabled:opacity-60 cursor-pointer font-sans"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          SST Metro-DF · Acesso controlado pelo SESMT
        </p>
      </div>
    </div>
  )
}
