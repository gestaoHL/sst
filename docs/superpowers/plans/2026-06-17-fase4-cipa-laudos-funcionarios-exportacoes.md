# SST Metro-DF — Fase 4: Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar os últimos 3 módulos do MVP (Funcionários/Prontuário 360°, CIPA, Laudos/PGR) e adicionar exportações CSV em listagens e PDF por impressão CSS para Prontuário e PT/APR.

**Architecture:** Mesmo padrão das Fases 1–3: Topbar + FilterBar + DataTable + SidePanel. Impressão via `window.print()` + classes Tailwind `print:hidden` / `hidden print:block`. Nenhuma dependência nova.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, React Router v6, Supabase JS v2, Font Awesome 6 (CDN) — todos já instalados.

## Global Constraints

- Importar componentes UI sempre de `../../../components/ui/` (ajustar profundidade conforme nível do arquivo)
- Supabase client: `import { supabase } from '../../lib/supabase'` (ajustar profundidade)
- Padrão de paginação: constante `PER_PAGE = 20`
- Testes: `npm run test:run` deve passar com 23 testes após cada task
- Build: `npm run build` ao final sem erros

---

## Mapa de Arquivos

### Criar
| Arquivo | Responsabilidade |
|---|---|
| `src/lib/exportCsv.js` | Utilitário de exportação CSV via blob |
| `src/pages/funcionarios/FuncionariosPage.jsx` | Lista de funcionários no design system |
| `src/pages/funcionarios/FuncionarioProntuario.jsx` | Prontuário 360° com 5 abas |
| `src/pages/funcionarios/ProntuarioPrint.jsx` | Layout A4 para impressão |
| `src/pages/cipa/CipaMembroForm.jsx` | Formulário de membro CIPA |
| `src/pages/cipa/CipaPage.jsx` | Lista de membros |
| `src/pages/laudos/LaudoForm.jsx` | Formulário de documento técnico |
| `src/pages/laudos/RiscoForm.jsx` | Formulário de risco por GHE |
| `src/pages/laudos/LaudosPage.jsx` | Container com abas Documentos/Riscos |
| `src/pages/seguranca/Permissoes/PermissaoPrint.jsx` | Layout A4 da PT/APR |

### Modificar
| Arquivo | O que muda |
|---|---|
| `src/router.jsx` | 3 stubs → componentes reais + rota `/funcionarios/:id` |
| `src/components/layout/Sidebar.jsx` | Adicionar `print:hidden` ao `<aside>` |
| `src/components/layout/AppShell.jsx` | Adicionar `print:hidden` à barra gradiente |
| `src/pages/saude/Aso/AsoPage.jsx` | Botão Exportar CSV |
| `src/pages/epi/EpiPage.jsx` | Botão Exportar CSV |
| `src/pages/treinamentos/TreinamentosPage.jsx` | Botão Exportar CSV |
| `src/pages/seguranca/Acidentes/AcidentesPage.jsx` | Botão Exportar CSV |
| `src/pages/saude/Absenteismo/AbsenteismoPage.jsx` | Botão Exportar CSV |
| `src/pages/seguranca/Permissoes/PermissoesPage.jsx` | Botão Imprimir PT por linha + PermissaoPrint |

---

## Task 1: Utilitário exportCsv

**Files:**
- Create: `src/lib/exportCsv.js`

**Interfaces:**
- Produces: `exportCsv(rows: object[], filename: string): void`

- [ ] **Step 1: Criar `src/lib/exportCsv.js`**

```js
function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    const key = prefix ? `${prefix}_${k}` : k
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      return { ...acc, ...flatten(v, key) }
    }
    return { ...acc, [key]: v }
  }, {})
}

export function exportCsv(rows, filename) {
  if (!rows || rows.length === 0) return
  const flat = rows.map((r) => flatten(r))
  const headers = Object.keys(flat[0])
  const escape = (val) => {
    const s = String(val ?? '')
    return s.includes(',') || s.includes('\n') || s.includes('"')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const csv = [headers.join(','), ...flat.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 2: Rodar testes**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/exportCsv.js
git commit -m "feat: utilitário exportCsv para download de listagens"
```

---

## Task 2: Módulo Funcionários — Lista

**Files:**
- Create: `src/pages/funcionarios/FuncionariosPage.jsx`

**Interfaces:**
- Consumes: `vw_situacao_funcionario` (view Supabase com campos: `funcionario_id`, `matricula`, `nome_completo`, `funcao`, `setor`, `ultimo_aso`, `situacao`)
- Produces: navegação para `/funcionarios/:id` via `useNavigate`

- [ ] **Step 1: Criar `src/pages/funcionarios/FuncionariosPage.jsx`**

```jsx
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
```

