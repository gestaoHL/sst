import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Input, Select, Textarea } from '../../../components/ui/FormControl'
import Button from '../../../components/ui/Button'

const TIPOS_PT = [
  { value: 'entrada_via',      label: 'Entrada em Via (NR-10)' },
  { value: 'espaco_confinado', label: 'Espaço Confinado (NR-33)' },
  { value: 'altura',           label: 'Trabalho em Altura (NR-35)' },
  { value: 'eletricidade',     label: 'Eletricidade (NR-10)' },
  { value: 'geral',            label: 'Permissão Geral / APR' },
]

export default function PermissaoForm({ onSaved, onCancel }) {
  const [funcionarios, setFuncionarios] = useState([])
  const [form, setForm] = useState({
    tipo: 'geral',
    atividade: '',
    local: '',
    data_inicio: new Date().toISOString().slice(0, 16),
    data_fim: '',
    solicitante_id: '',
    responsavel_sst: '',
    riscos_identificados: '',
    medidas_controle: '',
    epis_requeridos: '',
    status: 'rascunho',
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
    if (!form.atividade) { setErro('Descreva a atividade a ser executada.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('permissao_trabalho').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  const tipoSelecionado = TIPOS_PT.find((t) => t.value === form.tipo)

  return (
    <>
      <Select label="Tipo de Permissão" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
        {TIPOS_PT.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </Select>

      {tipoSelecionado && form.tipo !== 'geral' && (
        <div className="mb-4 bg-orange-50 border border-orange-100 rounded-md px-3 py-2">
          <p className="text-[11px] text-orange-700 font-semibold">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            Atividade crítica — verifique habilitação e EPI específico antes de emitir
          </p>
        </div>
      )}

      <Textarea label="Atividade a ser Executada" value={form.atividade} onChange={(e) => set('atividade', e.target.value)} placeholder="Descreva detalhadamente a atividade..." rows={3} />

      <Input label="Local / Área de Execução" value={form.local} onChange={(e) => set('local', e.target.value)} placeholder="Ex: Via Principal — Km 12 / Estação Central" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Início" type="datetime-local" value={form.data_inicio} onChange={(e) => set('data_inicio', e.target.value)} />
        <Input label="Término Previsto" type="datetime-local" value={form.data_fim} onChange={(e) => set('data_fim', e.target.value)} />
      </div>

      <Select label="Solicitante" value={form.solicitante_id} onChange={(e) => set('solicitante_id', e.target.value)}>
        <option value="">— selecione (opcional) —</option>
        {funcionarios.map((f) => (
          <option key={f.id} value={f.id}>{f.matricula} · {f.nome_completo}</option>
        ))}
      </Select>

      <Input label="Responsável SST" value={form.responsavel_sst} onChange={(e) => set('responsavel_sst', e.target.value)} placeholder="Nome do técnico SST responsável" />

      <Textarea label="Riscos Identificados" value={form.riscos_identificados} onChange={(e) => set('riscos_identificados', e.target.value)} placeholder="Liste os principais riscos da atividade..." rows={2} />

      <Textarea label="Medidas de Controle" value={form.medidas_controle} onChange={(e) => set('medidas_controle', e.target.value)} placeholder="Medidas preventivas a serem adotadas..." rows={2} />

      <Input label="EPIs Requeridos" value={form.epis_requeridos} onChange={(e) => set('epis_requeridos', e.target.value)} placeholder="Ex: Capacete, luva isolante, cinto de segurança" />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="clipboard-check" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Emitir Permissão'}
        </Button>
      </div>
    </>
  )
}
