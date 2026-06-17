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