- [ ] **Step 2: Rodar testes**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/funcionarios/FuncionariosPage.jsx
git commit -m "feat: lista de funcionários com design system e filtros de situação ASO"
```

---

## Task 3: ProntuarioPrint — Layout de Impressão

**Files:**
- Create: `src/pages/funcionarios/ProntuarioPrint.jsx`

**Interfaces:**
- Consumes: `{ func, asos, epis, treinamentos, afastamentos }` — todos arrays/objetos carregados por `FuncionarioProntuario`
- Produces: componente visível apenas via `@media print`

- [ ] **Step 1: Criar `src/pages/funcionarios/ProntuarioPrint.jsx`**

```jsx
function PrintSection({ title, rows, headers, renderRow }) {
  return (
    <div className="mb-5">
      <h3 className="font-bold text-[12px] uppercase tracking-wide border-b border-gray-400 pb-1 mb-2">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-[10px] text-gray-400 italic">Nenhum registro.</p>
      ) : (
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {headers.map((h) => (
                <th key={h} className="text-left px-2 py-1 border border-gray-300 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {renderRow(r).map((cell, j) => (
                  <td key={j} className="px-2 py-1 border border-gray-300">{cell ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function ProntuarioPrint({ func, asos, epis, treinamentos, afastamentos }) {
  if (!func) return null

  const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'

  return (
    <div className="hidden print:block p-8 text-[11px] text-black font-sans">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-5 pb-4 border-b-2 border-black">
        <div>
          <p className="text-[16px] font-bold">METRÔ-DF — Saúde e Segurança do Trabalho</p>
          <p className="text-[13px] font-semibold mt-0.5">Prontuário Individual do Funcionário</p>
        </div>
        <div className="text-right text-[10px] text-gray-500">
          <p>Emitido em: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* Dados cadastrais */}
      <div className="mb-5 p-3 border border-gray-300 rounded">
        <p className="font-bold text-[11px] uppercase tracking-wide mb-2">Dados Cadastrais</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Nome Completo', func.nome_completo],
            ['Matrícula', func.matricula],
            ['Função', func.funcao || '—'],
            ['Setor', func.setor || '—'],
            ['Admissão', func.data_admissao ? fmt(func.data_admissao) : '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[9px] text-gray-500 uppercase">{label}</p>
              <p className="font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ASOs */}
      <PrintSection
        title="Exames Médicos (ASO)"
        rows={asos}
        headers={['Data', 'Tipo', 'Médico Responsável', 'Próximo Exame']}
        renderRow={(r) => [
          fmt(r.data_aso),
          r.tipo_exame || '—',
          r.medico_responsavel || '—',
          r.data_proximo_aso ? fmt(r.data_proximo_aso) : '—',
        ]}
      />

      {/* EPIs */}
      <PrintSection
        title="EPIs Recebidos"
        rows={epis}
        headers={['EPI', 'CA', 'Quantidade', 'Data de Entrega']}
        renderRow={(r) => [
          r.epi_item?.nome || '—',
          r.epi_item?.ca || '—',
          r.quantidade,
          r.data_entrega ? fmt(r.data_entrega) : '—',
        ]}
      />

      {/* Afastamentos */}
      <PrintSection
        title="Afastamentos"
        rows={afastamentos}
        headers={['Tipo', 'CID-10', 'Início', 'Retorno', 'Dias']}
        renderRow={(r) => [
          r.tipo || '—',
          r.cid10 || '—',
          r.data_inicio ? fmt(r.data_inicio) : '—',
          r.data_fim ? fmt(r.data_fim) : 'Em curso',
          r.dias_afastados ?? '—',
        ]}
      />

      {/* Assinaturas */}
      <div className="mt-10 pt-6 border-t border-gray-300 grid grid-cols-2 gap-16">
        {['Responsável SST', 'Funcionário'].map((label) => (
          <div key={label} className="text-center">
            <div className="h-10" />
            <div className="border-t border-black pt-1 text-[10px]">{label}</div>
          </div>
        ))}
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
git add src/pages/funcionarios/ProntuarioPrint.jsx
git commit -m "feat: layout de impressão A4 do prontuário do funcionário"
```

---

## Task 4: Módulo Funcionários — Prontuário 360° + suporte a print global

**Files:**
- Create: `src/pages/funcionarios/FuncionarioProntuario.jsx`
- Modify: `src/components/layout/Sidebar.jsx` (adicionar `print:hidden`)
- Modify: `src/components/layout/AppShell.jsx` (adicionar `print:hidden` à barra gradiente)

**Interfaces:**
- Consumes: `useParams().id` → busca `funcionario`, `aso`, `epi_entrega`, `afastamento`, `treinamento_participante`
- Consumes: `ProntuarioPrint` de `./ProntuarioPrint`

- [ ] **Step 1: Adicionar `print:hidden` ao Sidebar**

No arquivo `src/components/layout/Sidebar.jsx`, localizar a tag `<aside` e adicionar `print:hidden`:

```jsx
<aside className="w-[240px] bg-metro-navy flex flex-col h-screen overflow-y-auto flex-shrink-0 print:hidden">
```

- [ ] **Step 2: Adicionar `print:hidden` à barra gradiente do AppShell**

No arquivo `src/components/layout/AppShell.jsx`, localizar a div com `h-[3px]` e adicionar `print:hidden`:

```jsx
<div className="h-[3px] bg-gradient-to-r from-metro-navy via-metro-primary to-metro-accent flex-shrink-0 print:hidden" />
```

- [ ] **Step 3: Criar `src/pages/funcionarios/FuncionarioProntuario.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Topbar from '../../components/layout/Topbar'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { DataTable, Td } from '../../components/ui/Table'
import ProntuarioPrint from './ProntuarioPrint'

const ABAS = ['Resumo', 'ASOs', 'EPIs', 'Treinamentos', 'Afastamentos']

const SITUACAO_LABEL = {
  vencido:  'Vencido',
  vence_30: 'Vence em 30d',
  vence_60: 'Vence em 60d',
  vence_90: 'Vence em 90d',
  ok:       'Regular',
  sem_aso:  'Sem ASO',
}

export default function FuncionarioProntuario() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [func, setFunc]           = useState(null)
  const [abaAtiva, setAbaAtiva]   = useState('Resumo')
  const [asos, setAsos]           = useState([])
  const [epis, setEpis]           = useState([])
  const [treinamentos, setTreinamentos] = useState([])
  const [afastamentos, setAfastamentos] = useState([])
  const [semTabTP, setSemTabTP]   = useState(false)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data: funcData } = await supabase
        .from('funcionario')
        .select('*')
        .eq('id', id)
        .single()
      setFunc(funcData ?? null)

      const [asoRes, epiRes, afastRes] = await Promise.all([
        supabase.from('aso').select('*').eq('funcionario_id', id).order('data_aso', { ascending: false }),
        supabase.from('epi_entrega').select('*, epi_item(nome, ca)').eq('funcionario_id', id).order('data_entrega', { ascending: false }),
        supabase.from('afastamento').select('*').eq('funcionario_id', id).order('data_inicio', { ascending: false }),
      ])

      setAsos(asoRes.data ?? [])
      setEpis(epiRes.data ?? [])
      setAfastamentos(afastRes.data ?? [])

      const { data: tpData, error: tpErr } = await supabase
        .from('treinamento_participante')
        .select('*, treinamento(nome, nr_vinculada, data_realizacao, validade_meses)')
        .eq('funcionario_id', id)

      if (tpErr?.code === '42P01') {
        setSemTabTP(true)
      } else {
        setTreinamentos(tpData ?? [])
      }

      setLoading(false)
    }
    load()
  }, [id])

  const anoAtual = new Date().getFullYear()
  const afastamentosAno = afastamentos.filter((a) => a.data_inicio?.startsWith(String(anoAtual)))
  const diasAno = afastamentosAno.reduce((acc, a) => acc + (a.dias_afastados ?? 0), 0)
  const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'

  return (
    <div>
      <Topbar
        breadcrumb="Funcionários"
        title={<><i className="fa-solid fa-id-card text-metro-primary mr-2" />{func?.nome_completo ?? '...'}</>}
        actions={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" icon="arrow-left" onClick={() => navigate('/funcionarios')}>Voltar</Button>
            <Button size="sm" icon="print" onClick={() => window.print()}>Imprimir Prontuário</Button>
          </div>
        }
      />

      {loading && <p className="px-6 py-10 text-metro-muted text-sm text-center">Carregando...</p>}

      {!loading && func && (
        <div className="p-6 print:hidden">
          {/* Cabeçalho do funcionário */}
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 mb-4 flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-metro-primary/10 flex items-center justify-center text-lg font-bold text-metro-primary flex-shrink-0">
              {func.nome_completo?.split(' ').slice(0, 2).map((n) => n[0]).join('')}
            </div>
            <div className="flex-1 grid grid-cols-4 gap-4">
              {[
                ['Matrícula', <span className="font-mono">{func.matricula}</span>],
                ['Função', func.funcao || '—'],
                ['Setor', func.setor || '—'],
                ['Admissão', func.data_admissao ? fmt(func.data_admissao) : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] text-metro-muted uppercase tracking-wide font-semibold mb-0.5">{label}</p>
                  <p className="text-[13px] font-semibold text-metro-text">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Abas */}
          <div className="flex gap-1 mb-4">
            {ABAS.map((aba) => (
              <button
                key={aba}
                onClick={() => setAbaAtiva(aba)}
                className={`px-4 py-2 text-[12px] font-semibold rounded-lg transition-colors border-none cursor-pointer ${
                  abaAtiva === aba
                    ? 'bg-metro-primary text-white'
                    : 'bg-white text-metro-muted hover:text-metro-primary border border-gray-100'
                }`}
              >
                {aba}
              </button>
            ))}
          </div>

          {/* Aba Resumo */}
          {abaAtiva === 'Resumo' && (
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Último ASO', value: asos[0] ? fmt(asos[0].data_aso) : '—', sub: asos[0] ? <Badge status={asos[0].situacao}>{SITUACAO_LABEL[asos[0].situacao] ?? 'Regular'}</Badge> : null, color: 'border-t-metro-primary', textColor: 'text-metro-navy' },
                { label: 'EPIs Recebidos', value: epis.length, sub: 'Total de entregas', color: 'border-t-blue-500', textColor: 'text-blue-600' },
                { label: 'Treinamentos', value: treinamentos.length, sub: 'Participações', color: 'border-t-purple-500', textColor: 'text-purple-600' },
                { label: 'Dias Afastados', value: diasAno, sub: `No ano de ${anoAtual}`, color: 'border-t-orange-500', textColor: 'text-orange-600' },
              ].map(({ label, value, sub, color, textColor }) => (
                <div key={label} className={`bg-white rounded-xl border border-gray-100 border-t-4 ${color} px-5 py-4`}>
                  <p className="text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">{label}</p>
                  <p className={`text-3xl font-bold leading-none mb-1 ${textColor}`}>{value}</p>
                  {sub && <div className="text-[11px] text-metro-muted">{sub}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Aba ASOs */}
          {abaAtiva === 'ASOs' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <DataTable headers={['Data', 'Tipo', 'Médico Responsável', 'Próximo Exame', 'Situação']} empty="Nenhum ASO registrado.">
                {asos.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <Td className="text-[12px] text-metro-muted">{fmt(r.data_aso)}</Td>
                    <Td className="text-[12px] text-metro-text">{r.tipo_exame || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">{r.medico_responsavel || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">{r.data_proximo_aso ? fmt(r.data_proximo_aso) : '—'}</Td>
                    <Td><Badge status={r.situacao}>{SITUACAO_LABEL[r.situacao] ?? 'Regular'}</Badge></Td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}

          {/* Aba EPIs */}
          {abaAtiva === 'EPIs' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <DataTable headers={['EPI', 'CA', 'Quantidade', 'Data de Entrega']} empty="Nenhuma entrega registrada.">
                {epis.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <Td className="font-semibold text-metro-text text-[13px]">{r.epi_item?.nome || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">{r.epi_item?.ca || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">{r.quantidade}</Td>
                    <Td className="text-[12px] text-metro-muted">{r.data_entrega ? fmt(r.data_entrega) : '—'}</Td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}

          {/* Aba Treinamentos */}
          {abaAtiva === 'Treinamentos' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {semTabTP ? (
                <p className="px-5 py-8 text-center text-metro-muted text-sm">
                  <i className="fa-solid fa-circle-info mr-2" />
                  A tabela <code className="bg-slate-100 px-1 rounded">treinamento_participante</code> ainda não existe no banco.
                  Crie-a para vincular funcionários a treinamentos.
                </p>
              ) : (
                <DataTable headers={['Treinamento', 'NR', 'Data', 'Válido até']} empty="Nenhum treinamento registrado.">
                  {treinamentos.map((r) => {
                    const d = r.treinamento?.data_realizacao
                    const m = r.treinamento?.validade_meses
                    const valido = d && m
                      ? new Date(new Date(d).setMonth(new Date(d).getMonth() + m)).toLocaleDateString('pt-BR')
                      : '—'
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60">
                        <Td className="font-semibold text-metro-text text-[13px]">{r.treinamento?.nome || '—'}</Td>
                        <Td className="text-[12px] text-metro-muted">{r.treinamento?.nr_vinculada || '—'}</Td>
                        <Td className="text-[12px] text-metro-muted">{d ? fmt(d) : '—'}</Td>
                        <Td className="text-[12px] text-metro-muted">{valido}</Td>
                      </tr>
                    )
                  })}
                </DataTable>
              )}
            </div>
          )}

          {/* Aba Afastamentos */}
          {abaAtiva === 'Afastamentos' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <DataTable headers={['Tipo', 'CID-10', 'Início', 'Retorno', 'Dias']} empty="Nenhum afastamento registrado.">
                {afastamentos.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <Td className="text-[12px] text-metro-text capitalize">{r.tipo || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted font-mono">{r.cid10 || '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">{r.data_inicio ? fmt(r.data_inicio) : '—'}</Td>
                    <Td className="text-[12px] text-metro-muted">
                      {r.data_fim ? fmt(r.data_fim) : <span className="text-orange-500 font-semibold">Em curso</span>}
                    </Td>
                    <Td className="font-semibold text-metro-navy text-[13px]">{r.dias_afastados ?? '—'}</Td>
                  </tr>
                ))}
              </DataTable>
            </div>
          )}
        </div>
      )}

      {/* Layout de impressão — visível apenas no print */}
      {!loading && func && (
        <ProntuarioPrint
          func={func}
          asos={asos}
          epis={epis}
          treinamentos={treinamentos}
          afastamentos={afastamentos}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Rodar testes**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/funcionarios/FuncionarioProntuario.jsx src/components/layout/Sidebar.jsx src/components/layout/AppShell.jsx
git commit -m "feat: prontuário 360° do funcionário com 5 abas e impressão CSS"
```

---

## Task 5: Router — Módulo Funcionários

**Files:**
- Modify: `src/router.jsx`

- [ ] **Step 1: Atualizar `src/router.jsx`**

Adicionar imports:
```jsx
import FuncionariosPage from './pages/funcionarios/FuncionariosPage'
import FuncionarioProntuario from './pages/funcionarios/FuncionarioProntuario'
```

Substituir:
```jsx
{ path: 'funcionarios',            element: <ComingSoon modulo="Funcionários" /> },
```

Por:
```jsx
{ path: 'funcionarios',            element: <FuncionariosPage /> },
{ path: 'funcionarios/:id',        element: <FuncionarioProntuario /> },
```

- [ ] **Step 2: Rodar testes**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 3: Commit**

```bash
git add src/router.jsx
git commit -m "feat: módulo Funcionários com prontuário 360° integrado ao router"
```

---

## Task 6: Módulo CIPA

**Files:**
- Create: `src/pages/cipa/CipaMembroForm.jsx`
- Create: `src/pages/cipa/CipaPage.jsx`

**Interfaces:**
- Consumes: tabela `cipa_membro` com campos `id, funcionario_id, cargo, tipo, representacao, data_inicio, data_fim`
- Consumes: `funcionario` via join `cipa_membro.select('*, funcionario(nome_completo, matricula)')`

- [ ] **Step 1: Criar `src/pages/cipa/CipaMembroForm.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Input, Select } from '../../components/ui/FormControl'
import Button from '../../components/ui/Button'

const CARGOS = [
  { value: 'presidente',      label: 'Presidente' },
  { value: 'vice_presidente', label: 'Vice-Presidente' },
  { value: 'secretario',      label: 'Secretário' },
  { value: 'membro',          label: 'Membro' },
]

export default function CipaMembroForm({ onSaved, onCancel }) {
  const [funcionarios, setFuncionarios] = useState([])
  const [form, setForm] = useState({
    funcionario_id: '',
    cargo: 'membro',
    tipo: 'titular',
    representacao: 'empregados',
    data_inicio: new Date().toISOString().slice(0, 10),
    data_fim: '',
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
    if (!form.funcionario_id) { setErro('Selecione o funcionário.'); return }
    if (!form.data_inicio || !form.data_fim) { setErro('Informe o período do mandato.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('cipa_membro').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <Select label="Funcionário" value={form.funcionario_id} onChange={(e) => set('funcionario_id', e.target.value)}>
        <option value="">— selecione —</option>
        {funcionarios.map((f) => (
          <option key={f.id} value={f.id}>{f.matricula} · {f.nome_completo}</option>
        ))}
      </Select>

      <Select label="Cargo na CIPA" value={form.cargo} onChange={(e) => set('cargo', e.target.value)}>
        {CARGOS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
          <option value="titular">Titular</option>
          <option value="suplente">Suplente</option>
        </Select>
        <Select label="Representação" value={form.representacao} onChange={(e) => set('representacao', e.target.value)}>
          <option value="empregados">Empregados</option>
          <option value="empregador">Empregador</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Início do Mandato" type="date" value={form.data_inicio} onChange={(e) => set('data_inicio', e.target.value)} />
        <Input label="Fim do Mandato" type="date" value={form.data_fim} onChange={(e) => set('data_fim', e.target.value)} />
      </div>

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="scale-balanced" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Adicionar Membro'}
        </Button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Criar `src/pages/cipa/CipaPage.jsx`**

```jsx
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
```

- [ ] **Step 3: Atualizar `src/router.jsx`**

Adicionar imports:
```jsx
import CipaPage from './pages/cipa/CipaPage'
```

Substituir:
```jsx
{ path: 'cipa',                    element: <ComingSoon modulo="CIPA" /> },
```

Por:
```jsx
{ path: 'cipa',                    element: <CipaPage /> },
```

- [ ] **Step 4: Rodar testes**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/cipa/CipaPage.jsx src/pages/cipa/CipaMembroForm.jsx src/router.jsx
git commit -m "feat: módulo CIPA com lista de membros e controle de mandato"
```

---

## Task 7: Módulo Laudos / PGR

**Files:**
- Create: `src/pages/laudos/LaudoForm.jsx`
- Create: `src/pages/laudos/RiscoForm.jsx`
- Create: `src/pages/laudos/LaudosPage.jsx`

**Interfaces:**
- Consumes: tabela `laudo` com campos `id, tipo, titulo, responsavel_tecnico, crt_crq, data_emissao, validade, url_documento, observacoes`
- Consumes: tabela `risco_ghe` com campos `id, ghe, agente, tipo_risco, fonte, intensidade, epc, epi_requerido, observacoes`

- [ ] **Step 1: Criar `src/pages/laudos/LaudoForm.jsx`**

```jsx
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Input, Select, Textarea } from '../../components/ui/FormControl'
import Button from '../../components/ui/Button'

const TIPOS = [
  { value: 'insalubridade',  label: 'Laudo de Insalubridade' },
  { value: 'periculosidade', label: 'Laudo de Periculosidade' },
  { value: 'ltcat',          label: 'LTCAT' },
  { value: 'pgr',            label: 'PGR' },
  { value: 'outro',          label: 'Outro' },
]

export default function LaudoForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    tipo: 'pgr',
    titulo: '',
    responsavel_tecnico: '',
    crt_crq: '',
    data_emissao: new Date().toISOString().slice(0, 10),
    validade: '',
    url_documento: '',
    observacoes: '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.titulo || !form.responsavel_tecnico) {
      setErro('Título e responsável técnico são obrigatórios.')
      return
    }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('laudo').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <Select label="Tipo de Documento" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
        {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </Select>

      <Input label="Título" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ex: PGR 2025 — Operação" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Responsável Técnico" value={form.responsavel_tecnico} onChange={(e) => set('responsavel_tecnico', e.target.value)} placeholder="Nome do engenheiro/técnico" />
        <Input label="CRT / CRQ" value={form.crt_crq} onChange={(e) => set('crt_crq', e.target.value)} placeholder="Ex: CRT-DF 12345" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Data de Emissão" type="date" value={form.data_emissao} onChange={(e) => set('data_emissao', e.target.value)} />
        <Input label="Validade" type="date" value={form.validade} onChange={(e) => set('validade', e.target.value)} />
      </div>

      <Input label="URL / Link do Documento" value={form.url_documento} onChange={(e) => set('url_documento', e.target.value)} placeholder="https://..." />

      <Textarea label="Observações" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} rows={2} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="folder-open" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Documento'}
        </Button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Criar `src/pages/laudos/RiscoForm.jsx`**

```jsx
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Input, Select, Textarea } from '../../components/ui/FormControl'
import Button from '../../components/ui/Button'

const TIPOS_RISCO = [
  { value: 'fisico',     label: 'Físico' },
  { value: 'quimico',   label: 'Químico' },
  { value: 'biologico', label: 'Biológico' },
  { value: 'ergonomico',label: 'Ergonômico' },
  { value: 'acidente',  label: 'Acidente' },
]

export default function RiscoForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    ghe: '',
    agente: '',
    tipo_risco: 'fisico',
    fonte: '',
    intensidade: '',
    epc: '',
    epi_requerido: '',
    observacoes: '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.ghe || !form.agente) { setErro('GHE e agente de risco são obrigatórios.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('risco_ghe').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Input label="GHE" value={form.ghe} onChange={(e) => set('ghe', e.target.value)} placeholder="Ex: GHE-01 Operação" />
        <Select label="Tipo de Risco" value={form.tipo_risco} onChange={(e) => set('tipo_risco', e.target.value)}>
          {TIPOS_RISCO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
      </div>

      <Input label="Agente de Risco" value={form.agente} onChange={(e) => set('agente', e.target.value)} placeholder="Ex: Ruído acima de 85 dB(A)" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Fonte / Origem" value={form.fonte} onChange={(e) => set('fonte', e.target.value)} placeholder="Ex: Trem em movimento" />
        <Input label="Intensidade / Concentração" value={form.intensidade} onChange={(e) => set('intensidade', e.target.value)} placeholder="Ex: 92 dB(A)" />
      </div>

      <Input label="EPC Adotado" value={form.epc} onChange={(e) => set('epc', e.target.value)} placeholder="Ex: Enclausuramento acústico" />
      <Input label="EPI Requerido" value={form.epi_requerido} onChange={(e) => set('epi_requerido', e.target.value)} placeholder="Ex: Protetor auricular CA 12345" />
      <Textarea label="Observações" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} rows={2} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="shield-halved" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Risco'}
        </Button>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Criar `src/pages/laudos/LaudosPage.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Topbar from '../../components/layout/Topbar'
import Button from '../../components/ui/Button'
import { DataTable, Td } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import FilterBar, { SearchInput } from '../../components/ui/FilterBar'
import SidePanel from '../../components/ui/SidePanel'
import LaudoForm from './LaudoForm'
import RiscoForm from './RiscoForm'

const TIPO_LAUDO_LABEL = {
  insalubridade:  'Insalubridade',
  periculosidade: 'Periculosidade',
  ltcat:          'LTCAT',
  pgr:            'PGR',
  outro:          'Outro',
}

const TIPO_RISCO_STYLES = {
  fisico:     'bg-blue-50 text-blue-700',
  quimico:    'bg-yellow-50 text-yellow-700',
  biologico:  'bg-green-50 text-green-700',
  ergonomico: 'bg-purple-50 text-purple-700',
  acidente:   'bg-red-50 text-red-700',
}

const PER_PAGE = 20

function docStatus(validade) {
  if (!validade) return { label: 'Sem validade', cls: 'bg-gray-100 text-gray-500' }
  const diff = Math.floor((new Date(validade) - new Date()) / 86400000)
  if (diff < 0)   return { label: 'Vencido',           cls: 'bg-red-50 text-red-600' }
  if (diff <= 90) return { label: `Vence em ${diff}d`, cls: 'bg-orange-50 text-orange-600' }
  return { label: 'Válido', cls: 'bg-green-50 text-green-600' }
}

export default function LaudosPage() {
  const [aba, setAba]               = useState('documentos')
  const [laudos, setLaudos]         = useState([])
  const [riscos, setRiscos]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [showLaudo, setShowLaudo]   = useState(false)
  const [showRisco, setShowRisco]   = useState(false)

  function loadLaudos() {
    supabase.from('laudo').select('*').order('data_emissao', { ascending: false }).then(({ data }) => setLaudos(data ?? []))
  }

  function loadRiscos() {
    supabase.from('risco_ghe').select('*').order('ghe').then(({ data }) => setRiscos(data ?? []))
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      supabase.from('laudo').select('*').order('data_emissao', { ascending: false }),
      supabase.from('risco_ghe').select('*').order('ghe'),
    ]).then(([lRes, rRes]) => {
      setLaudos(lRes.data ?? [])
      setRiscos(rRes.data ?? [])
      setLoading(false)
    })
  }, [])

  const filteredLaudos = laudos.filter((r) => {
    const q = search.toLowerCase()
    return !q || r.titulo?.toLowerCase().includes(q) || r.responsavel_tecnico?.toLowerCase().includes(q)
  })

  const filteredRiscos = riscos.filter((r) => {
    const q = search.toLowerCase()
    return !q || r.ghe?.toLowerCase().includes(q) || r.agente?.toLowerCase().includes(q)
  })

  const paginatedLaudos = filteredLaudos.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const paginatedRiscos = filteredRiscos.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <Topbar
        breadcrumb="Gestão"
        title={<><i className="fa-solid fa-folder-open text-metro-primary mr-2" />Laudos / PGR</>}
        actions={
          aba === 'documentos'
            ? <Button size="sm" icon="plus" onClick={() => setShowLaudo(true)}>Novo Documento</Button>
            : <Button size="sm" icon="plus" onClick={() => setShowRisco(true)}>Novo Risco</Button>
        }
      />

      <div className="p-6">
        {/* Abas */}
        <div className="flex gap-1 mb-4">
          {[['documentos', 'Documentos Técnicos'], ['riscos', 'Riscos por GHE']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setAba(key); setSearch(''); setPage(1) }}
              className={`px-4 py-2 text-[12px] font-semibold rounded-lg transition-colors border-none cursor-pointer ${
                aba === key
                  ? 'bg-metro-primary text-white'
                  : 'bg-white text-metro-muted hover:text-metro-primary border border-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <FilterBar>
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder={aba === 'documentos' ? 'Buscar por título ou responsável...' : 'Buscar por GHE ou agente...'}
          />
        </FilterBar>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
            {loading ? (
              <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p>
            ) : aba === 'documentos' ? (
              <>
                <div className="px-5 py-3.5 border-b border-gray-100">
                  <span className="text-[13px] font-bold text-metro-navy">
                    Documentos Técnicos
                    <span className="text-metro-muted font-normal ml-2 text-xs">— {filteredLaudos.length} documentos</span>
                  </span>
                </div>
                <DataTable
                  headers={['Tipo', 'Título', 'Responsável', 'Emissão', 'Validade', 'Status']}
                  empty="Nenhum documento cadastrado."
                >
                  {paginatedLaudos.map((r) => {
                    const s = docStatus(r.validade)
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                        <Td>
                          <span className="bg-slate-100 text-metro-primary text-[10px] font-semibold px-2 py-0.5 rounded">
                            {TIPO_LAUDO_LABEL[r.tipo] ?? r.tipo}
                          </span>
                        </Td>
                        <Td>
                          <p className="font-semibold text-metro-text text-[13px]">{r.titulo}</p>
                          {r.crt_crq && <p className="text-[11px] text-metro-muted">{r.crt_crq}</p>}
                        </Td>
                        <Td className="text-[12px] text-metro-muted">{r.responsavel_tecnico}</Td>
                        <Td className="text-[12px] text-metro-muted">
                          {r.data_emissao ? new Date(r.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                        </Td>
                        <Td className="text-[12px] text-metro-muted">
                          {r.validade ? new Date(r.validade + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                        </Td>
                        <Td>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>{s.label}</span>
                        </Td>
                      </tr>
                    )
                  })}
                </DataTable>
                <Pagination page={page} total={filteredLaudos.length} perPage={PER_PAGE} onPage={setPage} />
              </>
            ) : (
              <>
                <div className="px-5 py-3.5 border-b border-gray-100">
                  <span className="text-[13px] font-bold text-metro-navy">
                    Riscos por GHE
                    <span className="text-metro-muted font-normal ml-2 text-xs">— {filteredRiscos.length} riscos</span>
                  </span>
                </div>
                <DataTable
                  headers={['GHE', 'Agente', 'Tipo', 'Intensidade', 'EPC', 'EPI Requerido']}
                  empty="Nenhum risco cadastrado."
                >
                  {paginatedRiscos.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <Td className="font-semibold text-metro-text text-[13px]">{r.ghe}</Td>
                      <Td className="text-[12px] text-metro-text">{r.agente}</Td>
                      <Td>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${TIPO_RISCO_STYLES[r.tipo_risco] ?? 'bg-slate-100 text-slate-600'}`}>
                          {r.tipo_risco ? r.tipo_risco.charAt(0).toUpperCase() + r.tipo_risco.slice(1) : '—'}
                        </span>
                      </Td>
                      <Td className="text-[12px] text-metro-muted">{r.intensidade || '—'}</Td>
                      <Td className="text-[12px] text-metro-muted">{r.epc || '—'}</Td>
                      <Td className="text-[12px] text-metro-muted">{r.epi_requerido || '—'}</Td>
                    </tr>
                  ))}
                </DataTable>
                <Pagination page={page} total={filteredRiscos.length} perPage={PER_PAGE} onPage={setPage} />
              </>
            )}
          </div>

          {showLaudo && (
            <SidePanel open={showLaudo} title="Novo Documento" icon="folder-open" onClose={() => setShowLaudo(false)}>
              <LaudoForm onSaved={() => { setShowLaudo(false); loadLaudos() }} onCancel={() => setShowLaudo(false)} />
            </SidePanel>
          )}

          {showRisco && (
            <SidePanel open={showRisco} title="Novo Risco GHE" icon="shield-halved" onClose={() => setShowRisco(false)}>
              <RiscoForm onSaved={() => { setShowRisco(false); loadRiscos() }} onCancel={() => setShowRisco(false)} />
            </SidePanel>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Atualizar `src/router.jsx`**

Adicionar import:
```jsx
import LaudosPage from './pages/laudos/LaudosPage'
```

Substituir:
```jsx
{ path: 'laudos',                  element: <ComingSoon modulo="Laudos / PGR" /> },
```

Por:
```jsx
{ path: 'laudos',                  element: <LaudosPage /> },
```

- [ ] **Step 5: Rodar testes**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/laudos/LaudosPage.jsx src/pages/laudos/LaudoForm.jsx src/pages/laudos/RiscoForm.jsx src/router.jsx
git commit -m "feat: módulo Laudos/PGR com documentos técnicos e riscos por GHE"
```

---

## Task 8: Exportações CSV nas listagens existentes

**Files:**
- Modify: `src/pages/saude/Aso/AsoPage.jsx`
- Modify: `src/pages/epi/EpiPage.jsx`
- Modify: `src/pages/treinamentos/TreinamentosPage.jsx`
- Modify: `src/pages/seguranca/Acidentes/AcidentesPage.jsx`
- Modify: `src/pages/saude/Absenteismo/AbsenteismoPage.jsx`

**Interfaces:**
- Consumes: `exportCsv(rows, filename)` de `../../../lib/exportCsv` (ajustar profundidade por arquivo)

Em cada arquivo, os passos são: (1) adicionar import de `exportCsv`, (2) adicionar botão no Topbar `actions`, (3) passar `filtered` para a função.

- [ ] **Step 1: Atualizar `src/pages/saude/Aso/AsoPage.jsx`**

Adicionar import no topo:
```jsx
import { exportCsv } from '../../../lib/exportCsv'
```

No `actions` do Topbar, adicionar botão de exportação ao lado do botão existente:
```jsx
actions={
  <div className="flex gap-2">
    <Button variant="outline" size="sm" icon="file-csv" onClick={() => exportCsv(filtered, 'asos.csv')}>Exportar CSV</Button>
    <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Novo ASO</Button>
  </div>
}
```

- [ ] **Step 2: Atualizar `src/pages/epi/EpiPage.jsx`**

Adicionar import:
```jsx
import { exportCsv } from '../../lib/exportCsv'
```

No `actions` do Topbar:
```jsx
actions={
  <div className="flex gap-2">
    <Button variant="outline" size="sm" icon="file-csv" onClick={() => exportCsv(filtered, 'epis.csv')}>Exportar CSV</Button>
    <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Novo EPI</Button>
  </div>
}
```

- [ ] **Step 3: Atualizar `src/pages/treinamentos/TreinamentosPage.jsx`**

Adicionar import:
```jsx
import { exportCsv } from '../../lib/exportCsv'
```

No `actions` do Topbar:
```jsx
actions={
  <div className="flex gap-2">
    <Button variant="outline" size="sm" icon="file-csv" onClick={() => exportCsv(filtered, 'treinamentos.csv')}>Exportar CSV</Button>
    <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Novo Treinamento</Button>
  </div>
}
```

- [ ] **Step 4: Atualizar `src/pages/seguranca/Acidentes/AcidentesPage.jsx`**

Adicionar import:
```jsx
import { exportCsv } from '../../../lib/exportCsv'
```

No `actions` do Topbar:
```jsx
actions={
  <div className="flex gap-2">
    <Button variant="outline" size="sm" icon="file-csv" onClick={() => exportCsv(filtered, 'acidentes.csv')}>Exportar CSV</Button>
    <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Nova Ocorrência</Button>
  </div>
}
```

- [ ] **Step 5: Atualizar `src/pages/saude/Absenteismo/AbsenteismoPage.jsx`**

Adicionar import:
```jsx
import { exportCsv } from '../../../lib/exportCsv'
```

No `actions` do Topbar:
```jsx
actions={
  <div className="flex gap-2">
    <Button variant="outline" size="sm" icon="file-csv" onClick={() => exportCsv(filtered, 'afastamentos.csv')}>Exportar CSV</Button>
    <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Registrar Afastamento</Button>
  </div>
}
```

- [ ] **Step 6: Rodar testes**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/saude/Aso/AsoPage.jsx src/pages/epi/EpiPage.jsx src/pages/treinamentos/TreinamentosPage.jsx src/pages/seguranca/Acidentes/AcidentesPage.jsx src/pages/saude/Absenteismo/AbsenteismoPage.jsx
git commit -m "feat: exportação CSV nas listagens de ASO, EPIs, Treinamentos, Acidentes e Afastamentos"
```

---

## Task 9: PermissaoPrint + botão imprimir PT

**Files:**
- Create: `src/pages/seguranca/Permissoes/PermissaoPrint.jsx`
- Modify: `src/pages/seguranca/Permissoes/PermissoesPage.jsx`

**Interfaces:**
- `PermissaoPrint` recebe `{ data }` onde `data` é um registro da tabela `permissao_trabalho`
- `PermissoesPage` mantém state `printTarget` (null | objeto PT); ao clicar em imprimir numa linha, define `printTarget` e chama `window.print()`

- [ ] **Step 1: Criar `src/pages/seguranca/Permissoes/PermissaoPrint.jsx`**

```jsx
const TIPO_LABEL = {
  entrada_via:      'Entrada em Via (NR-10)',
  espaco_confinado: 'Espaço Confinado (NR-33)',
  altura:           'Trabalho em Altura (NR-35)',
  eletricidade:     'Eletricidade (NR-10)',
  geral:            'Permissão Geral / APR',
}

export default function PermissaoPrint({ data }) {
  if (!data) return null

  return (
    <div className="hidden print:block p-8 text-[11px] text-black font-sans">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-5 pb-4 border-b-2 border-black">
        <div>
          <p className="text-[16px] font-bold">METRÔ-DF — Saúde e Segurança do Trabalho</p>
          <p className="text-[13px] font-semibold mt-0.5">Permissão de Trabalho / Análise Preliminar de Risco (APR)</p>
        </div>
        <div className="text-right text-[10px] text-gray-500">
          <p>Emitida em: {new Date().toLocaleDateString('pt-BR')}</p>
          <p>Nº: {data.id?.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Dados da PT */}
      <div className="mb-4 p-3 border border-gray-300 rounded">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Tipo de Permissão</p>
            <p className="font-semibold">{TIPO_LABEL[data.tipo] ?? data.tipo}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Status</p>
            <p className="font-semibold capitalize">{data.status}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Atividade a ser Executada</p>
            <p>{data.atividade}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Local / Área de Execução</p>
            <p>{data.local || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Início</p>
            <p>{data.data_inicio ? new Date(data.data_inicio).toLocaleString('pt-BR') : '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Término Previsto</p>
            <p>{data.data_fim ? new Date(data.data_fim).toLocaleString('pt-BR') : '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Responsável SST</p>
            <p>{data.responsavel_sst || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">EPIs Requeridos</p>
            <p>{data.epis_requeridos || '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 border border-gray-300 rounded">
          <p className="text-[9px] text-gray-500 uppercase font-semibold mb-1">Riscos Identificados</p>
          <p>{data.riscos_identificados || '—'}</p>
        </div>
        <div className="p-3 border border-gray-300 rounded">
          <p className="text-[9px] text-gray-500 uppercase font-semibold mb-1">Medidas de Controle</p>
          <p>{data.medidas_controle || '—'}</p>
        </div>
      </div>

      {/* Assinaturas */}
      <div className="mt-10 pt-6 border-t border-gray-300 grid grid-cols-3 gap-8">
        {['Emitente', 'Responsável SST', 'Aprovador'].map((label) => (
          <div key={label} className="text-center">
            <div className="h-12" />
            <div className="border-t border-black pt-1 text-[10px]">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Atualizar `src/pages/seguranca/Permissoes/PermissoesPage.jsx`**

Adicionar import no topo:
```jsx
import PermissaoPrint from './PermissaoPrint'
```

Adicionar state `printTarget` junto aos outros states:
```jsx
const [printTarget, setPrintTarget] = useState(null)
```

Adicionar função de impressão por linha:
```jsx
function imprimirPt(row) {
  setPrintTarget(row)
  setTimeout(() => {
    window.print()
    setPrintTarget(null)
  }, 100)
}
```

Substituir o Td final da tabela (que tem apenas o botão de olho) por este, que mantém o olho e adiciona o print:
```jsx
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
```

Adicionar `<PermissaoPrint data={printTarget} />` logo antes do fechamento do `<div>` raiz da página (após o `</div>` que fecha o `p-6`):
```jsx
      <PermissaoPrint data={printTarget} />
    </div>
  )
}
```

- [ ] **Step 3: Rodar testes**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 4: Commit**

```bash
git add src/pages/seguranca/Permissoes/PermissaoPrint.jsx src/pages/seguranca/Permissoes/PermissoesPage.jsx
git commit -m "feat: impressão CSS da Permissão de Trabalho (PT/APR)"
```

---

## Task 10: Testes finais e build

- [ ] **Step 1: Suite completa**

```bash
npm run test:run
```

Expected: 23 testes PASS.

- [ ] **Step 2: Build de produção**

```bash
npm run build
```

Expected: build sem erros (aviso de chunk > 500kB é aceitável).

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "feat: Fase 4 completa — Funcionários, CIPA, Laudos/PGR e exportações CSV/PDF"
```
