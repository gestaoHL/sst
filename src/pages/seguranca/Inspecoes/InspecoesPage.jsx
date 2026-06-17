import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Topbar from '../../../components/layout/Topbar'
import Button from '../../../components/ui/Button'
import { DataTable, Td } from '../../../components/ui/Table'
import Pagination from '../../../components/ui/Pagination'
import FilterBar, { SearchInput, FilterChip } from '../../../components/ui/FilterBar'
import SidePanel from '../../../components/ui/SidePanel'
import InspecaoForm from './InspecaoForm'

const TIPO_LABEL = {
  rotineira:    'Rotineira',
  especial:     'Especial',
  pos_acidente: 'Pós-Acidente',
}

const AREA_LABEL = {
  estacao:    'Estação',
  oficina:    'Oficina',
  cco:        'CCO',
  via:        'Via Permanente',
  deposito:   'Depósito',
  escritorio: 'Escritório',
}

const STATUS_STYLES = {
  aberta:       'bg-blue-50 text-blue-600',
  em_andamento: 'bg-orange-50 text-orange-600',
  concluida:    'bg-green-50 text-green-600',
}

const PER_PAGE = 20

export default function InspecoesPage() {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filtro, setFiltro]     = useState('todos')
  const [page, setPage]         = useState(1)
  const [showForm, setShowForm] = useState(false)

  function load() {
    setLoading(true)
    supabase
      .from('inspecao')
      .select('*')
      .order('data_inspecao', { ascending: false })
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || r.responsavel_tecnico?.toLowerCase().includes(q)
      || r.descricao_area?.toLowerCase().includes(q)
    const matchFiltro = filtro === 'todos' || r.status === filtro
    return matchSearch && matchFiltro
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <Topbar
        breadcrumb="Segurança"
        title={<><i className="fa-solid fa-magnifying-glass text-metro-primary mr-2" />Inspeções de Segurança</>}
        actions={
          <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Nova Inspeção</Button>
        }
      />

      <div className="p-6">
        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por responsável ou área..." />
          <div className="flex gap-2">
            {['todos', 'aberta', 'em_andamento', 'concluida'].map((s) => (
              <FilterChip key={s} active={filtro === s} onClick={() => { setFiltro(s); setPage(1) }}>
                {s === 'todos' ? 'Todas' : s === 'aberta' ? 'Abertas' : s === 'em_andamento' ? 'Em andamento' : 'Concluídas'}
              </FilterChip>
            ))}
          </div>
        </FilterBar>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <span className="text-[13px] font-bold text-metro-navy">
                Inspeções
                <span className="text-metro-muted font-normal ml-2 text-xs">— {filtered.length} registros</span>
              </span>
            </div>

            {loading ? (
              <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p>
            ) : (
              <>
                <DataTable
                  headers={['Data', 'Tipo', 'Área', 'Local', 'Responsável', 'Status', '']}
                  empty="Nenhuma inspeção registrada."
                >
                  {paginated.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <Td className="text-[12px] text-metro-muted whitespace-nowrap">
                        {r.data_inspecao ? new Date(r.data_inspecao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                      </Td>
                      <Td>
                        <span className="bg-slate-100 text-metro-primary text-[10px] font-semibold px-2 py-0.5 rounded">
                          {TIPO_LABEL[r.tipo] ?? r.tipo}
                        </span>
                      </Td>
                      <Td className="text-[12px] text-metro-muted">{AREA_LABEL[r.area] ?? r.area}</Td>
                      <Td className="text-[12px] text-metro-muted max-w-[160px] truncate">{r.descricao_area || '—'}</Td>
                      <Td className="text-[13px] text-metro-text">{r.responsavel_tecnico || '—'}</Td>
                      <Td>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {r.status === 'aberta' ? 'Aberta' : r.status === 'em_andamento' ? 'Em Andamento' : 'Concluída'}
                        </span>
                      </Td>
                      <Td>
                        <button className="text-metro-muted hover:text-metro-primary transition-colors p-1 bg-transparent border-none cursor-pointer">
                          <i className="fa-solid fa-eye text-xs" />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </DataTable>
                <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onPage={setPage} />
              </>
            )}
          </div>

          <SidePanel open={showForm} title="Nova Inspeção" icon="magnifying-glass" onClose={() => setShowForm(false)}>
            <InspecaoForm onSaved={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
          </SidePanel>
        </div>
      </div>
    </div>
  )
}
