import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const SETORES = [
  'Operação', 'Manutenção', 'Administração', 'Segurança', 'Tecnologia',
  'Recursos Humanos', 'Financeiro', 'Jurídico', 'Comunicação', 'Outro',
]

const inputCls = 'w-full px-3 py-2 border-[1.5px] border-gray-200 rounded-md text-[13px] outline-none focus:border-metro-primary transition-colors font-sans'
const labelCls = 'block text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5'

export default function SolicitarAcesso() {
  const [form, setForm] = useState({ nome: '', email: '', funcao: '', setor: '', justificativa: '' })
  const [saving, setSaving] = useState(false)
  const [erro, setErro]     = useState(null)
  const [ok, setOk]         = useState(false)
  const navigate = useNavigate()

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function enviar(e) {
    e.preventDefault()
    if (!form.nome || !form.email) { setErro('Nome e e-mail são obrigatórios.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('solicitacao_acesso').insert({
      nome: form.nome,
      email: form.email.toLowerCase().trim(),
      funcao: form.funcao || null,
      setor: form.setor || null,
      justificativa: form.justificativa || null,
    })
    setSaving(false)
    if (error) {
      if (error.code === '23505') setErro('Este e-mail já possui uma solicitação em andamento.')
      else setErro('Erro ao enviar: ' + error.message)
    } else {
      setOk(true)
    }
  }

  if (ok) {
    return (
      <div className="min-h-screen bg-metro-navy flex items-center justify-center font-sans">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-circle-check text-2xl text-green-500" />
            </div>
            <h2 className="text-metro-navy text-[15px] font-bold mb-2">Solicitação enviada!</h2>
            <p className="text-metro-muted text-[13px] mb-6">
              O administrador do sistema irá analisar sua solicitação e entrará em contato.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-metro-primary hover:bg-metro-dark text-white font-semibold py-2.5 rounded-md text-sm transition-colors cursor-pointer font-sans border-none"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-metro-navy flex items-center justify-center font-sans py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="inline-block bg-metro-accent text-metro-navy font-bold text-sm px-4 py-2 rounded-md tracking-widest mb-3">
            METRO-DF
          </span>
          <h1 className="text-white text-xl font-bold">Solicitar Acesso</h1>
          <p className="text-white/40 text-sm mt-1">Preencha os dados para solicitar acesso ao portal SST</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <form onSubmit={enviar} className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Nome Completo</label>
              <input className={inputCls} value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Seu nome completo" required />
            </div>

            <div>
              <label className={labelCls}>E-mail Corporativo</label>
              <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="seu@metro.df.gov.br" required />
            </div>

            <div>
              <label className={labelCls}>Função / Cargo</label>
              <input className={inputCls} value={form.funcao} onChange={(e) => set('funcao', e.target.value)} placeholder="Ex: Operador de Trem" />
            </div>

            <div>
              <label className={labelCls}>Setor</label>
              <select className={inputCls} value={form.setor} onChange={(e) => set('setor', e.target.value)}>
                <option value="">— selecione —</option>
                {SETORES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Justificativa</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                value={form.justificativa}
                onChange={(e) => set('justificativa', e.target.value)}
                placeholder="Descreva o motivo do acesso..."
              />
            </div>

            {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md">{erro}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-metro-primary hover:bg-metro-dark text-white font-semibold py-2.5 rounded-md text-sm transition-colors disabled:opacity-60 cursor-pointer font-sans border-none"
            >
              {saving ? 'Enviando...' : 'Enviar Solicitação'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-metro-muted text-sm hover:text-metro-primary transition-colors bg-transparent border-none cursor-pointer font-sans"
            >
              Voltar ao Login
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
