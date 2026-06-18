import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Select, DateInput } from '../../components/ui/FormControl'
import Button from '../../components/ui/Button'

const CARGOS = [
  { value: 'presidente',      label: 'Presidente' },
  { value: 'vice_presidente', label: 'Vice-Presidente' },
  { value: 'secretario',      label: 'Secretário' },
  { value: 'membro',          label: 'Membro' },
]

export default function CipaMembroForm({ onSaved, onCancel }) {
  const [funcionarios, setFuncionarios] = useState([])
  const [form, setForm] = useState({
    funcionario_id: '',
    cargo: 'membro',
    tipo: 'titular',
    representacao: 'empregados',
    data_inicio: new Date().toISOString().slice(0, 10),
    data_fim: '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    supabase
      .from('funcionario')
      .select('id, matricula, nome_completo')
      .order('nome_completo')
      .then(({ data }) => setFuncionarios(data ?? []))
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.funcionario_id) { setErro('Selecione o funcionário.'); return }
    if (!form.data_inicio || !form.data_fim) { setErro('Informe o período do mandato.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('cipa_membro').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <Select label="Funcionário" value={form.funcionario_id} onChange={(e) => set('funcionario_id', e.target.value)}>
        <option value="">— selecione —</option>
        {funcionarios.map((f) => (
          <option key={f.id} value={f.id}>{f.matricula} · {f.nome_completo}</option>
        ))}
      </Select>

      <Select label="Cargo na CIPA" value={form.cargo} onChange={(e) => set('cargo', e.target.value)}>
        {CARGOS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
          <option value="titular">Titular</option>
          <option value="suplente">Suplente</option>
        </Select>
        <Select label="Representação" value={form.representacao} onChange={(e) => set('representacao', e.target.value)}>
          <option value="empregados">Empregados</option>
          <option value="empregador">Empregador</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DateInput label="Início do Mandato" value={form.data_inicio} onChange={(e) => set('data_inicio', e.target.value)} />
        <DateInput label="Fim do Mandato" value={form.data_fim} onChange={(e) => set('data_fim', e.target.value)} />
      </div>

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="scale-balanced" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Adicionar Membro'}
        </Button>
      </div>
    </>
  )
}
