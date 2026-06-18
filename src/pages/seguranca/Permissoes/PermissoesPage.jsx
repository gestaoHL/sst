import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Topbar from '../../../components/layout/Topbar'
import Button from '../../../components/ui/Button'
import { DataTable, Td } from '../../../components/ui/Table'
import Pagination from '../../../components/ui/Pagination'
import FilterBar, { SearchInput, FilterChip } from '../../../components/ui/FilterBar'
import SidePanel from '../../../components/ui/SidePanel'
import PermissaoForm from './PermissaoForm'
import PermissaoPrint from './PermissaoPrint'

const TIPO_LABEL = {
  entrada_via:      'Entrada em Via',
  espaco_confinado: 'Esp. Confinado',
  altura:           'Trab. em Altura',
  eletricidade:     'Eletricidade',
  geral:            'APR / Geral',
}

const TIPO_STYLES = {
  entrada_via:      'bg-blue-50 text-blue-700',
  espaco_confinado: 'bg-purple-50 text-purple-700',
  altura:           'bg-orange-50 text-orange-700',
  eletricidade:     'bg-yellow-50 text-yellow-700',
  geral:            'bg-slate-100 text-slate-600',
}

const STATUS_STYLES = {
  rascunho:    'bg-gray-100 text-gray-500',
  aprovada:    'bg-green-50 text-green-600',
  em_execucao: 'bg-blue-50 text-blue-600',
  encerrada:   'bg-slate-100 text-slate-500',
}

const STATUS_LABEL = {
  rascunho:    'Rascunho',
  aprovada:    'Aprovada',
  em_execucao: 'Em Execução',
  encerrada:   'Encerrada',
}

const PER_PAGE = 20

export default function PermissoesPage() {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filtro, setFiltro]     = useState('todos')
  const [page, setPage]         = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [printTarget, setPrintTarget] = useState(null)

  function load() {
    setLoading(true)
    supabase
      .from('permissao_trabalho')
      .select('*, funcionario:solicitante_id(nome_completo)')
      .order('data_inicio', { ascending: false })
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  function imprimirPt(row) {
    setPrintTarget(row)
    setTimeout(() => {
      window.print()
      setPrintTarget(null)
    }, 100)
  }

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || r.atividade?.toLowerCase().includes(q)
      || r.local?.toLowerCase().includes(q)
      || r.responsavel_sst?.toLowerCase().includes(q)
    const matchFiltro = filtro === 'todos' || r.status === filtro
    return matchSearch && matchFiltro
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <Topbar
        breadcrumb="Segurança"
        title={<><i className="fa-solid fa-clipboard-check text-metro-primary mr-2" />Permissões de Trabalho</>}
        actions={
          <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Nova PT / APR</Button>
        }
      />

      <div className="p-6">
        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por atividade, local ou responsável..." />
          <div className="flex gap-2 flex-wrap">
            {['todos', 'rascunho', 'aprovada', 'em_execucao', 'encerrada'].map((s) => (
              <FilterChip key={s} active={filtro === s} onClick={() => { setFiltro(s); setPage(1) }}>
                {s === 'todos' ? 'Todas' : STATUS_LABEL[s]}
              </FilterChip>
            ))}
          </div>
        </FilterBar>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <span className="text-[13px] font-bold text-metro-navy">
                Permissões de Trabalho
                <span className="text-metro-muted font-normal ml-2 text-xs">— {filtered.length} registros</span>
              </span>
            </div>

            {loading ? (
              <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p>
            ) : (
              <>
                <DataTable
                  headers={['Tipo', 'Atividade', 'Local', 'Início', 'Responsável SST', 'Status', '']}
                  empty="Nenhuma permissão emitida."
                >
                  {paginated.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <Td>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${TIPO_STYLES[r.tipo] ?? 'bg-slate-100 text-slate-600'}`}>
                          {TIPO_LABEL[r.tipo] ?? r.tipo}
                        </span>
                      </Td>
                      <Td className="max-w-[200px]">
                        <p className="font-semibold text-metro-text text-[13px] leading-tight truncate">{r.atividade}</p>
                      </Td>
                      <Td className="text-[12px] text-metro-muted max-w-[140px] truncate">{r.local || '—'}</Td>
                      <Td className="text-[12px] text-metro-muted whitespace-nowrap">
                        {r.data_inicio ? new Date(r.data_inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </Td>
                      <Td className="text-[12px] text-metro-muted">{r.responsavel_sst || '—'}</Td>
                      <Td>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_LABEL[r.status] ?? r.status}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          <button className="text-metro-muted hover:text-metro-primary transition-colors p-1 bg-transparent border-none cursor-pointer">
                            <i className="fa-solid fa-eye text-xs" />
                          </button>
                          <button
                            onClick={() => imprimirPt(r)}
                            className="text-metro-muted hover:text-metro-primary transition-colors p-1 bg-transparent border-none cursor-pointer"
                            title="Imprimir PT"
                          >
                            <i className="fa-solid fa-print text-xs" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </DataTable>
                <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onPage={setPage} />
              </>
            )}
          </div>

          <SidePanel open={showForm} title="Nova PT / APR" icon="clipboard-check" onClose={() => setShowForm(false)}>
            <PermissaoForm onSaved={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
          </SidePanel>
        </div>
      </div>
      <PermissaoPrint data={printTarget} />
    </div>
  )
}
