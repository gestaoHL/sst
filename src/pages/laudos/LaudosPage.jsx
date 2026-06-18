import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Topbar from '../../components/layout/Topbar'
import Button from '../../components/ui/Button'
import { DataTable, Td } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import FilterBar, { SearchInput } from '../../components/ui/FilterBar'
import SidePanel from '../../components/ui/SidePanel'
import LaudoForm from './LaudoForm'
import RiscoForm from './RiscoForm'

const TIPO_LAUDO_LABEL = {
  insalubridade:  'Insalubridade',
  periculosidade: 'Periculosidade',
  ltcat:          'LTCAT',
  pgr:            'PGR',
  outro:          'Outro',
}

const TIPO_RISCO_STYLES = {
  fisico:     'bg-blue-50 text-blue-700',
  quimico:    'bg-yellow-50 text-yellow-700',
  biologico:  'bg-green-50 text-green-700',
  ergonomico: 'bg-purple-50 text-purple-700',
  acidente:   'bg-red-50 text-red-700',
}

const PER_PAGE = 20

function docStatus(validade) {
  if (!validade) return { label: 'Sem validade', cls: 'bg-gray-100 text-gray-500' }
  const diff = Math.floor((new Date(validade) - new Date()) / 86400000)
  if (diff < 0)   return { label: 'Vencido',           cls: 'bg-red-50 text-red-600' }
  if (diff <= 90) return { label: `Vence em ${diff}d`, cls: 'bg-orange-50 text-orange-600' }
  return { label: 'Válido', cls: 'bg-green-50 text-green-600' }
}

