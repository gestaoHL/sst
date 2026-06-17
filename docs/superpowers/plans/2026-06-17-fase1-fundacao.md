# SST Metro-DF — Fase 1: Fundação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o app de 3 abas por uma plataforma com sidebar fixa, design system Metro-DF, autenticação com perfis SESMT/Gestor e o módulo ASO migrado para o novo layout.

**Architecture:** React 18 + Vite com Tailwind CSS configurado com os tokens exatos do Metro-DF (`#183C72` navy, `#506F9B` primary, `#FEB538` accent, Inter font). React Router v6 com layout route protegido. Supabase Auth + tabela `perfil` para papéis. Todos os outros módulos serão stubs de rota que serão implementados nas Fases 2–4.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, React Router v6, Supabase JS v2, Vitest, @testing-library/react, Font Awesome 6 (CDN), Inter (Google Fonts CDN)

---

## Mapa de Arquivos

### Criar
| Arquivo | Responsabilidade |
|---|---|
| `tailwind.config.js` | Tokens de cor e fonte do Metro-DF |
| `postcss.config.js` | Pipeline Tailwind + autoprefixer |
| `src/index.css` | Diretivas @tailwind |
| `src/test/setup.js` | Configuração global do Vitest |
| `src/contexts/AuthContext.jsx` | Provider de sessão + perfil |
| `src/hooks/useAuth.js` | Acesso ao AuthContext |
| `src/hooks/useRole.js` | isSesmt, isGestor, setorId |
| `src/components/auth/ProtectedRoute.jsx` | Redireciona para /login se sem sessão |
| `src/components/layout/AppShell.jsx` | Sidebar + gradient bar + Outlet |
| `src/components/layout/Sidebar.jsx` | Navegação lateral azul-marinho |
| `src/components/layout/Topbar.jsx` | Barra superior com breadcrumb e ações |
| `src/components/ui/Button.jsx` | Botão (primary / outline / ghost, sm / md) |
| `src/components/ui/Badge.jsx` | Badge de situação colorida |
| `src/components/ui/Table.jsx` | `<DataTable>` + `<Th>` + `<Td>` |
| `src/components/ui/Pagination.jsx` | Controles de paginação |
| `src/components/ui/FormControl.jsx` | Label + input/select/textarea |
| `src/components/ui/SidePanel.jsx` | Painel lateral deslizante |
| `src/components/ui/FilterBar.jsx` | Busca + selects + chips |
| `src/components/ui/Card.jsx` | Card genérico + KpiCard |
| `src/pages/auth/Login.jsx` | Tela de login Metro-DF |
| `src/pages/Dashboard/Dashboard.jsx` | KPIs + painéis (stub conectado ao Supabase) |
| `src/pages/saude/Aso/AsoPage.jsx` | Lista paginada de ASOs com filtros |
| `src/pages/saude/Aso/AsoForm.jsx` | Formulário de novo ASO no SidePanel |
| `src/pages/stubs/ComingSoon.jsx` | Placeholder para módulos das Fases 2–4 |
| `src/router.jsx` | Definição de todas as rotas |
| `src/__tests__/Button.test.jsx` | Testes do Button |
| `src/__tests__/Badge.test.jsx` | Testes do Badge |
| `src/__tests__/useRole.test.js` | Testes do useRole |
| `src/__tests__/ProtectedRoute.test.jsx` | Testes do ProtectedRoute |

