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
