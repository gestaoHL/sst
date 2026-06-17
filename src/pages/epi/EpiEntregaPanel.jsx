import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Select, Input } from '../../components/ui/FormControl'
import Button from '../../components/ui/Button'

export default function EpiEntregaPanel({ funcionarioId, onSaved }) {
  const [epis, setEpis] = useState([])
  const [form, setForm] = useState({ epi_item_id: '', quantidade: 1, data_entrega: new Date().toISOString().slice(0, 10) })
  const [entregas, setEntregas] = useState([])
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    supabase.from('epi_item').select('id, nome, ca').order('nome').then(({ data }) => setEpis(data ?? []))
    if (funcionarioId) {
      supabase
        .from('epi_entrega')
        .select('*, epi_item(nome, ca)')
        .eq('funcionario_id', funcionarioId)
        .order('data_entrega', { ascending: false })
        .then(({ data }) => setEntregas(data ?? []))
    }
  }, [funcionarioId])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function registrar() {
    if (!form.epi_item_id) { setErro('Selecione o EPI.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('epi_entrega').insert({ ...form, funcionario_id: funcionarioId })
    setSaving(false)
    if (error) setErro('Erro ao registrar: ' + error.message)
    else {
      const { data } = await supabase.from('epi_entrega').select('*, epi_item(nome, ca)').eq('funcionario_id', funcionarioId).order('data_entrega', { ascending: false })
      setEntregas(data ?? [])
      setForm((f) => ({ ...f, epi_item_id: '', quantidade: 1 }))
      if (onSaved) onSaved()
    }
  }

  return (
    <div>
      <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-gray-100">
        <p className="text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-3">Registrar Entrega</p>
        <Select label="EPI" value={form.epi_item_id} onChange={(e) => set('epi_item_id', e.target.value)}>
          <option value="">— selecione —</option>
          {epis.map((e) => <option key={e.id} value={e.id}>{e.nome} (CA {e.ca})</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Quantidade" type="number" value={form.quantidade} onChange={(e) => set('quantidade', parseInt(e.target.value) || 1)} min="1" />
          <Input label="Data de Entrega" type="date" value={form.data_entrega} onChange={(e) => set('data_entrega', e.target.value)} />
        </div>
        {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-2">{erro}</p>}
        <Button size="sm" icon="box" onClick={registrar} disabled={saving || !funcionarioId}>
          {saving ? 'Registrando...' : 'Registrar Entrega'}
        </Button>
      </div>

      {entregas.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-2">Histórico de Entregas</p>
          {entregas.map((e) => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-[12px] font-semibold text-metro-text">{e.epi_item?.nome}</p>
                <p className="text-[10px] text-metro-muted">CA {e.epi_item?.ca} · Qtd: {e.quantidade}</p>
              </div>
              <p className="text-[11px] text-metro-muted">
                {e.data_entrega ? new Date(e.data_entrega + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
