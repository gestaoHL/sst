import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Topbar from '../../components/layout/Topbar'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { DataTable, Td } from '../../components/ui/Table'
import ProntuarioPrint from './ProntuarioPrint'

const ABAS = ['Resumo', 'ASOs', 'EPIs', 'Treinamentos', 'Afastamentos']

const SITUACAO_LABEL = {
  vencido:  'Vencido',
  vence_30: 'Vence em 30d',
  vence_60: 'Vence em 60d',
  vence_90: 'Vence em 90d',
  ok:       'Regular',
  sem_aso:  'Sem ASO',
}

export default function FuncionarioProntuario() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [func, setFunc]           = useState(null)
  const [abaAtiva, setAbaAtiva]   = useState('Resumo')
  const [asos, setAsos]           = useState([])
  const [epis, setEpis]           = useState([])
  const [treinamentos, setTreinamentos] = useState([])
  const [afastamentos, setAfastamentos] = useState([])
  const [semTabTP, setSemTabTP]   = useState(false)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data: funcData } = await supabase
        .from('funcionario')
        .select('*')
        .eq('id', id)
        .single()
      setFunc(funcData ?? null)

      const [asoRes, epiRes, afastRes] = await Promise.all([
        supabase.from('aso').select('*').eq('funcionario_id', id).order('data_aso', { ascending: false }),
        supabase.from('epi_entrega').select('*, epi_item(nome, ca)').eq('funcionario_id', id).order('data_entrega', { ascending: false }),
        supabase.from('afastamento').select('*').eq('funcionario_id', id).order('data_inicio', { ascending: false }),
      ])

      setAsos(asoRes.data ?? [])
      setEpis(epiRes.data ?? [])
      setAfastamentos(afastRes.data ?? [])

      const { data: tpData, error: tpErr } = await supabase
        .from('treinamento_participante')
        .select('*, treinamento(nome, nr_vinculada, data_realizacao, validade_meses)')
        .eq('funcionario_id', id)

      if (tpErr?.code === '42P01') {
        setSemTabTP(true)
      } else {
        setTreinamentos(tpData ?? [])
      }

      setLoading(false)
    }
    load()
  }, [id])

  const anoAtual = new Date().getFullYear()
  const afastamentosAno = afastamentos.filter((a) => a.data_inicio?.startsWith(String(anoAtual)))
  const diasAno = afastamentosAno.reduce((acc, a) => acc + (a.dias_afastados ?? 0), 0)
  const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'

  return (
    <div>
      <Topbar
        breadcrumb="Funcionários"
        title={<><i className="fa-solid fa-id-card text-metro-primary mr-2" />{func?.nome_completo ?? '...'}</>}
        actions={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" icon="arrow-left" onClick={() => navigate('/funcionarios')}>Voltar</Button>
            <Button size="sm" icon="print" onClick={() => window.print()}>Imprimir Prontuário</Button>
          </div>
        }
      />

      {loading && <p className="px-6 py-10 text-metro-muted text-sm text-center">Carregando...</p>}

      {!loading && func && (
        <div className="p-6 print:hidden">
          {/* Cabeçalho do funcionário */}
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 mb-4 flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-metro-primary/10 flex items-center justify-center text-lg font-bold text-metro-primary flex-shrink-0">
              {func.nome_completo?.split(' ').slice(0, 2).map((n) => n[0]).join('')}
            </div>
            <div className="flex-1 grid grid-cols-4 gap-4">
              {[
                ['Matrícula', <span className="font-mono">{func.matricula}</span>],
                ['Função', func.funcao || '—'],
                ['Setor', func.setor || '—'],
                ['Admissão', func.data_admissao ? fmt(func.data_admissao) : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] text-metro-muted uppercase tracking-wide font-semibold mb-0.5">{label}</p>
                  <p className="text-[13px] font-semibold text-metro-text">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Abas */}
          <div className="flex gap-1 mb-4">
            {ABAS.map((aba) => (
              <button
                key={aba}
                onClick={() => setAbaAtiva(aba)}
                className={`px-4 py-2 text-[12px] font-semibold rounded-lg transition-colors border-none cursor-pointer ${
                  abaAtiva === aba
                    ? 'bg-metro-primary text-white'
                    : 'bg-white text-metro-muted hover:text-metro-primary border border-gray-100'
                }`}
              >
                {aba}
              </button>
            ))}
          </div>

          {/* Aba Resumo */}
          {abaAtiva === 'Resumo' && (
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Último ASO', value: asos[0] ? fmt(asos[0].data_aso) : '—', sub: asos[0] ? <Badge status={asos[0].situacao}>{SITUACAO_LABEL[asos[0].situacao] ?? 'Regular'}</Badge> : null, color: 'border-t-metro-primary', textColor: 'text-metro-navy' },
                { label: 'EPIs Recebidos', value: epis.length, sub: 'Total de entregas', color: 'border-t-blue-500', textColor: 'text-blue-600' },
                { label: 'Treinamentos', value: treinamentos.length, sub: 'Participações', color: 'border-t-purple-500', textColor: 'text-purple-600' },
                { label: 'Dias Afastados', value: diasAno, sub: `No ano de ${anoAtual}`, color: 'border-t-orange-500', textColor: 'text-orange-600' },
              ].map(({ label, value, sub, color, textColor }) => (
                <div key={label} className={`bg-white rounded-xl border border-gray-100 border-t-4 ${color} px-5 py-4`}>
                  <p className="text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">{label}</p>
                  <p className={`text-3xl font-bold leading-none mb-1 ${textColor}`}>{value}</p>
                  {sub && <div className="text-[11px] text-metro-muted">{sub}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Aba ASOs */}
          {abaAtiva === 'ASOs' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <DataTable headers={['Data', 'Tipo', 'Médico Responsável', 'Próximo Exame', 'Situação']} empty="Nenhum ASO registrado.">
                {asos.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <Td className="text-[12px] text-metro-muted">{fmt(r.data_aso)}</Td>
                    <Td className="text-[12px] text-metro-text">{r.tipo_exame || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">{r.medico_responsavel || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">{r.data_proximo_aso ? fmt(r.data_proximo_aso) : '—'}</Td>
                    <Td><Badge status={r.situacao}>{SITUACAO_LABEL[r.situacao] ?? 'Regular'}</Badge></Td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}

          {/* Aba EPIs */}
          {abaAtiva === 'EPIs' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <DataTable headers={['EPI', 'CA', 'Quantidade', 'Data de Entrega']} empty="Nenhuma entrega registrada.">
                {epis.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <Td className="font-semibold text-metro-text text-[13px]">{r.epi_item?.nome || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">{r.epi_item?.ca || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">{r.quantidade}</Td>
                    <Td className="text-[12px] text-metro-muted">{r.data_entrega ? fmt(r.data_entrega) : '—'}</Td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}

          {/* Aba Treinamentos */}
          {abaAtiva === 'Treinamentos' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {semTabTP ? (
                <p className="px-5 py-8 text-center text-metro-muted text-sm">
                  <i className="fa-solid fa-circle-info mr-2" />
                  A tabela <code className="bg-slate-100 px-1 rounded">treinamento_participante</code> ainda não existe no banco.
                  Crie-a para vincular funcionários a treinamentos.
                </p>
              ) : (
                <DataTable headers={['Treinamento', 'NR', 'Data', 'Válido até']} empty="Nenhum treinamento registrado.">
                  {treinamentos.map((r) => {
                    const d = r.treinamento?.data_realizacao
                    const m = r.treinamento?.validade_meses
                    const valido = d && m
                      ? new Date(new Date(d).setMonth(new Date(d).getMonth() + m)).toLocaleDateString('pt-BR')
                      : '—'
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60">
                        <Td className="font-semibold text-metro-text text-[13px]">{r.treinamento?.nome || '—'}</Td>
                        <Td className="text-[12px] text-metro-muted">{r.treinamento?.nr_vinculada || '—'}</Td>
                        <Td className="text-[12px] text-metro-muted">{d ? fmt(d) : '—'}</Td>
                        <Td className="text-[12px] text-metro-muted">{valido}</Td>
                      </tr>
                    )
                  })}
                </DataTable>
              )}
            </div>
          )}

          {/* Aba Afastamentos */}
          {abaAtiva === 'Afastamentos' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <DataTable headers={['Tipo', 'CID-10', 'Início', 'Retorno', 'Dias']} empty="Nenhum afastamento registrado.">
                {afastamentos.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <Td className="text-[12px] text-metro-text capitalize">{r.tipo || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted font-mono">{r.cid10 || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">{r.data_inicio ? fmt(r.data_inicio) : '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">
                      {r.data_fim ? fmt(r.data_fim) : <span className="text-orange-500 font-semibold">Em curso</span>}
                    </Td>
                    <Td className="font-semibold text-metro-navy text-[13px]">{r.dias_afastados ?? '—'}</Td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}
        </div>
      )}

      {/* Layout de impressão — visível apenas no print */}
      {!loading && func && (
        <ProntuarioPrint
          func={func}
          asos={asos}
          epis={epis}
          treinamentos={treinamentos}
          afastamentos={afastamentos}
        />
      )}
    </div>
  )
}
