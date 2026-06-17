import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Topbar from '../../../components/layout/Topbar'
import Button from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/FormControl'
import { DataTable, Td } from '../../../components/ui/Table'
import SidePanel from '../../../components/ui/SidePanel'
import PcmsoAcaoForm from './PcmsoAcaoForm'

const STATUS_STYLES = {
  pendente:  'bg-yellow-50 text-yellow-700',
  realizado: 'bg-green-50 text-green-600',
  cancelado: 'bg-gray-100 text-gray-500',
}

export default function PcmsoPage() {
  const [programa, setPrograma]   = useState(null)
  const [acoes, setAcoes]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showAcao, setShowAcao]   = useState(false)
  const [editando, setEditando]   = useState(false)
  const [formProg, setFormProg]   = useState({ medico_coordenador: '', crm: '', vigencia_inicio: '', vigencia_fim: '' })
  const [saving, setSaving]       = useState(false)

  async function load() {
    setLoading(true)
    const { data: prog } = await supabase.from('pcmso_programa').select('*').order('vigencia_inicio', { ascending: false }).limit(1).single()
    setPrograma(prog ?? null)
    if (prog) {
      const { data: ac } = await supabase.from('pcmso_acao').select('*').eq('pcmso_programa_id', prog.id).order('data_prevista')
      setAcoes(ac ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function salvarPrograma() {
    setSaving(true)
    if (programa) {
      await supabase.from('pcmso_programa').update(formProg).eq('id', programa.id)
    } else {
      await supabase.from('pcmso_programa').insert(formProg)
    }
    setSaving(false)
    setEditando(false)
    load()
  }

  function iniciarEdicao() {
    setFormProg({
      medico_coordenador: programa?.medico_coordenador ?? '',
      crm:                programa?.crm ?? '',
      vigencia_inicio:    programa?.vigencia_inicio ?? '',
      vigencia_fim:       programa?.vigencia_fim ?? '',
    })
    setEditando(true)
  }

  const set = (k, v) => setFormProg((f) => ({ ...f, [k]: v }))

  return (
    <div>
      <Topbar
        breadcrumb="Saúde Ocupacional"
        title={<><i className="fa-solid fa-heart-pulse text-metro-primary mr-2" />PCMSO</>}
      />

      <div className="p-6 space-y-4">
        <Card title="Programa Vigente" icon="heart-pulse" action={
          !editando && (
            <Button variant="outline" size="sm" icon="pen" onClick={iniciarEdicao}>
              {programa ? 'Editar' : 'Cadastrar'}
            </Button>
          )
        }>
          {loading ? (
            <p className="px-5 py-6 text-metro-muted text-sm text-center">Carregando...</p>
          ) : editando ? (
            <div className="p-5 space-y-1">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Médico Coordenador" value={formProg.medico_coordenador} onChange={(e) => set('medico_coordenador', e.target.value)} placeholder="Dr. Nome Completo" />
                <Input label="CRM" value={formProg.crm} onChange={(e) => set('crm', e.target.value)} placeholder="12345/DF" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Vigência Início" type="date" value={formProg.vigencia_inicio} onChange={(e) => set('vigencia_inicio', e.target.value)} />
                <Input label="Vigência Fim" type="date" value={formProg.vigencia_fim} onChange={(e) => set('vigencia_fim', e.target.value)} />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditando(false)}>Cancelar</Button>
                <Button size="sm" icon="check" onClick={salvarPrograma} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Programa'}
                </Button>
              </div>
            </div>
          ) : programa ? (
            <div className="px-5 py-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-metro-muted uppercase tracking-wide font-semibold mb-0.5">Médico Coordenador</p>
                <p className="text-[13px] font-semibold text-metro-text">{programa.medico_coordenador || '—'}</p>
                <p className="text-[11px] text-metro-muted">CRM: {programa.crm || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] text-metro-muted uppercase tracking-wide font-semibold mb-0.5">Vigência</p>
                <p className="text-[13px] font-semibold text-metro-text">
                  {programa.vigencia_inicio ? new Date(programa.vigencia_inicio + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                  {' → '}
                  {programa.vigencia_fim ? new Date(programa.vigencia_fim + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                </p>
              </div>
            </div>
          ) : (
            <p className="px-5 py-6 text-metro-muted text-sm text-center">Nenhum programa cadastrado. Clique em "Cadastrar" para iniciar.</p>
          )}
        </Card>

        <Card
          title="Ações Programadas"
          icon="list-check"
          action={
            programa && (
              <Button size="sm" icon="plus" onClick={() => setShowAcao(true)}>Nova Ação</Button>
            )
          }
        >
          {acoes.length === 0 ? (
            <p className="px-5 py-6 text-metro-muted text-sm text-center">
              {programa ? 'Nenhuma ação cadastrada.' : 'Cadastre o programa primeiro.'}
            </p>
          ) : (
            <DataTable headers={['Descrição', 'GHE', 'Data Prevista', 'Responsável', 'Status']}>
              {acoes.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                  <Td className="text-[13px] text-metro-text max-w-[200px]">{a.descricao}</Td>
                  <Td className="text-[12px] text-metro-muted">{a.ghe || '—'}</Td>
                  <Td className="text-[12px] text-metro-muted">
                    {a.data_prevista ? new Date(a.data_prevista + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                  </Td>
                  <Td className="text-[12px] text-metro-muted">{a.responsavel || '—'}</Td>
                  <Td>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[a.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {a.status === 'pendente' ? 'Pendente' : a.status === 'realizado' ? 'Realizado' : 'Cancelado'}
                    </span>
                  </Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Card>
      </div>

      <SidePanel open={showAcao} title="Nova Ação PCMSO" icon="list-check" onClose={() => setShowAcao(false)}>
        <PcmsoAcaoForm
          programaId={programa?.id}
          onSaved={() => { setShowAcao(false); load() }}
          onCancel={() => setShowAcao(false)}
        />
      </SidePanel>
    </div>
  )
}
