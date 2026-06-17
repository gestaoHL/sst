import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Input, Select, Textarea } from '../../../components/ui/FormControl'
import Button from '../../../components/ui/Button'

const TIPOS = [
  { value: 'rotineira',     label: 'Rotineira' },
  { value: 'especial',      label: 'Especial' },
  { value: 'pos_acidente',  label: 'Pós-Acidente' },
]

const AREAS = [
  { value: 'estacao',    label: 'Estação' },
  { value: 'oficina',    label: 'Oficina / Manutenção' },
  { value: 'cco',        label: 'CCO (Centro de Controle)' },
  { value: 'via',        label: 'Via Permanente' },
  { value: 'deposito',   label: 'Depósito / Pátio' },
  { value: 'escritorio', label: 'Escritório / Administração' },
]

export default function InspecaoForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    tipo: 'rotineira',
    area: 'estacao',
    descricao_area: '',
    data_inspecao: new Date().toISOString().slice(0, 10),
    responsavel_tecnico: '',
    status: 'aberta',
    observacoes: '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.responsavel_tecnico) { setErro('Informe o responsável técnico.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('inspecao').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo de Inspeção" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
        <Input label="Data" type="date" value={form.data_inspecao} onChange={(e) => set('data_inspecao', e.target.value)} />
      </div>

      <Select label="Área Inspecionada" value={form.area} onChange={(e) => set('area', e.target.value)}>
        {AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
      </Select>

      <Input label="Descrição da Área" value={form.descricao_area} onChange={(e) => set('descricao_area', e.target.value)} placeholder="Ex: Estação Central — Plataforma Sul" />

      <Input label="Responsável Técnico (SST)" value={form.responsavel_tecnico} onChange={(e) => set('responsavel_tecnico', e.target.value)} placeholder="Nome do técnico responsável" />

      <Textarea label="Observações Iniciais" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Contexto, objetivo da inspeção..." rows={3} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="magnifying-glass" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Abrir Inspeção'}
        </Button>
      </div>
    </>
  )
}
