import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { exportCsv } from '../../lib/exportCsv'
import Topbar from '../../components/layout/Topbar'
import Button from '../../components/ui/Button'
import { DataTable, Td } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import FilterBar, { SearchInput } from '../../components/ui/FilterBar'
import SidePanel from '../../components/ui/SidePanel'
import EpiForm from './EpiForm'
import EpiEntregaPanel from './EpiEntregaPanel'

const PER_PAGE = 20

function caStatus(validade) {
  if (!validade) return { label: 'Sem CA', cls: 'bg-gray-100 text-gray-500' }
  const diff = Math.floor((new Date(validade) - new Date()) / 86400000)
  if (diff < 0)   return { label: 'CA Vencido',      cls: 'bg-red-50 text-red-600' }
  if (diff <= 90) return { label: `Vence em ${diff}d`, cls: 'bg-orange-50 text-orange-600' }
  return { label: 'CA Válido', cls: 'bg-green-50 text-green-600' }
}

export default function EpiPage() {
  const [rows, setRows]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [showForm, setShowForm]     = useState(false)
  const [entregaFor, setEntregaFor] = useState(null)

  function load() {
    setLoading(true)
    supabase
      .from('epi_item')
      .select('*')
      .order('nome')
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    return !q || r.nome?.toLowerCase().includes(q) || r.ca?.includes(q)
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <Topbar
        breadcrumb="Gestão"
        title={<><i className="fa-solid fa-helmet-safety text-metro-primary mr-2" />Gestão de EPIs</>}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon="file-csv" onClick={() => exportCsv(filtered, 'epis.csv')}>Exportar CSV</Button>
            <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Novo EPI</Button>
          </div>
        }
      />

      <div className="p-6">
        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por nome ou CA..." />
        </FilterBar>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <span className="text-[13px] font-bold text-metro-navy">
                Itens de EPI
                <span className="text-metro-muted font-normal ml-2 text-xs">— {filtered.length} itens</span>
              </span>
            </div>

            {loading ? (
              <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p>
            ) : (
              <>
                <DataTable
                  headers={['EPI', 'Nº CA', 'Fabricante', 'Validade CA', 'Tipo Risco', 'Estoque', '']}
                  empty="Nenhum EPI cadastrado."
                >
                  {paginated.map((r) => {
                    const ca = caStatus(r.validade_ca)
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                        <Td>
                          <p className="font-semibold text-metro-text text-[13px]">{r.nome}</p>
                        </Td>
                        <Td className="text-metro-muted text-[12px]">{r.ca || '—'}</Td>
                        <Td className="text-metro-muted text-[12px]">{r.fabricante || '—'}</Td>
                        <Td>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${ca.cls}`}>{ca.label}</span>
                        </Td>
                        <Td className="text-[12px] text-metro-muted capitalize">{r.tipo_risco || '—'}</Td>
                        <Td className="text-[13px] font-semibold text-metro-navy">{r.estoque ?? 0}</Td>
                        <Td>
                          <button
                            onClick={() => setEntregaFor(r.id)}
                            className="text-metro-muted hover:text-metro-primary transition-colors p-1 bg-transparent border-none cursor-pointer"
                            title="Registrar entrega"
                          >
                            <i className="fa-solid fa-box text-xs" />
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

          {showForm && (
            <SidePanel open={showForm} title="Cadastrar EPI" icon="helmet-safety" onClose={() => setShowForm(false)}>
              <EpiForm onSaved={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
            </SidePanel>
          )}

          {entregaFor && !showForm && (
            <SidePanel open={!!entregaFor} title="Ficha de Entrega" icon="box" onClose={() => setEntregaFor(null)}>
              <EpiEntregaPanel funcionarioId={entregaFor} onSaved={() => {}} />
            </SidePanel>
          )}
        </div>
      </div>
    </div>
  )
}
