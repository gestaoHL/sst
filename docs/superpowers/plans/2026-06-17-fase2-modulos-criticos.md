# SST Metro-DF — Fase 2: Módulos Críticos

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar os 3 módulos operacionais mais críticos do SST (Acidentes/CAT, EPIs, Treinamentos) e atualizar o Dashboard com os novos KPIs.

**Architecture:** Cada módulo segue o mesmo padrão da Fase 1: Topbar + FilterBar + DataTable + SidePanel com formulário. Todos os componentes UI já estão prontos. As tabelas do Supabase precisam ser criadas pelo usuário antes de conectar os dados reais — os formulários salvam via `supabase.from(...).insert()`.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, React Router v6, Supabase JS v2, Font Awesome 6 (CDN), todos já instalados.

---

## Mapa de Arquivos

### Criar
| Arquivo | Responsabilidade |
|---|---|
| `src/pages/seguranca/Acidentes/AcidentesPage.jsx` | Lista de ocorrências com filtros e badges de status |
| `src/pages/seguranca/Acidentes/AcidenteForm.jsx` | Formulário de registro de acidente no SidePanel |
| `src/pages/epi/EpiPage.jsx` | Lista de itens de EPI com controle de CA |
| `src/pages/epi/EpiForm.jsx` | Formulário de cadastro de EPI |
| `src/pages/epi/EpiEntregaPanel.jsx` | Painel de ficha de EPI por funcionário |
| `src/pages/treinamentos/TreinamentosPage.jsx` | Lista de treinamentos com controle de validade |
| `src/pages/treinamentos/TreinamentoForm.jsx` | Formulário de cadastro de treinamento |

### Modificar
| Arquivo | O que muda |
|---|---|
| `src/pages/Dashboard/Dashboard.jsx` | Adicionar KPIs de EPIs com CA vencido e acidentes no mês |
| `src/router.jsx` | Substituir stubs de /seguranca/acidentes, /epi, /treinamentos pelos componentes reais |

---

## Task 1: Módulo Acidentes e CAT

**Files:**
- Create: `src/pages/seguranca/Acidentes/AcidentesPage.jsx`
- Create: `src/pages/seguranca/Acidentes/AcidenteForm.jsx`
- Modify: `src/router.jsx`

- [ ] **Step 1: Criar `src/pages/seguranca/Acidentes/AcidenteForm.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Input, Select, Textarea } from '../../../components/ui/FormControl'
import Button from '../../../components/ui/Button'

const TIPOS = [
  { value: 'tipico',             label: 'Acidente Típico' },
  { value: 'trajeto',            label: 'Acidente de Trajeto' },
  { value: 'quase_acidente',     label: 'Quase-Acidente' },
  { value: 'doenca_ocupacional', label: 'Doença Ocupacional' },
]

const STATUS_LIST = [
  { value: 'registrado',   label: 'Registrado' },
  { value: 'investigando', label: 'Investigando' },
  { value: 'concluido',    label: 'Concluído' },
]

export default function AcidenteForm({ onSaved, onCancel }) {
  const [funcionarios, setFuncionarios] = useState([])
  const [form, setForm] = useState({
    tipo: 'tipico',
    data_hora: new Date().toISOString().slice(0, 16),
    local_descricao: '',
    funcionario_id: '',
    descricao: '',
    partes_corpo: '',
    status: 'registrado',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    supabase
      .from('funcionario')
      .select('id, matricula, nome_completo')
      .order('nome_completo')
      .then(({ data }) => setFuncionarios(data ?? []))
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.descricao) { setErro('Informe a descrição da ocorrência.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('acidente').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo de Ocorrência" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
        <Input label="Data / Hora" type="datetime-local" value={form.data_hora} onChange={(e) => set('data_hora', e.target.value)} />
      </div>

      <Select label="Funcionário Envolvido" value={form.funcionario_id} onChange={(e) => set('funcionario_id', e.target.value)}>
        <option value="">— selecione (opcional) —</option>
        {funcionarios.map((f) => (
          <option key={f.id} value={f.id}>{f.matricula} · {f.nome_completo}</option>
        ))}
      </Select>

      <Input label="Local / Setor" value={form.local_descricao} onChange={(e) => set('local_descricao', e.target.value)} placeholder="Ex: Estação Central — Plataforma 2" />

      <Textarea label="Descrição da Ocorrência" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Descreva o que aconteceu..." rows={4} />

      <Input label="Partes do Corpo Atingidas" value={form.partes_corpo} onChange={(e) => set('partes_corpo', e.target.value)} placeholder="Ex: Mão direita, joelho esquerdo" />

      <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
        {STATUS_LIST.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </Select>

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="triangle-exclamation" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Registrar'}
        </Button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Criar `src/pages/seguranca/Acidentes/AcidentesPage.jsx`**

```jsx
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
```

- [ ] **Step 3: Atualizar `src/router.jsx` — substituir stub de acidentes**

No router.jsx, localizar:
```jsx
{ path: 'seguranca/acidentes', element: <ComingSoon modulo="Acidentes / CAT" /> },
```

Substituir por:
```jsx
{ path: 'seguranca/acidentes', element: <AcidentesPage /> },
```

E adicionar o import no topo do arquivo (após os imports existentes):
```jsx
import AcidentesPage from './pages/seguranca/Acidentes/AcidentesPage'
```

- [ ] **Step 4: Rodar testes**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/seguranca/Acidentes/AcidentesPage.jsx src/pages/seguranca/Acidentes/AcidenteForm.jsx src/router.jsx
git commit -m "feat: módulo Acidentes e CAT com lista, filtros e formulário"
```

