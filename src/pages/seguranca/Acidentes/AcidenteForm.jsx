import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Input, Select, Textarea } from '../../../components/ui/FormControl'
import Button from '../../../components/ui/Button'

const TIPOS = [
  { value: 'tipico',             label: 'Acidente Típico' },
  { value: 'trajeto',            label: 'Acidente de Trajeto' },
  { value: 'quase_acidente',     label: 'Quase-Acidente' },
  { value: 'doenca_ocupacional', label: 'Doença Ocupacional' },
]

const STATUS_LIST = [
  { value: 'registrado',   label: 'Registrado' },
  { value: 'investigando', label: 'Investigando' },
  { value: 'concluido',    label: 'Concluído' },
]

export default function AcidenteForm({ onSaved, onCancel }) {
  const [funcionarios, setFuncionarios] = useState([])
  const [form, setForm] = useState({
    tipo: 'tipico',
    data_hora: new Date().toISOString().slice(0, 16),
    local_descricao: '',
    funcionario_id: '',
    descricao: '',
    partes_corpo: '',
    status: 'registrado',
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
    if (!form.descricao) { setErro('Informe a descrição da ocorrência.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('acidente').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo de Ocorrência" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
        <Input label="Data / Hora" type="datetime-local" value={form.data_hora} onChange={(e) => set('data_hora', e.target.value)} />
      </div>

      <Select label="Funcionário Envolvido" value={form.funcionario_id} onChange={(e) => set('funcionario_id', e.target.value)}>
        <option value="">— selecione (opcional) —</option>
        {funcionarios.map((f) => (
          <option key={f.id} value={f.id}>{f.matricula} · {f.nome_completo}</option>
        ))}
      </Select>

      <Input label="Local / Setor" value={form.local_descricao} onChange={(e) => set('local_descricao', e.target.value)} placeholder="Ex: Estação Central — Plataforma 2" />

      <Textarea label="Descrição da Ocorrência" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Descreva o que aconteceu..." rows={4} />

      <Input label="Partes do Corpo Atingidas" value={form.partes_corpo} onChange={(e) => set('partes_corpo', e.target.value)} placeholder="Ex: Mão direita, joelho esquerdo" />

      <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
        {STATUS_LIST.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </Select>

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="triangle-exclamation" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Registrar'}
        </Button>
      </div>
    </>
  )
}
