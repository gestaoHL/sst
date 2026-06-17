import { useState } from 'react'
import Vencimentos from './pages/Vencimentos.jsx'
import Funcionarios from './pages/Funcionarios.jsx'
import NovoAso from './pages/NovoAso.jsx'

const tabs = [
  { id: 'vencimentos', label: 'Vencimentos', Comp: Vencimentos },
  { id: 'funcionarios', label: 'Funcionarios', Comp: Funcionarios },
  { id: 'novo-aso', label: 'Novo ASO', Comp: NovoAso },
]

export default function App() {
  const [tab, setTab] = useState('vencimentos')
  const Active = tabs.find((t) => t.id === tab).Comp
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: 20 }}>Saude Ocupacional &middot; SST Metro-DF</h1>
      <nav style={{ display: 'flex', gap: 8, margin: '12px 0', borderBottom: '1px solid #ddd' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 12px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: tab === t.id ? 600 : 400,
              borderBottom: tab === t.id ? '2px solid #0a7d4b' : '2px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <Active />
    </div>
  )
}