---

## Task 2: Módulo Gestão de EPIs

**Files:**
- Create: `src/pages/epi/EpiPage.jsx`
- Create: `src/pages/epi/EpiForm.jsx`
- Create: `src/pages/epi/EpiEntregaPanel.jsx`
- Modify: `src/router.jsx`

- [ ] **Step 1: Criar `src/pages/epi/EpiForm.jsx`**

```jsx
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Input, Select } from '../../components/ui/FormControl'
import Button from '../../components/ui/Button'

const TIPOS_RISCO = [
  { value: 'fisico',   label: 'Físico' },
  { value: 'quimico',  label: 'Químico' },
  { value: 'biologico',label: 'Biológico' },
  { value: 'ergonomico',label:'Ergonômico' },
  { value: 'acidente', label: 'Acidente' },
]

export default function EpiForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    nome: '',
    ca: '',
    fabricante: '',
    validade_ca: '',
    tipo_risco: 'fisico',
    estoque: 0,
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.nome || !form.ca) { setErro('Nome e CA são obrigatórios.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('epi_item').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <Input label="Nome do EPI" value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Ex: Capacete de Segurança" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Nº CA (Certificado de Aprovação)" value={form.ca} onChange={(e) => set('ca', e.target.value)} placeholder="Ex: 12345" />
        <Input label="Validade do CA" type="date" value={form.validade_ca} onChange={(e) => set('validade_ca', e.target.value)} />
      </div>

      <Input label="Fabricante" value={form.fabricante} onChange={(e) => set('fabricante', e.target.value)} placeholder="Ex: 3M do Brasil" />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo de Risco" value={form.tipo_risco} onChange={(e) => set('tipo_risco', e.target.value)}>
          {TIPOS_RISCO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
        <Input label="Estoque Inicial" type="number" value={form.estoque} onChange={(e) => set('estoque', parseInt(e.target.value) || 0)} min="0" />
      </div>

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="helmet-safety" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Cadastrar EPI'}
        </Button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Criar `src/pages/epi/EpiEntregaPanel.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Select, Input } from '../../components/ui/FormControl'
import Button from '../../components/ui/Button'

