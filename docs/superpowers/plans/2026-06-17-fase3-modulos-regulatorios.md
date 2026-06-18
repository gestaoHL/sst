# SST Metro-DF — Fase 3: Módulos Regulatórios

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Implementar os 4 módulos regulatórios: Absenteísmo, PCMSO, Inspeções de Segurança e Permissões de Trabalho (APR/PT).

**Architecture:** Mesmo padrão das fases anteriores — Topbar + FilterBar + DataTable + SidePanel. Todos os componentes UI já existem. As rotas já têm stubs em `src/router.jsx` que serão substituídos.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, React Router v6, Supabase JS v2 — tudo já instalado.

---

## Task 1: Módulo Absenteísmo

**Files:**
- Create: `src/pages/saude/Absenteismo/AbsenteismoPage.jsx`
- Create: `src/pages/saude/Absenteismo/AfastamentoForm.jsx`
- Modify: `src/router.jsx`

- [ ] **Step 1: Criar `src/pages/saude/Absenteismo/AfastamentoForm.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Input, Select, Textarea } from '../../../components/ui/FormControl'
import Button from '../../../components/ui/Button'

const TIPOS = [
  { value: 'doenca',           label: 'Doença / Enfermidade' },
  { value: 'acidente_trabalho',label: 'Acidente de Trabalho' },
  { value: 'acidente_trajeto', label: 'Acidente de Trajeto' },
  { value: 'licenca',          label: 'Licença Médica' },
  { value: 'outros',           label: 'Outros' },
]

export default function AfastamentoForm({ onSaved, onCancel }) {
  const [funcionarios, setFuncionarios] = useState([])
  const [form, setForm] = useState({
    funcionario_id: '',
    tipo: 'doenca',
    cid10: '',
    data_inicio: new Date().toISOString().slice(0, 10),
    data_fim: '',
    crm_medico: '',
    numero_inss: '',
    observacoes: '',
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

  const diasAfastados = form.data_inicio && form.data_fim
    ? Math.ceil((new Date(form.data_fim) - new Date(form.data_inicio)) / 86400000) + 1
    : null

  async function salvar() {
    if (!form.funcionario_id) { setErro('Selecione o funcionário.'); return }
    if (!form.data_inicio)    { setErro('Informe a data de início.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('afastamento').insert({
      ...form,
      dias_afastados: diasAfastados,
    })
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

      <Select label="Tipo de Afastamento" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
        {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Input label="CID-10" value={form.cid10} onChange={(e) => set('cid10', e.target.value)} placeholder="Ex: M54.5" />
        <Input label="CRM do Médico" value={form.crm_medico} onChange={(e) => set('crm_medico', e.target.value)} placeholder="Ex: 12345/DF" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Data de Início" type="date" value={form.data_inicio} onChange={(e) => set('data_inicio', e.target.value)} />
        <Input label="Data de Retorno" type="date" value={form.data_fim} onChange={(e) => set('data_fim', e.target.value)} />
      </div>

      {diasAfastados !== null && (
        <p className="text-xs text-metro-muted bg-slate-50 px-3 py-2 rounded-md mb-1">
          <strong>{diasAfastados}</strong> dia{diasAfastados !== 1 ? 's' : ''} de afastamento
        </p>
      )}

      <Input label="Nº Benefício INSS" value={form.numero_inss} onChange={(e) => set('numero_inss', e.target.value)} placeholder="Opcional" />

      <Textarea label="Observações" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Observações adicionais..." rows={2} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="calendar-xmark" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Registrar Afastamento'}
        </Button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Criar `src/pages/saude/Absenteismo/AbsenteismoPage.jsx`**

```jsx
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
```

- [ ] **Step 3: Atualizar `src/router.jsx`**

Adicionar import:
```jsx
import AbsenteismoPage from './pages/saude/Absenteismo/AbsenteismoPage'
```

Substituir:
```jsx
{ path: 'saude/absenteismo', element: <ComingSoon modulo="Absenteísmo" /> },
```
Por:
```jsx
{ path: 'saude/absenteismo', element: <AbsenteismoPage /> },
```

- [ ] **Step 4: Rodar testes e commit**

```bash
npm run test:run
git add src/pages/saude/Absenteismo/AbsenteismoPage.jsx src/pages/saude/Absenteismo/AfastamentoForm.jsx src/router.jsx
git commit -m "feat: módulo Absenteísmo com registro de afastamentos e indicadores"
```

---

## Task 2: Módulo PCMSO

**Files:**
- Create: `src/pages/saude/Pcmso/PcmsoPage.jsx`
- Create: `src/pages/saude/Pcmso/PcmsoAcaoForm.jsx`
- Modify: `src/router.jsx`

- [ ] **Step 1: Criar `src/pages/saude/Pcmso/PcmsoAcaoForm.jsx`**

```jsx
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Input, Select, Textarea } from '../../../components/ui/FormControl'
import Button from '../../../components/ui/Button'