export default function LaudosPage() {
  const [aba, setAba]               = useState('documentos')
  const [laudos, setLaudos]         = useState([])
  const [riscos, setRiscos]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [showLaudo, setShowLaudo]   = useState(false)
  const [showRisco, setShowRisco]   = useState(false)

  function loadLaudos() {
    supabase.from('laudo').select('*').order('data_emissao', { ascending: false }).then(({ data }) => setLaudos(data ?? []))
  }

  function loadRiscos() {
    supabase.from('risco_ghe').select('*').order('ghe').then(({ data }) => setRiscos(data ?? []))
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      supabase.from('laudo').select('*').order('data_emissao', { ascending: false }),
      supabase.from('risco_ghe').select('*').order('ghe'),
    ]).then(([lRes, rRes]) => {
      setLaudos(lRes.data ?? [])
      setRiscos(rRes.data ?? [])
      setLoading(false)
    })
  }, [])

  const filteredLaudos = laudos.filter((r) => {
    const q = search.toLowerCase()
    return !q || r.titulo?.toLowerCase().includes(q) || r.responsavel_tecnico?.toLowerCase().includes(q)
  })

  const filteredRiscos = riscos.filter((r) => {
    const q = search.toLowerCase()
    return !q || r.ghe?.toLowerCase().includes(q) || r.agente?.toLowerCase().includes(q)
  })

  const paginatedLaudos = filteredLaudos.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const paginatedRiscos = filteredRiscos.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <Topbar
        breadcrumb="Gestão"
        title={<><i className="fa-solid fa-folder-open text-metro-primary mr-2" />Laudos / PGR</>}
        actions={
          aba === 'documentos'
            ? <Button size="sm" icon="plus" onClick={() => setShowLaudo(true)}>Novo Documento</Button>
            : <Button size="sm" icon="plus" onClick={() => setShowRisco(true)}>Novo Risco</Button>
        }
      />

      <div className="p-6">
        {/* Abas */}
        <div className="flex gap-1 mb-4">
          {[['documentos', 'Documentos Técnicos'], ['riscos', 'Riscos por GHE']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setAba(key); setSearch(''); setPage(1) }}
              className={`px-4 py-2 text-[12px] font-semibold rounded-lg transition-colors border-none cursor-pointer ${
                aba === key
                  ? 'bg-metro-primary text-white'
                  : 'bg-white text-metro-muted hover:text-metro-primary border border-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <FilterBar>
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder={aba === 'documentos' ? 'Buscar por título ou responsável...' : 'Buscar por GHE ou agente...'}
          />
        </FilterBar>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
            {loading ? (
              <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p>
            ) : aba === 'documentos' ? (
              <>
                <div className="px-5 py-3.5 border-b border-gray-100">
                  <span className="text-[13px] font-bold text-metro-navy">
                    Documentos Técnicos
                    <span className="text-metro-muted font-normal ml-2 text-xs">— {filteredLaudos.length} documentos</span>
                  </span>
                </div>
                <DataTable
                  headers={['Tipo', 'Título', 'Responsável', 'Emissão', 'Validade', 'Status']}
                  empty="Nenhum documento cadastrado."
                >
                  {paginatedLaudos.map((r) => {
                    const s = docStatus(r.validade)
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                        <Td>
                          <span className="bg-slate-100 text-metro-primary text-[10px] font-semibold px-2 py-0.5 rounded">
                            {TIPO_LAUDO_LABEL[r.tipo] ?? r.tipo}
                          </span>
                        </Td>
                        <Td>
                          <p className="font-semibold text-metro-text text-[13px]">{r.titulo}</p>
                          {r.crt_crq && <p className="text-[11px] text-metro-muted">{r.crt_crq}</p>}
                        </Td>
                        <Td className="text-[12px] text-metro-muted">{r.responsavel_tecnico}</Td>
                        <Td className="text-[12px] text-metro-muted">
                          {r.data_emissao ? new Date(r.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                        </Td>
                        <Td className="text-[12px] text-metro-muted">
                          {r.validade ? new Date(r.validade + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                        </Td>
                        <Td>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>{s.label}</span>
                        </Td>
                      </tr>
                    )
                  })}
                </DataTable>
                <Pagination page={page} total={filteredLaudos.length} perPage={PER_PAGE} onPage={setPage} />
              </>
            ) : (
              <>
                <div className="px-5 py-3.5 border-b border-gray-100">
                  <span className="text-[13px] font-bold text-metro-navy">
                    Riscos por GHE
                    <span className="text-metro-muted font-normal ml-2 text-xs">— {filteredRiscos.length} riscos</span>
                  </span>
                </div>
                <DataTable
                  headers={['GHE', 'Agente', 'Tipo', 'Intensidade', 'EPC', 'EPI Requerido']}
                  empty="Nenhum risco cadastrado."
                >
                  {paginatedRiscos.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <Td className="font-semibold text-metro-text text-[13px]">{r.ghe}</Td>
                      <Td className="text-[12px] text-metro-text">{r.agente}</Td>
                      <Td>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${TIPO_RISCO_STYLES[r.tipo_risco] ?? 'bg-slate-100 text-slate-600'}`}>
                          {r.tipo_risco ? r.tipo_risco.charAt(0).toUpperCase() + r.tipo_risco.slice(1) : '—'}
                        </span>
                      </Td>
                      <Td className="text-[12px] text-metro-muted">{r.intensidade || '—'}</Td>
                      <Td className="text-[12px] text-metro-muted">{r.epc || '—'}</Td>
                      <Td className="text-[12px] text-metro-muted">{r.epi_requerido || '—'}</Td>
                    </tr>
                  ))}
                </DataTable>
                <Pagination page={page} total={filteredRiscos.length} perPage={PER_PAGE} onPage={setPage} />
              </>
            )}
          </div>

          {showLaudo && (
            <SidePanel open={showLaudo} title="Novo Documento" icon="folder-open" onClose={() => setShowLaudo(false)}>
              <LaudoForm onSaved={() => { setShowLaudo(false); loadLaudos() }} onCancel={() => setShowLaudo(false)} />
            </SidePanel>
          )}

          {showRisco && (
            <SidePanel open={showRisco} title="Novo Risco GHE" icon="shield-halved" onClose={() => setShowRisco(false)}>
              <RiscoForm onSaved={() => { setShowRisco(false); loadRiscos() }} onCancel={() => setShowRisco(false)} />
            </SidePanel>
          )}
        </div>
      </div>
    </div>
  )
}
