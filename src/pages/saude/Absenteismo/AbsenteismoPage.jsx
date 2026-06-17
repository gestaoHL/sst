import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Topbar from '../../../components/layout/Topbar'
import Button from '../../../components/ui/Button'
import { DataTable, Td } from '../../../components/ui/Table'
import Pagination from '../../../components/ui/Pagination'
import FilterBar, { SearchInput, FilterChip } from '../../../components/ui/FilterBar'
import SidePanel from '../../../components/ui/SidePanel'
import AfastamentoForm from './AfastamentoForm'

const TIPO_LABEL = {
  doenca:            'Doença',
  acidente_trabalho: 'Acid. Trabalho',
  acidente_trajeto:  'Acid. Trajeto',
  licenca:           'Licença',
  outros:            'Outros',
}

const TIPO_STYLES = {
  doenca:            'bg-blue-50 text-blue-600',
  acidente_trabalho: 'bg-red-50 text-red-600',
  acidente_trajeto:  'bg-orange-50 text-orange-600',
  licenca:           'bg-purple-50 text-purple-600',
  outros:            'bg-gray-100 text-gray-600',
}

const PER_PAGE = 20

export default function AbsenteismoPage() {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filtro, setFiltro]     = useState('todos')
  const [page, setPage]         = useState(1)
  const [showForm, setShowForm] = useState(false)

  function load() {
    setLoading(true)
    supabase
      .from('afastamento')
      .select('*, funcionario(nome_completo, matricula, funcao)')
      .order('data_inicio', { ascending: false })
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || r.funcionario?.nome_completo?.toLowerCase().includes(q)
      || r.cid10?.toLowerCase().includes(q)
    const matchFiltro = filtro === 'todos' || r.tipo === filtro
    return matchSearch && matchFiltro
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalDias = filtered.reduce((acc, r) => acc + (r.dias_afastados ?? 0), 0)

  return (
    <div>
      <Topbar
        breadcrumb="Saúde Ocupacional"
        title={<><i className="fa-solid fa-calendar-xmark text-metro-primary mr-2" />Absenteísmo</>}
        actions={
          <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Registrar Afastamento</Button>
        }
      />

      <div className="p-6">
        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por funcionário ou CID..." />
          <div className="flex gap-2 flex-wrap">
            <FilterChip active={filtro === 'todos'} onClick={() => { setFiltro('todos'); setPage(1) }}>Todos</FilterChip>
            {Object.entries(TIPO_LABEL).map(([k, v]) => (
              <FilterChip key={k} active={filtro === k} onClick={() => { setFiltro(k); setPage(1) }}>{v}</FilterChip>
            ))}
          </div>
        </FilterBar>

        {filtered.length > 0 && (
          <div className="mb-4 flex gap-4">
            <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 flex items-center gap-3">
              <i className="fa-solid fa-calendar-days text-metro-primary" />
              <div>
                <p className="text-[11px] text-metro-muted uppercase tracking-wide font-semibold">Total de Dias</p>
                <p className="text-xl font-bold text-metro-navy">{totalDias}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 flex items-center gap-3">
              <i className="fa-solid fa-users text-metro-primary" />
              <div>
                <p className="text-[11px] text-metro-muted uppercase tracking-wide font-semibold">Afastamentos</p>
                <p className="text-xl font-bold text-metro-navy">{filtered.length}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <span className="text-[13px] font-bold text-metro-navy">
                Afastamentos
                <span className="text-metro-muted font-normal ml-2 text-xs">— {filtered.length} registros</span>
              </span>
            </div>

            {loading ? (
              <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p>
            ) : (
              <>
                <DataTable
                  headers={['Funcionário', 'Tipo', 'CID-10', 'Início', 'Retorno', 'Dias', '']}
                  empty="Nenhum afastamento registrado."
                >
                  {paginated.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <Td>
                        <p className="font-semibold text-metro-text text-[13px] leading-tight">{r.funcionario?.nome_completo}</p>
                        <p className="text-[11px] text-metro-muted">{r.funcionario?.funcao}</p>
                      </Td>
                      <Td>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${TIPO_STYLES[r.tipo] ?? 'bg-gray-100 text-gray-500'}`}>
                          {TIPO_LABEL[r.tipo] ?? r.tipo}
                        </span>
                      </Td>
                      <Td className="text-[12px] text-metro-muted font-mono">{r.cid10 || '—'}</Td>
                      <Td className="text-[12px] text-metro-muted">
                        {r.data_inicio ? new Date(r.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                      </Td>
                      <Td className="text-[12px] text-metro-muted">
                        {r.data_fim ? new Date(r.data_fim + 'T00:00:00').toLocaleDateString('pt-BR') : <span className="text-orange-500 font-semibold">Em curso</span>}
                      </Td>
                      <Td className="text-[13px] font-semibold text-metro-navy">{r.dias_afastados ?? '—'}</Td>
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

          <SidePanel open={showForm} title="Registrar Afastamento" icon="calendar-xmark" onClose={() => setShowForm(false)}>
            <AfastamentoForm onSaved={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
          </SidePanel>
        </div>
      </div>
    </div>
  )
}
