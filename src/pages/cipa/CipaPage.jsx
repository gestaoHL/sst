import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Topbar from '../../components/layout/Topbar'
import Button from '../../components/ui/Button'
import { DataTable, Td } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import FilterBar, { SearchInput, FilterChip } from '../../components/ui/FilterBar'
import SidePanel from '../../components/ui/SidePanel'
import CipaMembroForm from './CipaMembroForm'

const CARGO_LABEL = {
  presidente:      'Presidente',
  vice_presidente: 'Vice-Presidente',
  secretario:      'Secretário',
  membro:          'Membro',
}

const PER_PAGE = 20

const isAtivo = (data_fim) => !data_fim || new Date(data_fim + 'T00:00:00') >= new Date()

export default function CipaPage() {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filtro, setFiltro]     = useState('todos')
  const [page, setPage]         = useState(1)
  const [showForm, setShowForm] = useState(false)

  function load() {
    setLoading(true)
    supabase
      .from('cipa_membro')
      .select('*, funcionario(nome_completo, matricula)')
      .order('cargo')
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || r.funcionario?.nome_completo?.toLowerCase().includes(q)
      || r.funcionario?.matricula?.toLowerCase().includes(q)
    const matchFiltro = filtro === 'todos' || r.tipo === filtro
    return matchSearch && matchFiltro
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <Topbar
        breadcrumb="Gestão"
        title={<><i className="fa-solid fa-scale-balanced text-metro-primary mr-2" />CIPA</>}
        actions={<Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Adicionar Membro</Button>}
      />

      <div className="p-6">
        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por nome ou matrícula..." />
          <div className="flex gap-2">
            {['todos', 'titular', 'suplente'].map((f) => (
              <FilterChip key={f} active={filtro === f} onClick={() => { setFiltro(f); setPage(1) }}>
                {f === 'todos' ? 'Todos' : f === 'titular' ? 'Titulares' : 'Suplentes'}
              </FilterChip>
            ))}
          </div>
        </FilterBar>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <span className="text-[13px] font-bold text-metro-navy">
                Membros da CIPA
                <span className="text-metro-muted font-normal ml-2 text-xs">— {filtered.length} membros</span>
              </span>
            </div>

            {loading ? (
              <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p>
            ) : (
              <>
                <DataTable
                  headers={['Nome', 'Matrícula', 'Cargo', 'Tipo', 'Representação', 'Início', 'Fim', 'Situação']}
                  empty="Nenhum membro cadastrado."
                >
                  {paginated.map((r) => {
                    const ativo = isAtivo(r.data_fim)
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                        <Td className="font-semibold text-metro-text text-[13px]">{r.funcionario?.nome_completo || '—'}</Td>
                        <Td className="text-[12px] text-metro-muted font-mono">{r.funcionario?.matricula || '—'}</Td>
                        <Td className="text-[12px] text-metro-text">{CARGO_LABEL[r.cargo] ?? r.cargo}</Td>
                        <Td>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${r.tipo === 'titular' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                            {r.tipo === 'titular' ? 'Titular' : 'Suplente'}
                          </span>
                        </Td>
                        <Td className="text-[12px] text-metro-muted">
                          {r.representacao === 'empregados' ? 'Empregados' : 'Empregador'}
                        </Td>
                        <Td className="text-[12px] text-metro-muted">
                          {r.data_inicio ? new Date(r.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                        </Td>
                        <Td className="text-[12px] text-metro-muted">
                          {r.data_fim ? new Date(r.data_fim + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                        </Td>
                        <Td>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ativo ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            {ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </Td>
                      </tr>
                    )
                  })}
                </DataTable>
                <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onPage={setPage} />
              </>
            )}
          </div>

          <SidePanel open={showForm} title="Adicionar Membro CIPA" icon="scale-balanced" onClose={() => setShowForm(false)}>
            <CipaMembroForm onSaved={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
          </SidePanel>
        </div>
      </div>
    </div>
  )
}
