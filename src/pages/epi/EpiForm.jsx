import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Input, Select } from '../../components/ui/FormControl'
import Button from '../../components/ui/Button'

const TIPOS_RISCO = [
  { value: 'fisico',    label: 'Físico' },
  { value: 'quimico',   label: 'Químico' },
  { value: 'biologico', label: 'Biológico' },
  { value: 'ergonomico',label: 'Ergonômico' },
  { value: 'acidente',  label: 'Acidente' },
]

export default function EpiForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    nome: '',
    ca: '',
    fabricante: '',
    validade_ca: '',
    tipo_risco: 'fisico',
    estoque: 0,
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.nome || !form.ca) { setErro('Nome e CA são obrigatórios.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('epi_item').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <Input label="Nome do EPI" value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Ex: Capacete de Segurança" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Nº CA (Certificado de Aprovação)" value={form.ca} onChange={(e) => set('ca', e.target.value)} placeholder="Ex: 12345" />
        <Input label="Validade do CA" type="date" value={form.validade_ca} onChange={(e) => set('validade_ca', e.target.value)} />
      </div>

      <Input label="Fabricante" value={form.fabricante} onChange={(e) => set('fabricante', e.target.value)} placeholder="Ex: 3M do Brasil" />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo de Risco" value={form.tipo_risco} onChange={(e) => set('tipo_risco', e.target.value)}>
          {TIPOS_RISCO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
        <Input label="Estoque Inicial" type="number" value={form.estoque} onChange={(e) => set('estoque', parseInt(e.target.value) || 0)} min="0" />
      </div>

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="helmet-safety" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Cadastrar EPI'}
        </Button>
      </div>
    </>
  )
}
