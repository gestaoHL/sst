import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Input, Select, Textarea, DateInput } from '../../components/ui/FormControl'
import Button from '../../components/ui/Button'

const TIPOS = [
  { value: 'insalubridade',  label: 'Laudo de Insalubridade' },
  { value: 'periculosidade', label: 'Laudo de Periculosidade' },
  { value: 'ltcat',          label: 'LTCAT' },
  { value: 'pgr',            label: 'PGR' },
  { value: 'outro',          label: 'Outro' },
]

export default function LaudoForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    tipo: 'pgr',
    titulo: '',
    responsavel_tecnico: '',
    crt_crq: '',
    data_emissao: new Date().toISOString().slice(0, 10),
    validade: '',
    url_documento: '',
    observacoes: '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.titulo || !form.responsavel_tecnico) {
      setErro('Título e responsável técnico são obrigatórios.')
      return
    }
    setSaving(true); setErro(null)
    const payload = { ...form, validade: form.validade || null }
    const { error } = await supabase.from('laudo').insert(payload)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <Select label="Tipo de Documento" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
        {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </Select>

      <Input label="Título" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ex: PGR 2025 — Operação" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Responsável Técnico" value={form.responsavel_tecnico} onChange={(e) => set('responsavel_tecnico', e.target.value)} placeholder="Nome do engenheiro/técnico" />
        <Input label="CRT / CRQ" value={form.crt_crq} onChange={(e) => set('crt_crq', e.target.value)} placeholder="Ex: CRT-DF 12345" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DateInput label="Data de Emissão" value={form.data_emissao} onChange={(e) => set('data_emissao', e.target.value)} />
        <DateInput label="Validade" value={form.validade} onChange={(e) => set('validade', e.target.value)} />
      </div>

      <Input label="URL / Link do Documento" value={form.url_documento} onChange={(e) => set('url_documento', e.target.value)} placeholder="https://..." />

      <Textarea label="Observações" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} rows={2} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="folder-open" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Documento'}
        </Button>
      </div>
    </>
  )
}
