import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Topbar from '../../../components/layout/Topbar'
import Button from '../../../components/ui/Button'
import { DataTable, Td } from '../../../components/ui/Table'
import Pagination from '../../../components/ui/Pagination'
import FilterBar, { SearchInput, FilterChip } from '../../../components/ui/FilterBar'
import SidePanel from '../../../components/ui/SidePanel'
import AcidenteForm from './AcidenteForm'

const STATUS_STYLES = {
  registrado:   'bg-blue-50 text-blue-600',
  investigando: 'bg-orange-50 text-orange-600',
  concluido:    'bg-green-50 text-green-600',
}

const STATUS_LABEL = {
  registrado:   'Registrado',
  investigando: 'Investigando',
  concluido:    'Concluído',
}

const TIPO_LABEL = {
  tipico:             'Típico',
  trajeto:            'Trajeto',
  quase_acidente:     'Quase-Acidente',
  doenca_ocupacional: 'Doença Ocup.',
}

const PER_PAGE = 20

export default function AcidentesPage() {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filtro, setFiltro]     = useState('todos')
  const [page, setPage]         = useState(1)
  const [showForm, setShowForm] = useState(false)

  function load() {
    setLoading(true)
    supabase
      .from('acidente')
      .select('*, funcionario(nome_completo, matricula)')
      .order('data_hora', { ascending: false })
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.descricao?.toLowerCase().includes(q) || r.funcionario?.nome_completo?.toLowerCase().includes(q)
    const matchFiltro = filtro === 'todos' || r.status === filtro
    return matchSearch && matchFiltro
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <Topbar
        breadcrumb="Segurança"
        title={<><i className="fa-solid fa-triangle-exclamation text-metro-primary mr-2" />Acidentes e CAT</>}
        actions={
          <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Nova Ocorrência</Button>
        }
      />

      <div className="p-6">
        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por descrição ou funcionário..." />
          <div className="flex gap-2">
            {['todos', 'registrado', 'investigando', 'concluido'].map((s) => (
              <FilterChip key={s} active={filtro === s} onClick={() => { setFiltro(s); setPage(1) }}>
                {s === 'todos' ? 'Todos' : STATUS_LABEL[s]}
              </FilterChip>
            ))}
          </div>
        </FilterBar>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <span className="text-[13px] font-bold text-metro-navy">
                Ocorrências
                <span className="text-metro-muted font-normal ml-2 text-xs">— {filtered.length} registros</span>
              </span>
            </div>

            {loading ? (
              <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p>
            ) : (
              <>
                <DataTable
                  headers={['Data / Hora', 'Tipo', 'Funcionário', 'Local', 'Status', '']}
                  empty="Nenhuma ocorrência registrada."
                >
                  {paginated.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <Td className="text-[12px] text-metro-muted whitespace-nowrap">
                        {r.data_hora ? new Date(r.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </Td>
                      <Td>
                        <span className="bg-slate-100 text-metro-primary text-[10px] font-semibold px-2 py-0.5 rounded">
                          {TIPO_LABEL[r.tipo] ?? r.tipo}
                        </span>
                      </Td>
                      <Td>
                        <p className="font-semibold text-metro-text text-[13px] leading-tight">
                          {r.funcionario?.nome_completo ?? <span className="text-metro-muted italic">Não vinculado</span>}
                        </p>
                      </Td>
                      <Td className="text-[12px] text-metro-muted max-w-[180px] truncate">{r.local_descricao || '—'}</Td>
                      <Td>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_LABEL[r.status] ?? r.status}
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

          <SidePanel open={showForm} title="Registrar Ocorrência" icon="triangle-exclamation" onClose={() => setShowForm(false)}>
            <AcidenteForm onSaved={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
          </SidePanel>
        </div>
      </div>
    </div>
  )
}