### Modificar
| Arquivo | O que muda |
|---|---|
| `package.json` | Adicionar tailwind, postcss, autoprefixer, vitest, @testing-library/* |
| `vite.config.js` | Adicionar bloco `test` para Vitest |
| `src/main.jsx` | Importar index.css, RouterProvider, AuthProvider |
| `src/App.jsx` | Remover — substituído por router.jsx |
| `index.html` | Adicionar link do Font Awesome CDN |

---

## Task 1: Instalar dependências e configurar Tailwind

**Files:**
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/index.css`
- Modify: `package.json`
- Modify: `vite.config.js`
- Modify: `index.html`

- [ ] **Step 1: Instalar Tailwind, PostCSS e autoprefixer**

```bash
npm install -D tailwindcss postcss autoprefixer
```

Expected output: packages adicionados sem erros.

- [ ] **Step 2: Instalar Vitest e React Testing Library**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Criar `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        metro: {
          navy:    '#183C72',
          primary: '#506F9B',
          dark:    '#3A5275',
          accent:  '#FEB538',
          orange:  '#FF8C00',
          text:    '#3F3F3F',
          muted:   '#767676',
          bg:      '#FAFAFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Criar `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: Criar `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: Atualizar `vite.config.js` com configuração de test**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
})
```

- [ ] **Step 7: Criar `src/test/setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Adicionar Font Awesome e Inter ao `index.html`**

Adicionar dentro de `<head>`, antes de `</head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

- [ ] **Step 9: Adicionar script de test ao `package.json`**

No bloco `"scripts"`, adicionar:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 10: Verificar que Tailwind está funcionando**

Temporariamente, em `src/App.jsx`, substituir o retorno por:
```jsx
export default function App() {
  return <div className="bg-metro-navy text-white p-8 font-sans">Tailwind Metro-DF OK</div>
}
```

Rodar `npm run dev` e confirmar fundo azul `#183C72` com texto branco em Inter.

- [ ] **Step 11: Commit**

```bash
git add tailwind.config.js postcss.config.js src/index.css vite.config.js src/test/setup.js index.html package.json package-lock.json src/App.jsx
git commit -m "chore: setup tailwind com tokens Metro-DF e vitest"
```

---

## Task 2: Componentes UI — Button e Badge

**Files:**
- Create: `src/components/ui/Button.jsx`
- Create: `src/components/ui/Badge.jsx`
- Create: `src/__tests__/Button.test.jsx`
- Create: `src/__tests__/Badge.test.jsx`

- [ ] **Step 1: Escrever teste do Button (falha esperada)**

```jsx
// src/__tests__/Button.test.jsx
import { render, screen } from '@testing-library/react'
import Button from '../components/ui/Button'

test('renderiza texto do botão', () => {
  render(<Button>Salvar</Button>)
  expect(screen.getByText('Salvar')).toBeInTheDocument()
})

test('variante primary tem classe bg-metro-primary', () => {
  render(<Button variant="primary">OK</Button>)
  expect(screen.getByText('OK')).toHaveClass('bg-metro-primary')
})

test('variante outline tem borda metro-primary', () => {
  render(<Button variant="outline">Cancelar</Button>)
  expect(screen.getByText('Cancelar')).toHaveClass('border-metro-primary')
})

test('renderiza ícone quando prop icon fornecida', () => {
  render(<Button icon="plus">Novo</Button>)
  expect(document.querySelector('.fa-plus')).toBeInTheDocument()
})
```

- [ ] **Step 2: Rodar teste para confirmar falha**

```bash
npm run test:run -- --reporter=verbose src/__tests__/Button.test.jsx
```

Expected: FAIL — `Cannot find module '../components/ui/Button'`

- [ ] **Step 3: Criar `src/components/ui/Button.jsx`**

```jsx
const VARIANTS = {
  primary: 'bg-metro-primary hover:bg-metro-dark text-white',
  outline: 'bg-white hover:bg-gray-50 text-metro-primary border-[1.5px] border-metro-primary',
  ghost:   'bg-transparent hover:bg-metro-bg text-metro-muted',
}
const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
}

export default function Button({ variant = 'primary', size = 'md', icon, children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center rounded-md font-semibold transition-colors cursor-pointer font-sans ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {icon && <i className={`fa-solid fa-${icon}`} />}
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Rodar teste Button para confirmar PASS**

```bash
npm run test:run -- --reporter=verbose src/__tests__/Button.test.jsx
```

Expected: 4 testes PASS.

- [ ] **Step 5: Escrever teste do Badge (falha esperada)**

```jsx
// src/__tests__/Badge.test.jsx
import { render, screen } from '@testing-library/react'
import Badge from '../components/ui/Badge'

test('renderiza texto do badge', () => {
  render(<Badge status="vencido">Vencido</Badge>)
  expect(screen.getByText('Vencido')).toBeInTheDocument()
})

test('status vencido tem classe bg-red-50', () => {
  render(<Badge status="vencido">Vencido</Badge>)
  expect(screen.getByText('Vencido')).toHaveClass('bg-red-50')
})

test('status ok tem classe bg-green-50', () => {
  render(<Badge status="ok">Regular</Badge>)
  expect(screen.getByText('Regular')).toHaveClass('bg-green-50')
})

test('status desconhecido usa classe padrão cinza', () => {
  render(<Badge status="outro">Outro</Badge>)
  expect(screen.getByText('Outro')).toHaveClass('bg-gray-100')
})
```

- [ ] **Step 6: Criar `src/components/ui/Badge.jsx`**

```jsx
const STYLES = {
  vencido:  'bg-red-50 text-red-600',
  vence_30: 'bg-orange-50 text-orange-600',
  vence_60: 'bg-yellow-50 text-yellow-600',
  vence_90: 'bg-blue-50 text-blue-600',
  ok:       'bg-green-50 text-green-600',
  sem_aso:  'bg-gray-100 text-gray-500',
}

export default function Badge({ status, children, className = '' }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STYLES[status] ?? 'bg-gray-100 text-gray-500'} ${className}`}>
      {children}
    </span>
  )
}
```

- [ ] **Step 7: Rodar todos os testes para confirmar PASS**

```bash
npm run test:run
```

Expected: 8 testes PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/Button.jsx src/components/ui/Badge.jsx src/__tests__/Button.test.jsx src/__tests__/Badge.test.jsx
git commit -m "feat: componentes UI Button e Badge com tokens Metro-DF"
```

---

## Task 3: Componentes UI — Table, Pagination, Card

**Files:**
- Create: `src/components/ui/Table.jsx`
- Create: `src/components/ui/Pagination.jsx`
- Create: `src/components/ui/Card.jsx`

- [ ] **Step 1: Criar `src/components/ui/Table.jsx`**

```jsx
export function Th({ children, className = '' }) {
  return (
    <th className={`text-left px-4 py-2.5 text-[11px] font-semibold text-metro-muted uppercase tracking-wide border-b border-gray-100 bg-slate-50 ${className}`}>
      {children}
    </th>
  )
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 border-b border-gray-50 align-middle ${className}`}>
      {children}
    </td>
  )
}

export function DataTable({ headers, children, empty = 'Nenhum registro encontrado.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px] text-metro-text">
        <thead>
          <tr>
            {headers.map((h) => <Th key={h}>{h}</Th>)}
          </tr>
        </thead>
        <tbody>
          {children ?? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-6 text-center text-metro-muted text-sm">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Criar `src/components/ui/Pagination.jsx`**

```jsx
export default function Pagination({ page, total, perPage = 20, onPage }) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (page <= 3) return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span className="text-xs text-metro-muted">
        {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total} registros
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="px-2.5 py-1 rounded border border-gray-200 text-xs text-metro-text disabled:opacity-40 hover:bg-metro-bg"
        >‹</button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`px-2.5 py-1 rounded border text-xs ${p === page ? 'bg-metro-primary text-white border-metro-primary' : 'border-gray-200 text-metro-text hover:bg-metro-bg'}`}
          >{p}</button>
        ))}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="px-2.5 py-1 rounded border border-gray-200 text-xs text-metro-text disabled:opacity-40 hover:bg-metro-bg"
        >›</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Criar `src/components/ui/Card.jsx`**

```jsx
export function Card({ title, icon, action, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[13px] font-bold text-metro-navy flex items-center gap-2">
            {icon && <i className={`fa-solid fa-${icon} text-metro-primary`} />}
            {title}
          </h3>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function KpiCard({ label, value, sub, color = 'blue' }) {
  const borders = {
    red:   'border-t-red-500',
    amber: 'border-t-orange-500',
    blue:  'border-t-metro-primary',
    green: 'border-t-green-600',
  }
  const values = {
    red:   'text-red-600',
    amber: 'text-orange-500',
    blue:  'text-metro-primary',
    green: 'text-green-600',
  }
  return (
    <div className={`bg-white rounded-xl border border-gray-100 border-t-4 ${borders[color]} px-5 py-4`}>
      <p className="text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">{label}</p>
      <p className={`text-3xl font-bold leading-none mb-1 ${values[color]}`}>{value}</p>
      {sub && <p className="text-[11px] text-metro-muted">{sub}</p>}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Table.jsx src/components/ui/Pagination.jsx src/components/ui/Card.jsx
git commit -m "feat: componentes UI Table, Pagination e Card"
```

---

## Task 4: Componentes UI — FormControl, SidePanel, FilterBar

**Files:**
- Create: `src/components/ui/FormControl.jsx`
- Create: `src/components/ui/SidePanel.jsx`
- Create: `src/components/ui/FilterBar.jsx`

- [ ] **Step 1: Criar `src/components/ui/FormControl.jsx`**

```jsx
const base = 'w-full px-3 py-2 border-[1.5px] border-gray-200 rounded-md text-[13px] text-metro-text bg-white outline-none transition-colors focus:border-metro-primary font-sans'

export function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">{label}</label>}
      <input className={base} {...props} />
    </div>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">{label}</label>}
      <select className={base} {...props}>{children}</select>
    </div>
  )
}

export function Textarea({ label, rows = 3, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">{label}</label>}
      <textarea className={`${base} resize-none`} rows={rows} {...props} />
    </div>
  )
}
```

- [ ] **Step 2: Criar `src/components/ui/SidePanel.jsx`**

```jsx
export default function SidePanel({ open, title, icon, onClose, footer, children }) {
  if (!open) return null
  return (
    <div className="w-[380px] bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col flex-shrink-0">
      <div className="bg-metro-navy px-5 py-3.5 flex items-center justify-between">
        <h3 className="text-white text-[13px] font-bold flex items-center gap-2">
          {icon && <i className={`fa-solid fa-${icon} text-metro-accent`} />}
          {title}
        </h3>
        <button onClick={onClose} className="text-white/50 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-sm">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3.5 border-t border-gray-100 flex gap-2 justify-end">
          {footer}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Criar `src/components/ui/FilterBar.jsx`**

```jsx
export default function FilterBar({ children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex gap-3 items-center flex-wrap mb-4">
      {children}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="flex items-center gap-2 bg-metro-bg border border-gray-200 rounded-md px-3 py-1.5 flex-1 min-w-[200px]">
      <i className="fa-solid fa-search text-metro-muted text-xs" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-none bg-transparent text-[12px] text-metro-text outline-none w-full font-sans"
      />
    </div>
  )
}

export function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-200 rounded-md px-3 py-1.5 text-[12px] text-metro-text bg-metro-bg outline-none cursor-pointer font-sans"
    >
      {children}
    </select>
  )
}

export function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer font-sans ${
        active
          ? 'bg-metro-primary text-white border-metro-primary'
          : 'bg-white text-metro-muted border-gray-200 hover:border-metro-primary hover:text-metro-primary'
      }`}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/FormControl.jsx src/components/ui/SidePanel.jsx src/components/ui/FilterBar.jsx
git commit -m "feat: componentes UI FormControl, SidePanel e FilterBar"
```

---

## Task 5: Layout — AppShell, Sidebar, Topbar

**Files:**
- Create: `src/components/layout/AppShell.jsx`
- Create: `src/components/layout/Sidebar.jsx`
- Create: `src/components/layout/Topbar.jsx`

- [ ] **Step 1: Criar `src/components/layout/Sidebar.jsx`**

```jsx
import { NavLink } from 'react-router-dom'

const NAV = [
  {
    items: [{ icon: 'gauge',       label: 'Dashboard',   to: '/dashboard' }],
  },
  {
    section: 'Saúde Ocupacional',
    items: [
      { icon: 'file-medical',    label: 'ASO / Exames',   to: '/saude/aso' },
      { icon: 'heart-pulse',     label: 'PCMSO',          to: '/saude/pcmso' },
      { icon: 'calendar-xmark',  label: 'Absenteísmo',    to: '/saude/absenteismo' },
    ],
  },
  {
    section: 'Segurança',
    items: [
      { icon: 'triangle-exclamation', label: 'Acidentes / CAT',       to: '/seguranca/acidentes' },
      { icon: 'magnifying-glass',      label: 'Inspeções',             to: '/seguranca/inspecoes' },
      { icon: 'clipboard-check',       label: 'Permissões de Trabalho', to: '/seguranca/permissoes' },
    ],
  },
  {
    section: 'Gestão',
    items: [
      { icon: 'helmet-safety',  label: 'EPIs',         to: '/epi' },
      { icon: 'graduation-cap', label: 'Treinamentos', to: '/treinamentos' },
      { icon: 'scale-balanced', label: 'CIPA',         to: '/cipa' },
      { icon: 'folder-open',    label: 'Laudos / PGR', to: '/laudos' },
    ],
  },
  {
    section: 'Cadastros',
    items: [
      { icon: 'users', label: 'Funcionários', to: '/funcionarios' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="w-[240px] bg-metro-navy flex flex-col h-screen overflow-y-auto flex-shrink-0">
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="bg-metro-accent text-metro-navy font-bold text-[11px] px-2 py-1 rounded tracking-wide">
            METRO-DF
          </span>
          <div>
            <div className="text-white font-semibold text-[13px] leading-tight">SST</div>
            <div className="text-white/40 text-[10px]">Saúde e Segurança</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-2">
        {NAV.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.section && (
              <p className="px-4 py-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                {group.section}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-2 text-[13px] border-l-[3px] transition-colors ${
                    isActive
                      ? 'bg-metro-primary/30 text-white border-metro-accent font-semibold'
                      : 'text-white/60 border-transparent hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <i className={`fa-solid fa-${item.icon} w-4 text-center text-[12px]`} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Criar `src/components/layout/Topbar.jsx`**

```jsx
export default function Topbar({ breadcrumb, title, actions }) {
  return (
    <div className="bg-white border-b border-gray-100 px-6 h-[52px] flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-1.5 text-[15px] font-bold text-metro-navy">
        {breadcrumb && (
          <>
            <span className="font-normal text-metro-muted text-[13px]">{breadcrumb}</span>
            <span className="text-gray-300 mx-0.5">/</span>
          </>
        )}
        {title}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  )
}
```

- [ ] **Step 3: Criar `src/components/layout/AppShell.jsx`**

```jsx
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-metro-bg font-sans text-metro-text">
      <Sidebar />
      <main className="flex flex-col flex-1 overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-metro-navy via-metro-primary to-metro-accent flex-shrink-0" />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/AppShell.jsx src/components/layout/Sidebar.jsx src/components/layout/Topbar.jsx
git commit -m "feat: layout AppShell, Sidebar e Topbar com design Metro-DF"
```

---

## Task 6: Autenticação — AuthContext, hooks e ProtectedRoute

**Files:**
- Create: `src/contexts/AuthContext.jsx`
- Create: `src/hooks/useAuth.js`
- Create: `src/hooks/useRole.js`
- Create: `src/components/auth/ProtectedRoute.jsx`
- Create: `src/__tests__/useRole.test.js`
- Create: `src/__tests__/ProtectedRoute.test.jsx`

- [ ] **Step 1: Escrever teste do useRole (falha esperada)**

```js
// src/__tests__/useRole.test.js
import { renderHook } from '@testing-library/react'
import { AuthContext } from '../contexts/AuthContext'
import { useRole } from '../hooks/useRole'

function wrapper(perfil) {
  return ({ children }) => (
    <AuthContext.Provider value={{ session: {}, perfil, loading: false }}>
      {children}
    </AuthContext.Provider>
  )
}

test('isSesmt true quando papel é sesmt', () => {
  const { result } = renderHook(() => useRole(), {
    wrapper: wrapper({ papel: 'sesmt', setor_id: null }),
  })
  expect(result.current.isSesmt).toBe(true)
  expect(result.current.isGestor).toBe(false)
})

test('isGestor true quando papel é gestor', () => {
  const { result } = renderHook(() => useRole(), {
    wrapper: wrapper({ papel: 'gestor', setor_id: 5 }),
  })
  expect(result.current.isGestor).toBe(true)
  expect(result.current.setorId).toBe(5)
})

test('setorId null quando sesmt', () => {
  const { result } = renderHook(() => useRole(), {
    wrapper: wrapper({ papel: 'sesmt', setor_id: null }),
  })
  expect(result.current.setorId).toBeNull()
})
```

- [ ] **Step 2: Rodar teste para confirmar falha**

```bash
npm run test:run -- --reporter=verbose src/__tests__/useRole.test.js
```

Expected: FAIL — `Cannot find module '../contexts/AuthContext'`

- [ ] **Step 3: Criar `src/contexts/AuthContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadPerfil(userId) {
    const { data } = await supabase
      .from('perfil')
      .select('*')
      .eq('id', userId)
      .single()
    setPerfil(data)
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadPerfil(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadPerfil(session.user.id)
      else { setPerfil(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, perfil, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
```

- [ ] **Step 4: Criar `src/hooks/useAuth.js`**

```js
import { useAuthContext } from '../contexts/AuthContext'
export const useAuth = useAuthContext
```

- [ ] **Step 5: Criar `src/hooks/useRole.js`**

```js
import { useAuth } from './useAuth'

export function useRole() {
  const { perfil } = useAuth()
  return {
    isSesmt:  perfil?.papel === 'sesmt',
    isGestor: perfil?.papel === 'gestor',
    setorId:  perfil?.setor_id ?? null,
  }
}
```

- [ ] **Step 6: Rodar teste useRole para confirmar PASS**

```bash
npm run test:run -- --reporter=verbose src/__tests__/useRole.test.js
```

Expected: 3 testes PASS.

- [ ] **Step 7: Criar `src/components/auth/ProtectedRoute.jsx`**

```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen font-sans text-metro-muted">
        Carregando...
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  return children
}
```

- [ ] **Step 8: Escrever e rodar teste do ProtectedRoute**

```jsx
// src/__tests__/ProtectedRoute.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import ProtectedRoute from '../components/auth/ProtectedRoute'

function wrap(session, loading, children) {
  return (
    <AuthContext.Provider value={{ session, loading, perfil: null }}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={<ProtectedRoute>{children}</ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

test('mostra conteúdo quando autenticado', () => {
  render(wrap({ user: 'x' }, false, <div>Conteúdo Protegido</div>))
  expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument()
})

test('redireciona para /login quando sem sessão', () => {
  render(wrap(null, false, <div>Conteúdo Protegido</div>))
  expect(screen.getByText('Login Page')).toBeInTheDocument()
})

test('mostra loading quando ainda carregando', () => {
  render(wrap(null, true, <div>Conteúdo</div>))
  expect(screen.getByText('Carregando...')).toBeInTheDocument()
})
```

```bash
npm run test:run -- --reporter=verbose src/__tests__/ProtectedRoute.test.jsx
```

Expected: 3 testes PASS.

- [ ] **Step 9: Commit**

```bash
git add src/contexts/AuthContext.jsx src/hooks/useAuth.js src/hooks/useRole.js src/components/auth/ProtectedRoute.jsx src/__tests__/useRole.test.js src/__tests__/ProtectedRoute.test.jsx
git commit -m "feat: autenticação com AuthContext, useAuth, useRole e ProtectedRoute"
```

---

## Task 7: Página de Login

**Files:**
- Create: `src/pages/auth/Login.jsx`

- [ ] **Step 1: Criar `src/pages/auth/Login.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha inválidos.')
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-metro-navy flex items-center justify-center font-sans">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="inline-block bg-metro-accent text-metro-navy font-bold text-sm px-4 py-2 rounded-md tracking-widest mb-3">
            METRO-DF
          </span>
          <h1 className="text-white text-xl font-bold">Saúde e Segurança do Trabalho</h1>
          <p className="text-white/40 text-sm mt-1">Acesso restrito a colaboradores</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <h2 className="text-metro-navy text-[15px] font-bold mb-6">Entrar na plataforma</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">
                E-mail corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border-[1.5px] border-gray-200 rounded-md text-[13px] outline-none focus:border-metro-primary transition-colors font-sans"
                placeholder="seu@metro.df.gov.br"
              />
            </div>
            <div className="mb-6">
              <label className="block text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-3 py-2 border-[1.5px] border-gray-200 rounded-md text-[13px] outline-none focus:border-metro-primary transition-colors font-sans"
                placeholder="••••••••"
              />
            </div>
            {erro && (
              <p className="text-red-600 text-xs mb-4 bg-red-50 px-3 py-2 rounded-md">{erro}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-metro-primary hover:bg-metro-dark text-white font-semibold py-2.5 rounded-md text-sm transition-colors disabled:opacity-60 cursor-pointer font-sans"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          SST Metro-DF · Acesso controlado pelo SESMT
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/auth/Login.jsx
git commit -m "feat: página de login com identidade Metro-DF"
```

---

## Task 8: Roteador e stubs

**Files:**
- Create: `src/pages/stubs/ComingSoon.jsx`
- Create: `src/router.jsx`
- Modify: `src/main.jsx`
- Modify: `src/App.jsx` → substituir pelo roteador

- [ ] **Step 1: Criar `src/pages/stubs/ComingSoon.jsx`**

```jsx
export default function ComingSoon({ modulo }) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <i className="fa-solid fa-hammer text-metro-primary text-4xl mb-4 block" />
        <h2 className="text-metro-navy font-bold text-lg mb-2">{modulo}</h2>
        <p className="text-metro-muted text-sm">Este módulo será implementado em breve.</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Criar `src/router.jsx`**

```jsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './pages/auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import AsoPage from './pages/saude/Aso/AsoPage'
import ComingSoon from './pages/stubs/ComingSoon'

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard',               element: <Dashboard /> },
      { path: 'saude/aso',               element: <AsoPage /> },
      { path: 'saude/pcmso',             element: <ComingSoon modulo="PCMSO" /> },
      { path: 'saude/absenteismo',        element: <ComingSoon modulo="Absenteísmo" /> },
      { path: 'seguranca/acidentes',     element: <ComingSoon modulo="Acidentes / CAT" /> },
      { path: 'seguranca/inspecoes',     element: <ComingSoon modulo="Inspeções" /> },
      { path: 'seguranca/permissoes',    element: <ComingSoon modulo="Permissões de Trabalho" /> },
      { path: 'epi',                     element: <ComingSoon modulo="Gestão de EPIs" /> },
      { path: 'treinamentos',            element: <ComingSoon modulo="Treinamentos" /> },
      { path: 'cipa',                    element: <ComingSoon modulo="CIPA" /> },
      { path: 'laudos',                  element: <ComingSoon modulo="Laudos / PGR" /> },
      { path: 'funcionarios',            element: <ComingSoon modulo="Funcionários" /> },
    ],
  },
])
```

- [ ] **Step 3: Substituir `src/App.jsx`**

```jsx
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthProvider } from './contexts/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
```

- [ ] **Step 4: Atualizar `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 5: Instalar react-router-dom**

```bash
npm install react-router-dom
```

- [ ] **Step 6: Rodar dev e confirmar que `/login` abre com layout Metro-DF**

```bash
npm run dev
```

Abrir `http://localhost:5173` — deve redirecionar para `/login` com fundo azul-marinho e card de login centralizado.

- [ ] **Step 7: Commit**

```bash
git add src/router.jsx src/pages/stubs/ComingSoon.jsx src/App.jsx src/main.jsx package.json package-lock.json
git commit -m "feat: roteamento com React Router, layout protegido e stubs de módulos"
```

---

## Task 9: Dashboard

**Files:**
- Create: `src/pages/Dashboard/Dashboard.jsx`

- [ ] **Step 1: Criar `src/pages/Dashboard/Dashboard.jsx`**

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
  const [kpis, setKpis] = useState({ vencidos: 0, vence30: 0, vence60: 0 })

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
        setKpis({
          vencidos: rows.filter((r) => r.situacao === 'vencido').length,
          vence30:  rows.filter((r) => r.situacao === 'vence_30').length,
          vence60:  rows.filter((r) => r.situacao === 'vence_60').length,
        })
      })
  }, [])

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-6">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard label="ASOs Vencidos"      value={kpis.vencidos} sub="Exige ação imediata" color="red" />
        <KpiCard label="Vencem em 30 dias"  value={kpis.vence30}  sub="Agendar exames"      color="amber" />
        <KpiCard label="Vencem em 60 dias"  value={kpis.vence60}  sub="Planejar agendamento" color="blue" />
        <KpiCard label="Módulos Ativos"     value="1"             sub="Fase 1 — ASO"         color="green" />
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

        <Card title="Ocorrências Recentes" icon="triangle-exclamation">
          <p className="px-5 py-6 text-metro-muted text-sm text-center">
            Módulo de Acidentes disponível na Fase 2.
          </p>
        </Card>
      </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Testar no browser**

Fazer login e acessar `/dashboard`. Confirmar: 4 KPI cards, painel de ASOs críticos carregando dados do Supabase, painel de ocorrências com mensagem de fase.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard/Dashboard.jsx
git commit -m "feat: dashboard com KPIs e painel de ASOs críticos"
```

---

## Task 10: Migrar módulo ASO para novo layout

**Files:**
- Create: `src/pages/saude/Aso/AsoPage.jsx`
- Create: `src/pages/saude/Aso/AsoForm.jsx`

- [ ] **Step 1: Criar `src/pages/saude/Aso/AsoForm.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Input, Select, Textarea } from '../../../components/ui/FormControl'
import Button from '../../../components/ui/Button'

const TIPOS = [
  { value: 'periodico',          label: 'Periódico' },
  { value: 'admissional',        label: 'Admissional' },
  { value: 'demissional',        label: 'Demissional' },
  { value: 'retorno_ao_trabalho',label: 'Retorno ao Trabalho' },
  { value: 'mudanca_de_funcao',  label: 'Mudança de Função' },
  { value: 'monitoracao_pontual',label: 'Monitoração Pontual' },
]

const RESULTADOS = [
  { value: 'apto',              label: 'Apto' },
  { value: 'apto_com_restricao',label: 'Apto com Restrição' },
  { value: 'inapto',            label: 'Inapto' },
]

export default function AsoForm({ onSaved, onCancel }) {
  const [funcionarios, setFuncionarios] = useState([])
  const [form, setForm] = useState({
    funcionario_id: '',
    tipo: 'periodico',
    data_realizacao: new Date().toISOString().slice(0, 10),
    resultado: 'apto',
    restricoes: '',
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
    setSaving(true); setErro(null)
    const { error } = await supabase.from('aso').insert(form)
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

      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo" value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
        <Input label="Data de Realização" type="date" value={form.data_realizacao} onChange={(e) => set('data_realizacao', e.target.value)} />
      </div>

      <div className="mb-4">
        <label className="block text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">Resultado</label>
        <div className="flex gap-2">
          {RESULTADOS.map((r) => (
            <button
              key={r.value}
              onClick={() => set('resultado', r.value)}
              className={`flex-1 py-2 rounded-md border-2 text-xs font-semibold transition-colors font-sans cursor-pointer ${
                form.resultado === r.value
                  ? r.value === 'apto'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : r.value === 'apto_com_restricao'
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 text-metro-muted hover:border-gray-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <Textarea label="Restrições / Observações" value={form.restricoes} onChange={(e) => set('restricoes', e.target.value)} placeholder="Descreva restrições ou observações..." rows={3} />

      {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md mb-3">{erro}</p>}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="check" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar ASO'}
        </Button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Criar `src/pages/saude/Aso/AsoPage.jsx`**

```jsx
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
```

- [ ] **Step 3: Testar no browser**

Navegar para `/saude/aso`. Confirmar:
- Tabela carrega dados do Supabase com badges coloridas
- Filtros "Vencidos" / "30 dias" filtram corretamente
- Botão "Novo ASO" abre painel lateral com formulário
- Salvar ASO fecha painel e recarrega a lista

- [ ] **Step 4: Commit**

```bash
git add src/pages/saude/Aso/AsoPage.jsx src/pages/saude/Aso/AsoForm.jsx
git commit -m "feat: módulo ASO migrado para novo layout com sidebar e design Metro-DF"
```

---

## Task 11: Rodar todos os testes e verificação final

- [ ] **Step 1: Rodar suite de testes completa**

```bash
npm run test:run
```

Expected: todos os testes PASS (Button ×4, Badge ×4, useRole ×3, ProtectedRoute ×3 = 14 testes).

- [ ] **Step 2: Verificar build de produção**

```bash
npm run build
```

Expected: build sem erros, pasta `dist/` gerada.

- [ ] **Step 3: Verificar rotas no browser**

- `/` → redireciona para `/login`
- `/login` → tela de login Metro-DF
- Após login → `/dashboard` com KPIs
- `/saude/aso` → tabela de ASOs com filtros e formulário lateral
- `/treinamentos` → stub "Em breve" com ícone de martelo

- [ ] **Step 4: Commit final da Fase 1**

```bash
git add -A
git commit -m "feat: Fase 1 completa — fundação SST Metro-DF com design system, auth e módulo ASO"
```

---

## Próximos Passos

Após a Fase 1 aprovada e funcionando, os planos seguintes são:

- **Fase 2** — Dashboard completo, Acidentes/CAT, Gestão de EPIs, Treinamentos
- **Fase 3** — Permissões de Trabalho (APR/PT), Inspeções, Absenteísmo, PCMSO
- **Fase 4** — CIPA, Laudos/PGR, Ficha Completa do Funcionário (prontuário 360°)
