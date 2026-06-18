import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Input, Select, Textarea } from '../../components/ui/FormControl'
import Button from '../../components/ui/Button'

const TIPOS_RISCO = [
  { value: 'fisico',     label: 'Físico' },
  { value: 'quimico',   label: 'Químico' },
  { value: 'biologico', label: 'Biológico' },
  { value: 'ergonomico',label: 'Ergonômico' },
  { value: 'acidente',  label: 'Acidente' },
]

export default function RiscoForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    ghe: '',
    agente: '',
    tipo_risco: 'fisico',
    fonte: '',
    intensidade: '',
    epc: '',
    epi_requerido: '',
    observacoes: '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.ghe || !form.agente) { setErro('GHE e agente de risco são obrigatórios.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('risco_ghe').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Input label="GHE" value={form.ghe} onChange={(e) => set('ghe', e.target.value)} placeholder="Ex: GHE-01 Operação" />
        <Select label="Tipo de Risco" value={form.tipo_risco} onChange={(e) => set('tipo_risco', e.target.value)}>
          {TIPOS_RISCO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
      </div>

      <Input label="Agente de Risco" value={form.agente} onChange={(e) => set('agente', e.target.value)} placeholder="Ex: Ruído acima de 85 dB(A)" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Fonte / Origem" value={form.fonte} onChange={(e) => set('fonte', e.target.value)} placeholder="Ex: Trem em movimento" />
        <Input label="Intensidade / Concentração" value={form.intensidade} onChange={(e) => set('intensidade', e.target.value)} placeholder="Ex: 92 dB(A)" />
      </div>

      <Input label="EPC Adotado" value={form.epc} onChange={(e) => set('epc', e.target.value)} placeholder="Ex: Enclausuramento acústico" />
      <Input label="EPI Requerido" value={form.epi_requerido} onChange={(e) => set('epi_requerido', e.target.value)} placeholder="Ex: Protetor auricular CA 12345" />
      <Textarea label="Observações" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} rows={2} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="shield-halved" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Risco'}
        </Button>
      </div>
    </>
  )
}
