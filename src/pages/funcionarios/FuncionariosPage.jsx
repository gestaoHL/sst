import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Topbar from '../../components/layout/Topbar'
import Badge from '../../components/ui/Badge'
import { DataTable, Td } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import FilterBar, { SearchInput, FilterChip } from '../../components/ui/FilterBar'

const SITUACAO_LABEL = {
  vencido:  'Vencido',
  vence_30: 'Vence em 30d',
  vence_60: 'Vence em 60d',
  vence_90: 'Vence em 90d',
  ok:       'Regular',
  sem_aso:  'Sem ASO',
}

const PER_PAGE = 20

export default function FuncionariosPage() {
  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [page, setPage]     = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    supabase
      .from('vw_situacao_funcionario')
      .select('*')
      .order('nome_completo')
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }, [])

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || r.nome_completo?.toLowerCase().includes(q)
      || r.matricula?.toLowerCase().includes(q)
    const matchFiltro = filtro === 'todos' || r.situacao === filtro
    return matchSearch && matchFiltro
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <Topbar
        breadcrumb="Cadastros"
        title={<><i className="fa-solid fa-users text-metro-primary mr-2" />Funcionários</>}
      />
      <div className="p-6">
        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por nome ou matrícula..." />
          <div className="flex gap-2 flex-wrap">
            {['todos', 'sem_aso', 'vencido', 'vence_30', 'ok'].map((s) => (
              <FilterChip key={s} active={filtro === s} onClick={() => { setFiltro(s); setPage(1) }}>
                {s === 'todos' ? 'Todos' : SITUACAO_LABEL[s]}
              </FilterChip>
            ))}
          </div>
        </FilterBar>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <span className="text-[13px] font-bold text-metro-navy">
              Funcionários
              <span className="text-metro-muted font-normal ml-2 text-xs">— {filtered.length} registros</span>
            </span>
          </div>

          {loading ? (
            <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p>
          ) : (
            <>
              <DataTable
                headers={['Matrícula', 'Nome', 'Função', 'Setor', 'Último ASO', 'Situação', '']}
                empty="Nenhum funcionário cadastrado."
              >
                {paginated.map((r) => (
                  <tr key={r.funcionario_id} className="hover:bg-slate-50/60 transition-colors">
                    <Td className="text-[12px] text-metro-muted font-mono">{r.matricula}</Td>
                    <Td>
                      <p className="font-semibold text-metro-text text-[13px]">{r.nome_completo}</p>
                    </Td>
                    <Td className="text-[12px] text-metro-muted">{r.funcao || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">{r.setor || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">
                      {r.ultimo_aso ? new Date(r.ultimo_aso + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                    </Td>
                    <Td>
                      <Badge status={r.situacao}>{SITUACAO_LABEL[r.situacao] ?? r.situacao}</Badge>
                    </Td>
                    <Td>
                      <button
                        onClick={() => navigate(`/funcionarios/${r.funcionario_id}`)}
                        className="text-metro-muted hover:text-metro-primary transition-colors p-1 bg-transparent border-none cursor-pointer"
                        title="Ver prontuário"
                      >
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
      </div>
    </div>
  )
}
