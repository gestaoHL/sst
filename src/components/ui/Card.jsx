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
