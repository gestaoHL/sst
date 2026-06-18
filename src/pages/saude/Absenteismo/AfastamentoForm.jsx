import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Input, Select, Textarea, DateInput } from '../../../components/ui/FormControl'
import Button from '../../../components/ui/Button'

const TIPOS = [
  { value: 'doenca',           label: 'Doença / Enfermidade' },
  { value: 'acidente_trabalho',label: 'Acidente de Trabalho' },
  { value: 'acidente_trajeto', label: 'Acidente de Trajeto' },
  { value: 'licenca',          label: 'Licença Médica' },
  { value: 'outros',           label: 'Outros' },
]

export default function AfastamentoForm({ onSaved, onCancel }) {
  const [funcionarios, setFuncionarios] = useState([])
  const [form, setForm] = useState({
    funcionario_id: '',
    tipo: 'doenca',
    cid10: '',
    data_inicio: new Date().toISOString().slice(0, 10),
    data_fim: '',
    crm_medico: '',
    numero_inss: '',
    observacoes: '',
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

  const diasAfastados = form.data_inicio && form.data_fim
    ? Math.ceil((new Date(form.data_fim) - new Date(form.data_inicio)) / 86400000) + 1
    : null

  async function salvar() {
    if (!form.funcionario_id) { setErro('Selecione o funcionário.'); return }
    if (!form.data_inicio)    { setErro('Informe a data de início.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('afastamento').insert({
      ...form,
      data_fim: form.data_fim || null,
      dias_afastados: diasAfastados,
    })
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

      <Select label="Tipo de Afastamento" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
        {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Input label="CID-10" value={form.cid10} onChange={(e) => set('cid10', e.target.value)} placeholder="Ex: M54.5" />
        <Input label="CRM do Médico" value={form.crm_medico} onChange={(e) => set('crm_medico', e.target.value)} placeholder="Ex: 12345/DF" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DateInput label="Data de Início" value={form.data_inicio} onChange={(e) => set('data_inicio', e.target.value)} />
        <DateInput label="Data de Retorno" value={form.data_fim} onChange={(e) => set('data_fim', e.target.value)} />
      </div>

      {diasAfastados !== null && (
        <p className="text-xs text-metro-muted bg-slate-50 px-3 py-2 rounded-md mb-1">
          <strong>{diasAfastados}</strong> dia{diasAfastados !== 1 ? 's' : ''} de afastamento
        </p>
      )}

      <Input label="Nº Benefício INSS" value={form.numero_inss} onChange={(e) => set('numero_inss', e.target.value)} placeholder="Opcional" />

      <Textarea label="Observações" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Observações adicionais..." rows={2} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="calendar-xmark" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Registrar Afastamento'}
        </Button>
      </div>
    </>
  )
}
