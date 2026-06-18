import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { exportCsv } from '../../lib/exportCsv'
import Topbar from '../../components/layout/Topbar'
import Button from '../../components/ui/Button'
import { DataTable, Td } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import FilterBar, { SearchInput, FilterChip } from '../../components/ui/FilterBar'
import SidePanel from '../../components/ui/SidePanel'
import TreinamentoForm from './TreinamentoForm'

const PER_PAGE = 20

const NR_COLORS = {
  'NR-6':  'bg-blue-50 text-blue-600',
  'NR-10': 'bg-yellow-50 text-yellow-700',
  'NR-12': 'bg-orange-50 text-orange-600',
  'NR-33': 'bg-purple-50 text-purple-600',
  'NR-35': 'bg-red-50 text-red-600',
}

const NRS_CRITICAS = ['NR-6', 'NR-10', 'NR-12', 'NR-33', 'NR-35']

export default function TreinamentosPage() {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filtro, setFiltro]     = useState('todos')
  const [page, setPage]         = useState(1)
  const [showForm, setShowForm] = useState(false)

  function load() {
    setLoading(true)
    supabase
      .from('treinamento')
      .select('*')
      .order('data_realizacao', { ascending: false })
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.nome?.toLowerCase().includes(q) || r.nr_vinculada?.toLowerCase().includes(q)
    const matchFiltro = filtro === 'todos' || r.nr_vinculada === filtro
    return matchSearch && matchFiltro
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <Topbar
        breadcrumb="Gestão"
        title={<><i className="fa-solid fa-graduation-cap text-metro-primary mr-2" />Treinamentos e Capacitações</>}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon="file-csv" onClick={() => exportCsv(filtered, 'treinamentos.csv')}>Exportar CSV</Button>
            <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Novo Treinamento</Button>
          </div>
        }
      />

      <div className="p-6">
        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por nome ou NR..." />
          <div className="flex gap-2 flex-wrap">
            <FilterChip active={filtro === 'todos'} onClick={() => { setFiltro('todos'); setPage(1) }}>Todos</FilterChip>
            {NRS_CRITICAS.map((nr) => (
              <FilterChip key={nr} active={filtro === nr} onClick={() => { setFiltro(nr); setPage(1) }}>{nr}</FilterChip>
            ))}
          </div>
        </FilterBar>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <span className="text-[13px] font-bold text-metro-navy">
                Treinamentos
                <span className="text-metro-muted font-normal ml-2 text-xs">— {filtered.length} registros</span>
              </span>
            </div>

            {loading ? (
              <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p>
            ) : (
              <>
                <DataTable
                  headers={['Treinamento', 'NR', 'Data', 'Carga H.', 'Validade', 'Instrutor', '']}
                  empty="Nenhum treinamento registrado."
                >
                  {paginated.map((r) => {
                    const vencimento = r.data_realizacao && r.validade_meses
                      ? new Date(new Date(r.data_realizacao).setMonth(new Date(r.data_realizacao).getMonth() + r.validade_meses)).toLocaleDateString('pt-BR')
                      : '—'
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                        <Td>
                          <p className="font-semibold text-metro-text text-[13px] leading-tight">{r.nome}</p>
                          {r.observacoes && <p className="text-[11px] text-metro-muted mt-0.5 truncate max-w-[200px]">{r.observacoes}</p>}
                        </Td>
                        <Td>
                          {r.nr_vinculada ? (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${NR_COLORS[r.nr_vinculada] ?? 'bg-slate-100 text-slate-600'}`}>
                              {r.nr_vinculada}
                            </span>
                          ) : <span className="text-metro-muted text-[12px]">—</span>}
                        </Td>
                        <Td className="text-[12px] text-metro-muted">
                          {r.data_realizacao ? new Date(r.data_realizacao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                        </Td>
                        <Td className="text-[12px] text-metro-muted">{r.carga_horaria ? `${r.carga_horaria}h` : '—'}</Td>
                        <Td className="text-[12px] text-metro-muted">{vencimento}</Td>
                        <Td className="text-[12px] text-metro-muted">{r.instrutor || '—'}</Td>
                        <Td>
                          <button className="text-metro-muted hover:text-metro-primary transition-colors p-1 bg-transparent border-none cursor-pointer">
                            <i className="fa-solid fa-eye text-xs" />
                          </button>
                        </Td>
                      </tr>
                    )
                  })}
                </DataTable>
                <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onPage={setPage} />
              </>
            )}
          </div>

          <SidePanel open={showForm} title="Novo Treinamento" icon="graduation-cap" onClose={() => setShowForm(false)}>
            <TreinamentoForm onSaved={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
          </SidePanel>
        </div>
      </div>
    </div>
  )
}
