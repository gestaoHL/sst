import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Topbar from '../../../components/layout/Topbar'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { DataTable, Th, Td } from '../../../components/ui/Table'
import Pagination from '../../../components/ui/Pagination'
import FilterBar, { SearchInput, FilterChip } from '../../../components/ui/FilterBar'
import SidePanel from '../../../components/ui/SidePanel'
import AsoForm from './AsoForm'

const SITUACAO_LABEL = {
  vencido:  'Vencido',
  vence_30: 'Vence em 30d',
  vence_60: 'Vence em 60d',
  vence_90: 'Vence em 90d',
  ok:       'Regular',
  sem_aso:  'Sem ASO',
}

const PER_PAGE = 20

export default function AsoPage() {
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filtro, setFiltro]       = useState('todos')
  const [page, setPage]           = useState(1)
  const [showForm, setShowForm]   = useState(false)

  function load() {
    setLoading(true)
    supabase
      .from('vw_vencimentos')
      .select('*')
      .order('dias_para_vencer', { ascending: true })
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.nome_completo?.toLowerCase().includes(q) || r.matricula?.includes(q)
    const matchFiltro = filtro === 'todos' || r.situacao === filtro
    return matchSearch && matchFiltro
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleSaved() {
    setShowForm(false)
    load()
  }

  return (
    <div>
      <Topbar
        breadcrumb="Saúde Ocupacional"
        title={<><i className="fa-solid fa-file-medical text-metro-primary mr-2" />ASO · Exames Médicos</>}
        actions={
          <>
            <Button variant="outline" size="sm" icon="file-export">Exportar</Button>
            <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Novo ASO</Button>
          </>
        }
      />

      <div className="p-6">
        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por nome ou matrícula..." />
          <div className="flex gap-2">
            {['todos', 'vencido', 'vence_30', 'sem_aso'].map((s) => (
              <FilterChip key={s} active={filtro === s} onClick={() => { setFiltro(s); setPage(1) }}>
                {s === 'todos' ? 'Todos' : s === 'vencido' ? 'Vencidos' : s === 'vence_30' ? '30 dias' : 'Sem ASO'}
              </FilterChip>
            ))}
          </div>
        </FilterBar>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <span className="text-[13px] font-bold text-metro-navy">
                Exames Médicos Ocupacionais
                <span className="text-metro-muted font-normal ml-2 text-xs">— {filtered.length} registros</span>
              </span>
            </div>

            {loading ? (
              <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p>
            ) : (
              <>
                <DataTable
                  headers={['Funcionário', 'Tipo', 'Realizado em', 'Próximo Exame', 'Situação', '']}
                  empty="Nenhum exame encontrado."
                >
                  {paginated.map((r) => (
                    <tr key={r.funcionario_id} className="hover:bg-slate-50/60 transition-colors">
                      <Td>
                        <p className="font-semibold text-metro-text leading-tight">{r.nome_completo}</p>
                        <p className="text-[11px] text-metro-muted mt-0.5">{r.funcao}</p>
                      </Td>
                      <Td>
                        <span className="bg-slate-100 text-metro-primary text-[10px] font-semibold px-2 py-0.5 rounded">
                          Periódico
                        </span>
                      </Td>
                      <Td className="text-metro-muted">—</Td>
                      <Td className={r.situacao === 'vencido' ? 'text-red-600 font-semibold' : r.situacao === 'vence_30' ? 'text-orange-500 font-semibold' : ''}>
                        {r.data_proximo ?? '—'}
                      </Td>
                      <Td>
                        <Badge status={r.situacao}>{SITUACAO_LABEL[r.situacao] ?? r.situacao}</Badge>
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

          <SidePanel
            open={showForm}
            title="Registrar ASO"
            icon="plus"
            onClose={() => setShowForm(false)}
          >
            <AsoForm onSaved={handleSaved} onCancel={() => setShowForm(false)} />
          </SidePanel>
        </div>
      </div>
    </div>
  )
}
