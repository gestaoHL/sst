import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Input, Select, Textarea, DateInput } from '../../../components/ui/FormControl'
import Button from '../../../components/ui/Button'

const STATUS_ACAO = [
  { value: 'pendente',  label: 'Pendente' },
  { value: 'realizado', label: 'Realizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function PcmsoAcaoForm({ programaId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    pcmso_programa_id: programaId,
    descricao: '',
    ghe: '',
    data_prevista: '',
    status: 'pendente',
    responsavel: '',
    observacoes: '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.descricao) { setErro('Informe a descrição da ação.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('pcmso_acao').insert({
      ...form,
      data_prevista: form.data_prevista || null,
    })
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <Textarea label="Descrição da Ação" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Ex: Audiometria para GHE Manutenção" rows={3} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="GHE (Grupo Homogêneo)" value={form.ghe} onChange={(e) => set('ghe', e.target.value)} placeholder="Ex: GHE-01 Operação" />
        <DateInput label="Data Prevista" value={form.data_prevista} onChange={(e) => set('data_prevista', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          {STATUS_ACAO.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
        <Input label="Responsável" value={form.responsavel} onChange={(e) => set('responsavel', e.target.value)} placeholder="Nome do responsável" />
      </div>

      <Textarea label="Observações" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Observações..." rows={2} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="check" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Ação'}
        </Button>
      </div>
    </>
  )
}