const STATUS_ACAO = [
  { value: 'pendente',  label: 'Pendente' },
  { value: 'realizado', label: 'Realizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function PcmsoAcaoForm({ programaId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    pcmso_programa_id: programaId,
    descricao: '',
    ghe: '',
    data_prevista: '',
    status: 'pendente',
    responsavel: '',
    observacoes: '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.descricao) { setErro('Informe a descrição da ação.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('pcmso_acao').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <Textarea label="Descrição da Ação" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Ex: Audiometria para GHE Manutenção" rows={3} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="GHE (Grupo Homogêneo)" value={form.ghe} onChange={(e) => set('ghe', e.target.value)} placeholder="Ex: GHE-01 Operação" />
        <Input label="Data Prevista" type="date" value={form.data_prevista} onChange={(e) => set('data_prevista', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          {STATUS_ACAO.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
        <Input label="Responsável" value={form.responsavel} onChange={(e) => set('responsavel', e.target.value)} placeholder="Nome do responsável" />
      </div>

      <Textarea label="Observações" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Observações..." rows={2} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="check" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Ação'}
        </Button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Criar `src/pages/saude/Pcmso/PcmsoPage.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Topbar from '../../../components/layout/Topbar'
import Button from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/FormControl'
import { DataTable, Td } from '../../../components/ui/Table'
import SidePanel from '../../../components/ui/SidePanel'
import PcmsoAcaoForm from './PcmsoAcaoForm'

const STATUS_STYLES = {
  pendente:  'bg-yellow-50 text-yellow-700',
  realizado: 'bg-green-50 text-green-600',
  cancelado: 'bg-gray-100 text-gray-500',
}

export default function PcmsoPage() {
  const [programa, setPrograma]   = useState(null)
  const [acoes, setAcoes]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showAcao, setShowAcao]   = useState(false)
  const [editando, setEditando]   = useState(false)
  const [formProg, setFormProg]   = useState({ medico_coordenador: '', crm: '', vigencia_inicio: '', vigencia_fim: '' })
  const [saving, setSaving]       = useState(false)

  async function load() {
    setLoading(true)
    const { data: prog } = await supabase.from('pcmso_programa').select('*').order('vigencia_inicio', { ascending: false }).limit(1).single()
    setPrograma(prog ?? null)
    if (prog) {
      const { data: ac } = await supabase.from('pcmso_acao').select('*').eq('pcmso_programa_id', prog.id).order('data_prevista')
      setAcoes(ac ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function salvarPrograma() {
    setSaving(true)
    if (programa) {
      await supabase.from('pcmso_programa').update(formProg).eq('id', programa.id)
    } else {
      await supabase.from('pcmso_programa').insert(formProg)
    }
    setSaving(false)
    setEditando(false)
    load()
  }

  function iniciarEdicao() {
    setFormProg({
      medico_coordenador: programa?.medico_coordenador ?? '',
      crm:                programa?.crm ?? '',
      vigencia_inicio:    programa?.vigencia_inicio ?? '',
      vigencia_fim:       programa?.vigencia_fim ?? '',
    })
    setEditando(true)
  }

  const set = (k, v) => setFormProg((f) => ({ ...f, [k]: v }))

  return (
    <div>
      <Topbar
        breadcrumb="Saúde Ocupacional"
        title={<><i className="fa-solid fa-heart-pulse text-metro-primary mr-2" />PCMSO</>}
      />

      <div className="p-6 space-y-4">
        <Card title="Programa Vigente" icon="heart-pulse" action={
          !editando && (
            <Button variant="outline" size="sm" icon="pen" onClick={iniciarEdicao}>
              {programa ? 'Editar' : 'Cadastrar'}
            </Button>
          )
        }>
          {loading ? (
            <p className="px-5 py-6 text-metro-muted text-sm text-center">Carregando...</p>
          ) : editando ? (
            <div className="p-5 space-y-1">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Médico Coordenador" value={formProg.medico_coordenador} onChange={(e) => set('medico_coordenador', e.target.value)} placeholder="Dr. Nome Completo" />
                <Input label="CRM" value={formProg.crm} onChange={(e) => set('crm', e.target.value)} placeholder="12345/DF" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Vigência Início" type="date" value={formProg.vigencia_inicio} onChange={(e) => set('vigencia_inicio', e.target.value)} />
                <Input label="Vigência Fim" type="date" value={formProg.vigencia_fim} onChange={(e) => set('vigencia_fim', e.target.value)} />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditando(false)}>Cancelar</Button>
                <Button size="sm" icon="check" onClick={salvarPrograma} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Programa'}
                </Button>
              </div>
            </div>
          ) : programa ? (
            <div className="px-5 py-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-metro-muted uppercase tracking-wide font-semibold mb-0.5">Médico Coordenador</p>
                <p className="text-[13px] font-semibold text-metro-text">{programa.medico_coordenador || '—'}</p>
                <p className="text-[11px] text-metro-muted">CRM: {programa.crm || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] text-metro-muted uppercase tracking-wide font-semibold mb-0.5">Vigência</p>
                <p className="text-[13px] font-semibold text-metro-text">
                  {programa.vigencia_inicio ? new Date(programa.vigencia_inicio + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                  {' → '}
                  {programa.vigencia_fim ? new Date(programa.vigencia_fim + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                </p>
              </div>
            </div>
          ) : (
            <p className="px-5 py-6 text-metro-muted text-sm text-center">Nenhum programa cadastrado. Clique em "Cadastrar" para iniciar.</p>
          )}
        </Card>

        <Card
          title="Ações Programadas"
          icon="list-check"
          action={
            programa && (
              <Button size="sm" icon="plus" onClick={() => setShowAcao(true)}>Nova Ação</Button>
            )
          }
        >
          {acoes.length === 0 ? (
            <p className="px-5 py-6 text-metro-muted text-sm text-center">
              {programa ? 'Nenhuma ação cadastrada.' : 'Cadastre o programa primeiro.'}
            </p>
          ) : (
            <DataTable headers={['Descrição', 'GHE', 'Data Prevista', 'Responsável', 'Status']}>
              {acoes.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                  <Td className="text-[13px] text-metro-text max-w-[200px]">{a.descricao}</Td>
                  <Td className="text-[12px] text-metro-muted">{a.ghe || '—'}</Td>
                  <Td className="text-[12px] text-metro-muted">
                    {a.data_prevista ? new Date(a.data_prevista + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                  </Td>
                  <Td className="text-[12px] text-metro-muted">{a.responsavel || '—'}</Td>
                  <Td>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[a.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {a.status === 'pendente' ? 'Pendente' : a.status === 'realizado' ? 'Realizado' : 'Cancelado'}
                    </span>
                  </Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Card>
      </div>

      <SidePanel open={showAcao} title="Nova Ação PCMSO" icon="list-check" onClose={() => setShowAcao(false)}>
        <PcmsoAcaoForm
          programaId={programa?.id}
          onSaved={() => { setShowAcao(false); load() }}
          onCancel={() => setShowAcao(false)}
        />
      </SidePanel>
    </div>
  )
}
```

- [ ] **Step 3: Atualizar `src/router.jsx`**

Adicionar import:
```jsx
import PcmsoPage from './pages/saude/Pcmso/PcmsoPage'
```

Substituir:
```jsx
{ path: 'saude/pcmso', element: <ComingSoon modulo="PCMSO" /> },
```
Por:
```jsx
{ path: 'saude/pcmso', element: <PcmsoPage /> },
```

- [ ] **Step 4: Rodar testes e commit**

```bash
npm run test:run
git add src/pages/saude/Pcmso/PcmsoPage.jsx src/pages/saude/Pcmso/PcmsoAcaoForm.jsx src/router.jsx
git commit -m "feat: módulo PCMSO com programa vigente e ações programadas"
```

---

## Task 3: Módulo Inspeções de Segurança

**Files:**
- Create: `src/pages/seguranca/Inspecoes/InspecoesPage.jsx`
- Create: `src/pages/seguranca/Inspecoes/InspecaoForm.jsx`
- Modify: `src/router.jsx`

- [ ] **Step 1: Criar `src/pages/seguranca/Inspecoes/InspecaoForm.jsx`**

```jsx
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Input, Select, Textarea } from '../../../components/ui/FormControl'
import Button from '../../../components/ui/Button'

const TIPOS = [
  { value: 'rotineira',     label: 'Rotineira' },
  { value: 'especial',      label: 'Especial' },
  { value: 'pos_acidente',  label: 'Pós-Acidente' },
]

const AREAS = [
  { value: 'estacao',    label: 'Estação' },
  { value: 'oficina',    label: 'Oficina / Manutenção' },
  { value: 'cco',        label: 'CCO (Centro de Controle)' },
  { value: 'via',        label: 'Via Permanente' },
  { value: 'deposito',   label: 'Depósito / Pátio' },
  { value: 'escritorio', label: 'Escritório / Administração' },
]

export default function InspecaoForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    tipo: 'rotineira',
    area: 'estacao',
    descricao_area: '',
    data_inspecao: new Date().toISOString().slice(0, 10),
    responsavel_tecnico: '',
    status: 'aberta',
    observacoes: '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.responsavel_tecnico) { setErro('Informe o responsável técnico.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('inspecao').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo de Inspeção" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
        <Input label="Data" type="date" value={form.data_inspecao} onChange={(e) => set('data_inspecao', e.target.value)} />
      </div>

      <Select label="Área Inspecionada" value={form.area} onChange={(e) => set('area', e.target.value)}>
        {AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
      </Select>

      <Input label="Descrição da Área" value={form.descricao_area} onChange={(e) => set('descricao_area', e.target.value)} placeholder="Ex: Estação Central — Plataforma Sul" />

      <Input label="Responsável Técnico (SST)" value={form.responsavel_tecnico} onChange={(e) => set('responsavel_tecnico', e.target.value)} placeholder="Nome do técnico responsável" />

      <Textarea label="Observações Iniciais" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} placeholder="Contexto, objetivo da inspeção..." rows={3} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="magnifying-glass" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Abrir Inspeção'}
        </Button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Criar `src/pages/seguranca/Inspecoes/InspecoesPage.jsx`**

```jsx
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
  aberta:    'bg-blue-50 text-blue-600',
  em_andamento: 'bg-orange-50 text-orange-600',
  concluida: 'bg-green-50 text-green-600',
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
```

- [ ] **Step 3: Atualizar `src/router.jsx`**

Adicionar import:
```jsx
import InspecoesPage from './pages/seguranca/Inspecoes/InspecoesPage'
```

Substituir:
```jsx
{ path: 'seguranca/inspecoes', element: <ComingSoon modulo="Inspeções" /> },
```
Por:
```jsx
{ path: 'seguranca/inspecoes', element: <InspecoesPage /> },
```

- [ ] **Step 4: Rodar testes e commit**

```bash
npm run test:run
git add src/pages/seguranca/Inspecoes/InspecoesPage.jsx src/pages/seguranca/Inspecoes/InspecaoForm.jsx src/router.jsx
git commit -m "feat: módulo Inspeções de Segurança com checklist de áreas Metro-DF"
```

---

## Task 4: Módulo Permissões de Trabalho

**Files:**
- Create: `src/pages/seguranca/Permissoes/PermissoesPage.jsx`
- Create: `src/pages/seguranca/Permissoes/PermissaoForm.jsx`
- Modify: `src/router.jsx`

- [ ] **Step 1: Criar `src/pages/seguranca/Permissoes/PermissaoForm.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Input, Select, Textarea } from '../../../components/ui/FormControl'
import Button from '../../../components/ui/Button'

const TIPOS_PT = [
  { value: 'entrada_via',      label: 'Entrada em Via (NR-10)' },
  { value: 'espaco_confinado', label: 'Espaço Confinado (NR-33)' },
  { value: 'altura',           label: 'Trabalho em Altura (NR-35)' },
  { value: 'eletricidade',     label: 'Eletricidade (NR-10)' },
  { value: 'geral',            label: 'Permissão Geral / APR' },
]

export default function PermissaoForm({ onSaved, onCancel }) {
  const [funcionarios, setFuncionarios] = useState([])
  const [form, setForm] = useState({
    tipo: 'geral',
    atividade: '',
    local: '',
    data_inicio: new Date().toISOString().slice(0, 16),
    data_fim: '',
    solicitante_id: '',
    responsavel_sst: '',
    riscos_identificados: '',
    medidas_controle: '',
    epis_requeridos: '',
    status: 'rascunho',
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
    if (!form.atividade) { setErro('Descreva a atividade a ser executada.'); return }
    setSaving(true); setErro(null)
    const { error } = await supabase.from('permissao_trabalho').insert(form)
    setSaving(false)
    if (error) setErro('Erro ao salvar: ' + error.message)
    else onSaved()
  }

  const tipoSelecionado = TIPOS_PT.find((t) => t.value === form.tipo)

  return (
    <>
      <Select label="Tipo de Permissão" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
        {TIPOS_PT.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </Select>

      {tipoSelecionado && form.tipo !== 'geral' && (
        <div className="mb-4 bg-orange-50 border border-orange-100 rounded-md px-3 py-2">
          <p className="text-[11px] text-orange-700 font-semibold">
            <i className="fa-solid fa-triangle-exclamation mr-1" />
            Atividade crítica — verifique habilitação e EPI específico antes de emitir
          </p>
        </div>
      )}

      <Textarea label="Atividade a ser Executada" value={form.atividade} onChange={(e) => set('atividade', e.target.value)} placeholder="Descreva detalhadamente a atividade..." rows={3} />

      <Input label="Local / Área de Execução" value={form.local} onChange={(e) => set('local', e.target.value)} placeholder="Ex: Via Principal — Km 12 / Estação Central" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Início" type="datetime-local" value={form.data_inicio} onChange={(e) => set('data_inicio', e.target.value)} />
        <Input label="Término Previsto" type="datetime-local" value={form.data_fim} onChange={(e) => set('data_fim', e.target.value)} />
      </div>

      <Select label="Solicitante" value={form.solicitante_id} onChange={(e) => set('solicitante_id', e.target.value)}>
        <option value="">— selecione (opcional) —</option>
        {funcionarios.map((f) => (
          <option key={f.id} value={f.id}>{f.matricula} · {f.nome_completo}</option>
        ))}
      </Select>

      <Input label="Responsável SST" value={form.responsavel_sst} onChange={(e) => set('responsavel_sst', e.target.value)} placeholder="Nome do técnico SST responsável" />

      <Textarea label="Riscos Identificados" value={form.riscos_identificados} onChange={(e) => set('riscos_identificados', e.target.value)} placeholder="Liste os principais riscos da atividade..." rows={2} />

      <Textarea label="Medidas de Controle" value={form.medidas_controle} onChange={(e) => set('medidas_controle', e.target.value)} placeholder="Medidas preventivas a serem adotadas..." rows={2} />

      <Input label="EPIs Requeridos" value={form.epis_requeridos} onChange={(e) => set('epis_requeridos', e.target.value)} placeholder="Ex: Capacete, luva isolante, cinto de segurança" />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="clipboard-check" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Emitir Permissão'}
        </Button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Criar `src/pages/seguranca/Permissoes/PermissoesPage.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Topbar from '../../../components/layout/Topbar'
import Button from '../../../components/ui/Button'
import { DataTable, Td } from '../../../components/ui/Table'
import Pagination from '../../../components/ui/Pagination'
import FilterBar, { SearchInput, FilterChip } from '../../../components/ui/FilterBar'
import SidePanel from '../../../components/ui/SidePanel'
import PermissaoForm from './PermissaoForm'

const TIPO_LABEL = {
  entrada_via:      'Entrada em Via',
  espaco_confinado: 'Esp. Confinado',
  altura:           'Trab. em Altura',
  eletricidade:     'Eletricidade',
  geral:            'APR / Geral',
}

const TIPO_STYLES = {
  entrada_via:      'bg-blue-50 text-blue-700',
  espaco_confinado: 'bg-purple-50 text-purple-700',
  altura:           'bg-orange-50 text-orange-700',
  eletricidade:     'bg-yellow-50 text-yellow-700',
  geral:            'bg-slate-100 text-slate-600',
}

const STATUS_STYLES = {
  rascunho:    'bg-gray-100 text-gray-500',
  aprovada:    'bg-green-50 text-green-600',
  em_execucao: 'bg-blue-50 text-blue-600',
  encerrada:   'bg-slate-100 text-slate-500',
}

const STATUS_LABEL = {
  rascunho:    'Rascunho',
  aprovada:    'Aprovada',
  em_execucao: 'Em Execução',
  encerrada:   'Encerrada',
}

const PER_PAGE = 20

export default function PermissoesPage() {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filtro, setFiltro]     = useState('todos')
  const [page, setPage]         = useState(1)
  const [showForm, setShowForm] = useState(false)

  function load() {
    setLoading(true)
    supabase
      .from('permissao_trabalho')
      .select('*, funcionario:solicitante_id(nome_completo)')
      .order('data_inicio', { ascending: false })
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || r.atividade?.toLowerCase().includes(q)
      || r.local?.toLowerCase().includes(q)
      || r.responsavel_sst?.toLowerCase().includes(q)
    const matchFiltro = filtro === 'todos' || r.status === filtro
    return matchSearch && matchFiltro
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <Topbar
        breadcrumb="Segurança"
        title={<><i className="fa-solid fa-clipboard-check text-metro-primary mr-2" />Permissões de Trabalho</>}
        actions={
          <Button size="sm" icon="plus" onClick={() => setShowForm(true)}>Nova PT / APR</Button>
        }
      />

      <div className="p-6">
        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por atividade, local ou responsável..." />
          <div className="flex gap-2 flex-wrap">
            {['todos', 'rascunho', 'aprovada', 'em_execucao', 'encerrada'].map((s) => (
              <FilterChip key={s} active={filtro === s} onClick={() => { setFiltro(s); setPage(1) }}>
                {s === 'todos' ? 'Todas' : STATUS_LABEL[s]}
              </FilterChip>
            ))}
          </div>
        </FilterBar>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <span className="text-[13px] font-bold text-metro-navy">
                Permissões de Trabalho
                <span className="text-metro-muted font-normal ml-2 text-xs">— {filtered.length} registros</span>
              </span>
            </div>

            {loading ? (
              <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p>
            ) : (
              <>
                <DataTable
                  headers={['Tipo', 'Atividade', 'Local', 'Início', 'Responsável SST', 'Status', '']}
                  empty="Nenhuma permissão emitida."
                >
                  {paginated.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <Td>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${TIPO_STYLES[r.tipo] ?? 'bg-slate-100 text-slate-600'}`}>
                          {TIPO_LABEL[r.tipo] ?? r.tipo}
                        </span>
                      </Td>
                      <Td className="max-w-[200px]">
                        <p className="font-semibold text-metro-text text-[13px] leading-tight truncate">{r.atividade}</p>
                      </Td>
                      <Td className="text-[12px] text-metro-muted max-w-[140px] truncate">{r.local || '—'}</Td>
                      <Td className="text-[12px] text-metro-muted whitespace-nowrap">
                        {r.data_inicio ? new Date(r.data_inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      </Td>
                      <Td className="text-[12px] text-metro-muted">{r.responsavel_sst || '—'}</Td>
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

          <SidePanel open={showForm} title="Nova PT / APR" icon="clipboard-check" onClose={() => setShowForm(false)}>
            <PermissaoForm onSaved={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
          </SidePanel>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Atualizar `src/router.jsx`**

Adicionar import:
```jsx
import PermissoesPage from './pages/seguranca/Permissoes/PermissoesPage'
```

Substituir:
```jsx
{ path: 'seguranca/permissoes', element: <ComingSoon modulo="Permissões de Trabalho" /> },
```
Por:
```jsx
{ path: 'seguranca/permissoes', element: <PermissoesPage /> },
```

- [ ] **Step 4: Rodar testes e commit**

```bash
npm run test:run
git add src/pages/seguranca/Permissoes/PermissoesPage.jsx src/pages/seguranca/Permissoes/PermissaoForm.jsx src/router.jsx
git commit -m "feat: módulo Permissões de Trabalho (APR/PT) para atividades críticas"
```

---

## Task 5: Testes finais e build Fase 3

- [ ] **Step 1: Suite completa**

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
git commit -m "feat: Fase 3 completa — Absenteísmo, PCMSO, Inspeções e Permissões de Trabalho"
```

---

## Próximos Passos

**Fase 4** — CIPA, Laudos/PGR, Ficha Completa do Funcionário (prontuário 360°), Exportações PDF/CSV
