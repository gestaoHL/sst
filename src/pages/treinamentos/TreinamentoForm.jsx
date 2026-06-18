import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Input, Select, Textarea, DateInput } from '../../components/ui/FormControl'
import Button from '../../components/ui/Button'

const NRS = [
  { value: '',      label: '— Não vinculado —' },
  { value: 'NR-6',  label: 'NR-6 — EPI' },
  { value: 'NR-10', label: 'NR-10 — Eletricidade' },
  { value: 'NR-12', label: 'NR-12 — Máquinas e Equipamentos' },
  { value: 'NR-33', label: 'NR-33 — Espaço Confinado' },
  { value: 'NR-35', label: 'NR-35 — Trabalho em Altura' },
  { value: 'NR-1',  label: 'NR-1 — Disposições Gerais (PGR)' },
  { value: 'outro', label: 'Outro' },
]

export default function TreinamentoForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    nome: '',
    nr_vinculada: '',
    carga_horaria: 8,
    validade_meses: 12,
    instrutor: '',
    data_realizacao: new Date().toISOString().slice(0, 10),
    observacoes: '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.nome) { setErro('Informe o nome do treinamento.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('treinamento').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <Input label="Nome do Treinamento" value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Ex: Trabalho em Altura NR-35" />

      <Select label="NR Vinculada" value={form.nr_vinculada} onChange={(e) => set('nr_vinculada', e.target.value)}>
        {NRS.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Carga Horária (h)" type="number" value={form.carga_horaria} onChange={(e) => set('carga_horaria', parseInt(e.target.value) || 0)} min="1" />
        <Input label="Validade (meses)" type="number" value={form.validade_meses} onChange={(e) => set('validade_meses', parseInt(e.target.value) || 0)} min="1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Instrutor" value={form.instrutor} onChange={(e) => set('instrutor', e.target.value)} placeholder="Nome do instrutor" />
        <DateInput label="Data de Realização" value={form.data_realizacao} onChange={(e) => set('data_realizacao', e.target.value)} />
      </div>

      <Textarea label="Observações" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Conteúdo, local, observações..." rows={3} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="graduation-cap" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Treinamento'}
        </Button>
      </div>
    </>
  )
}