export default function EpiEntregaPanel({ funcionarioId, onSaved }) {
  const [epis, setEpis] = useState([])
  const [form, setForm] = useState({ epi_item_id: '', quantidade: 1, data_entrega: new Date().toISOString().slice(0, 10) })
  const [entregas, setEntregas] = useState([])
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    supabase.from('epi_item').select('id, nome, ca').order('nome').then(({ data }) => setEpis(data ?? []))
    if (funcionarioId) {
      supabase
        .from('epi_entrega')
        .select('*, epi_item(nome, ca)')
        .eq('funcionario_id', funcionarioId)
        .order('data_entrega', { ascending: false })
        .then(({ data }) => setEntregas(data ?? []))
    }
  }, [funcionarioId])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function registrar() {
    if (!form.epi_item_id) { setErro('Selecione o EPI.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('epi_entrega').insert({ ...form, funcionario_id: funcionarioId })
    setSaving(false)
    if (error) setErro('Erro ao registrar: ' + error.message)
    else {
      const { data } = await supabase.from('epi_entrega').select('*, epi_item(nome, ca)').eq('funcionario_id', funcionarioId).order('data_entrega', { ascending: false })
      setEntregas(data ?? [])
      setForm((f) => ({ ...f, epi_item_id: '', quantidade: 1 }))
      if (onSaved) onSaved()
    }
  }

  return (
    <div>
      <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-gray-100">
        <p className="text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-3">Registrar Entrega</p>
        <Select label="EPI" value={form.epi_item_id} onChange={(e) => set('epi_item_id', e.target.value)}>
          <option value="">— selecione —</option>
          {epis.map((e) => <option key={e.id} value={e.id}>{e.nome} (CA {e.ca})</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Quantidade" type="number" value={form.quantidade} onChange={(e) => set('quantidade', parseInt(e.target.value) || 1)} min="1" />
          <Input label="Data de Entrega" type="date" value={form.data_entrega} onChange={(e) => set('data_entrega', e.target.value)} />
        </div>
        {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-2">{erro}</p>}
        <Button size="sm" icon="box" onClick={registrar} disabled={saving || !funcionarioId}>
          {saving ? 'Registrando...' : 'Registrar Entrega'}
        </Button>
      </div>

      {entregas.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-2">Histórico de Entregas</p>
          {entregas.map((e) => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-[12px] font-semibold text-metro-text">{e.epi_item?.nome}</p>
                <p className="text-[10px] text-metro-muted">CA {e.epi_item?.ca} · Qtd: {e.quantidade}</p>
              </div>
              <p className="text-[11px] text-metro-muted">
                {e.data_entrega ? new Date(e.data_entrega + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Criar `src/pages/epi/EpiPage.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
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
  if (diff < 0)   return { label: 'CA Vencido',  cls: 'bg-red-50 text-red-600' }
  if (diff <= 90) return { label: `Vence em ${diff}d`, cls: 'bg-orange-50 text-orange-600' }
  return { label: 'CA Válido', cls: 'bg-green-50 text-green-600' }
}

export default function EpiPage() {
  const [rows, setRows]               = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [page, setPage]               = useState(1)
  const [showForm, setShowForm]       = useState(false)
  const [entregaFor, setEntregaFor]   = useState(null)

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
          <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Novo EPI</Button>
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
```

- [ ] **Step 4: Atualizar `src/router.jsx` — substituir stub de EPIs**

Adicionar import:
```jsx
import EpiPage from './pages/epi/EpiPage'
```

Substituir:
```jsx
{ path: 'epi', element: <ComingSoon modulo="Gestão de EPIs" /> },
```
Por:
```jsx
{ path: 'epi', element: <EpiPage /> },
```

- [ ] **Step 5: Rodar testes**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/epi/EpiPage.jsx src/pages/epi/EpiForm.jsx src/pages/epi/EpiEntregaPanel.jsx src/router.jsx
git commit -m "feat: módulo Gestão de EPIs com controle de CA e registro de entregas"
```

---

## Task 3: Módulo Treinamentos

**Files:**
- Create: `src/pages/treinamentos/TreinamentosPage.jsx`
- Create: `src/pages/treinamentos/TreinamentoForm.jsx`
- Modify: `src/router.jsx`

- [ ] **Step 1: Criar `src/pages/treinamentos/TreinamentoForm.jsx`**

```jsx
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Input, Select, Textarea } from '../../components/ui/FormControl'
import Button from '../../components/ui/Button'

const NRS = [
  { value: '',      label: '— Não vinculado —' },
  { value: 'NR-6',  label: 'NR-6 — EPI' },
  { value: 'NR-10', label: 'NR-10 — Eletricidade' },
  { value: 'NR-12', label: 'NR-12 — Máquinas e Equipamentos' },
  { value: 'NR-33', label: 'NR-33 — Espaço Confinado' },
  { value: 'NR-35', label: 'NR-35 — Trabalho em Altura' },
  { value: 'NR-1',  label: 'NR-1 — Disposições Gerais (PGR)' },
  { value: 'outro', label: 'Outro' },
]

export default function TreinamentoForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    nome: '',
    nr_vinculada: '',
    carga_horaria: 8,
    validade_meses: 12,
    instrutor: '',
    data_realizacao: new Date().toISOString().slice(0, 10),
    observacoes: '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.nome) { setErro('Informe o nome do treinamento.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('treinamento').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <Input label="Nome do Treinamento" value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Ex: Trabalho em Altura NR-35" />

      <Select label="NR Vinculada" value={form.nr_vinculada} onChange={(e) => set('nr_vinculada', e.target.value)}>
        {NRS.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Carga Horária (h)" type="number" value={form.carga_horaria} onChange={(e) => set('carga_horaria', parseInt(e.target.value) || 0)} min="1" />
        <Input label="Validade (meses)" type="number" value={form.validade_meses} onChange={(e) => set('validade_meses', parseInt(e.target.value) || 0)} min="1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Instrutor" value={form.instrutor} onChange={(e) => set('instrutor', e.target.value)} placeholder="Nome do instrutor" />
        <Input label="Data de Realização" type="date" value={form.data_realizacao} onChange={(e) => set('data_realizacao', e.target.value)} />
      </div>

      <Textarea label="Observações" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Conteúdo, local, observações..." rows={3} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="graduation-cap" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Treinamento'}
        </Button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Criar `src/pages/treinamentos/TreinamentosPage.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
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

  const NRS_CRITICAS = ['NR-6', 'NR-10', 'NR-12', 'NR-33', 'NR-35']

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
          <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Novo Treinamento</Button>
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
```

- [ ] **Step 3: Atualizar `src/router.jsx` — substituir stub de treinamentos**

Adicionar import:
```jsx
import TreinamentosPage from './pages/treinamentos/TreinamentosPage'
```

Substituir:
```jsx
{ path: 'treinamentos', element: <ComingSoon modulo="Treinamentos" /> },
```
Por:
```jsx
{ path: 'treinamentos', element: <TreinamentosPage /> },
```

- [ ] **Step 4: Rodar testes**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/treinamentos/TreinamentosPage.jsx src/pages/treinamentos/TreinamentoForm.jsx src/router.jsx
git commit -m "feat: módulo Treinamentos com controle de NRs e validade"
```

---

## Task 4: Dashboard Fase 2 — Novos KPIs

**Files:**
- Modify: `src/pages/Dashboard/Dashboard.jsx`

- [ ] **Step 1: Atualizar `src/pages/Dashboard/Dashboard.jsx`**

Substituir o conteúdo completo por:

```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Topbar from '../../components/layout/Topbar'
import { Card, KpiCard } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const SITUACAO_LABEL = {
  vencido:  'Vencido',
  vence_30: 'Vence em breve',
  vence_60: 'Vence em 60d',
  vence_90: 'Vence em 90d',
}

export default function Dashboard() {
  const [vencimentos, setVencimentos] = useState([])
  const [kpis, setKpis] = useState({ vencidos: 0, vence30: 0, episCaVencido: 0, acidenstesMes: 0 })

  useEffect(() => {
    supabase
      .from('vw_vencimentos')
      .select('*')
      .in('situacao', ['vencido', 'vence_30', 'vence_60'])
      .order('dias_para_vencer', { ascending: true })
      .limit(5)
      .then(({ data }) => {
        const rows = data ?? []
        setVencimentos(rows)
        setKpis((k) => ({
          ...k,
          vencidos: rows.filter((r) => r.situacao === 'vencido').length,
          vence30:  rows.filter((r) => r.situacao === 'vence_30').length,
        }))
      })

    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
    supabase
      .from('acidente')
      .select('id', { count: 'exact', head: true })
      .gte('data_hora', inicioMes)
      .then(({ count }) => setKpis((k) => ({ ...k, acidenstesMes: count ?? 0 })))

    const hoje90 = new Date()
    hoje90.setDate(hoje90.getDate() + 90)
    supabase
      .from('epi_item')
      .select('id', { count: 'exact', head: true })
      .lt('validade_ca', hoje90.toISOString().slice(0, 10))
      .then(({ count }) => setKpis((k) => ({ ...k, episCaVencido: count ?? 0 })))
  }, [])

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard label="ASOs Vencidos"        value={kpis.vencidos}       sub="Exige ação imediata"    color="red" />
          <KpiCard label="ASOs Vencem em 30d"   value={kpis.vence30}        sub="Agendar exames"         color="amber" />
          <KpiCard label="EPIs com CA Vencendo" value={kpis.episCaVencido}  sub="Próximos 90 dias"       color="amber" />
          <KpiCard label="Acidentes no Mês"     value={kpis.acidenstesMes}  sub="Ocorrências registradas" color={kpis.acidenstesMes > 0 ? 'red' : 'green'} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card
            title="ASOs Críticos"
            icon="clock"
            action={
              <Link to="/saude/aso" className="text-xs text-metro-primary font-semibold hover:underline">
                Ver todos →
              </Link>
            }
          >
            {vencimentos.length === 0 ? (
              <p className="px-5 py-6 text-metro-muted text-sm text-center">
                Nenhum exame crítico nos próximos 60 dias.
              </p>
            ) : (
              vencimentos.map((r) => (
                <div key={r.funcionario_id} className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-metro-primary flex-shrink-0">
                    {r.nome_completo?.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-metro-text truncate">{r.nome_completo}</p>
                    <p className="text-[11px] text-metro-muted">{r.funcao}</p>
                  </div>
                  <Badge status={r.situacao}>{SITUACAO_LABEL[r.situacao] ?? r.situacao}</Badge>
                </div>
              ))
            )}
          </Card>

          <Card
            title="Acesso Rápido"
            icon="bolt"
          >
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { to: '/saude/aso',           icon: 'file-medical',        label: 'ASO / Exames' },
                { to: '/seguranca/acidentes', icon: 'triangle-exclamation', label: 'Acidentes / CAT' },
                { to: '/epi',                 icon: 'helmet-safety',        label: 'Gestão de EPIs' },
                { to: '/treinamentos',        icon: 'graduation-cap',       label: 'Treinamentos' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-100 hover:border-metro-primary hover:bg-metro-bg transition-colors group"
                >
                  <i className={`fa-solid fa-${item.icon} text-metro-primary text-sm w-4 text-center`} />
                  <span className="text-[12px] font-semibold text-metro-text group-hover:text-metro-primary">{item.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rodar testes**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard/Dashboard.jsx
git commit -m "feat: dashboard Fase 2 com KPIs de EPIs, acidentes e acesso rápido"
```

---

## Task 5: Testes finais e build Fase 2

- [ ] **Step 1: Rodar suite completa**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 2: Build de produção**

```bash
npm run build
```

Expected: build sem erros.

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "feat: Fase 2 completa — Acidentes/CAT, EPIs, Treinamentos e Dashboard atualizado"
```

---

## Próximos Passos

**Fase 3** — Permissões de Trabalho (APR/PT), Inspeções de Segurança, Absenteísmo, PCMSO  
**Fase 4** — CIPA, Laudos/PGR, Ficha Completa do Funcionário (prontuário 360°)
