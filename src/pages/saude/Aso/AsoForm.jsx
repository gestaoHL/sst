import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Input, Select, Textarea, DateInput } from '../../../components/ui/FormControl'
import Button from '../../../components/ui/Button'

const TIPOS = [
  { value: 'periodico',          label: 'Periódico' },
  { value: 'admissional',        label: 'Admissional' },
  { value: 'demissional',        label: 'Demissional' },
  { value: 'retorno_ao_trabalho',label: 'Retorno ao Trabalho' },
  { value: 'mudanca_de_funcao',  label: 'Mudança de Função' },
  { value: 'monitoracao_pontual',label: 'Monitoração Pontual' },
]

const RESULTADOS = [
  { value: 'apto',   label: 'Apto' },
  { value: 'inapto', label: 'Inapto' },
]

export default function AsoForm({ onSaved, onCancel }) {
  const [funcionarios, setFuncionarios] = useState([])
  const [form, setForm] = useState({
    funcionario_id: '',
    tipo_exame: 'periodico',
    data_aso: new Date().toISOString().slice(0, 10),
    data_proximo_aso: '',
    medico_responsavel: '',
    crm: '',
    apto: true,
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

  async function salvar() {
    if (!form.funcionario_id) { setErro('Selecione o funcionário.'); return }
    if (!form.data_aso) { setErro('Informe a data do ASO.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('aso').insert({
      ...form,
      data_proximo_aso: form.data_proximo_aso || null,
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

      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo de Exame" value={form.tipo_exame} onChange={(e) => set('tipo_exame', e.target.value)}>
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
        <DateInput label="Data do ASO" value={form.data_aso} onChange={(e) => set('data_aso', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Médico Responsável" value={form.medico_responsavel} onChange={(e) => set('medico_responsavel', e.target.value)} placeholder="Nome do médico" />
        <Input label="CRM" value={form.crm} onChange={(e) => set('crm', e.target.value)} placeholder="Ex: 12345/DF" />
      </div>

      <DateInput label="Data do Próximo ASO" value={form.data_proximo_aso} onChange={(e) => set('data_proximo_aso', e.target.value)} />

      <div className="mb-4">
        <label className="block text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">Resultado</label>
        <div className="flex gap-2">
          {RESULTADOS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => set('apto', r.value === 'apto')}
              className={`flex-1 py-2 rounded-md border-2 text-xs font-semibold transition-colors font-sans cursor-pointer ${
                (r.value === 'apto') === form.apto
                  ? r.value === 'apto'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 text-metro-muted hover:border-gray-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <Textarea label="Observações" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Restrições, observações do médico..." rows={3} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="check" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar ASO'}
        </Button>
      </div>
    </>
  )
}
