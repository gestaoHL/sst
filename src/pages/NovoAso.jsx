import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const TIPOS = [
  'admissional', 'periodico', 'retorno_ao_trabalho',
  'mudanca_de_funcao', 'monitoracao_pontual', 'demissional',
]
const RESULTADOS = ['apto', 'apto_com_restricao', 'inapto']

const lbl = { display: 'block', margin: '10px 0 4px', fontSize: 14 }
const inp = { width: '100%', padding: 8, fontSize: 14, boxSizing: 'border-box' }

export default function NovoAso() {
  const [funcionarios, setFuncionarios] = useState([])
  const [msg, setMsg] = useState(null)
  const [form, setForm] = useState({
    funcionario_id: '',
    tipo: 'periodico',
    data_realizacao: new Date().toISOString().slice(0, 10),
    resultado: 'apto',
    restricoes: '',
  })

  useEffect(() => {
    supabase
      .from('funcionario')
      .select('id, matricula, nome_completo')
      .order('nome_completo')
      .then(({ data }) => setFuncionarios(data ?? []))
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const salvar = async () => {
    setMsg(null)
    if (!form.funcionario_id) {
      setMsg('Selecione o funcionario.')
      return
    }
    const { data, error } = await supabase
      .from('aso')
      .insert(form)
      .select('data_proximo')
      .single()
    if (error) setMsg('Erro: ' + error.message)
    else setMsg('ASO registrado. Proximo exame: ' + (data?.data_proximo ?? '-'))
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ fontSize: 16 }}>Registrar ASO</h2>

      <label style={lbl}>
        Funcionario
        <select value={form.funcionario_id} onChange={(e) => set('funcionario_id', e.target.value)} style={inp}>
          <option value="">- selecione -</option>
          {funcionarios.map((f) => (
            <option key={f.id} value={f.id}>{f.matricula} &middot; {f.nome_completo}</option>
          ))}
        </select>
      </label>

      <label style={lbl}>
        Tipo
        <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)} style={inp}>
          {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>

      <label style={lbl}>
        Data de realizacao
        <input type="date" value={form.data_realizacao} onChange={(e) => set('data_realizacao', e.target.value)} style={inp} />
      </label>

      <label style={lbl}>
        Resultado
        <select value={form.resultado} onChange={(e) => set('resultado', e.target.value)} style={inp}>
          {RESULTADOS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>

      <label style={lbl}>
        Restricoes
        <input value={form.restricoes} onChange={(e) => set('restricoes', e.target.value)} style={inp} />
      </label>

      <button
        onClick={salvar}
        style={{ marginTop: 12, padding: '10px 16px', background: '#0a7d4b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
      >
        Salvar
      </button>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  )
}
