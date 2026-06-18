const base = 'w-full px-3 py-2 border-[1.5px] border-gray-200 rounded-md text-[13px] text-metro-text bg-white outline-none transition-colors focus:border-metro-primary font-sans'

export function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">{label}</label>}
      <input className={base} {...props} />
    </div>
  )
}

// DateInput: exibe DD/MM/AAAA, armazena YYYY-MM-DD (ISO)
export function DateInput({ label, value, onChange, ...props }) {
  function toDisplay(iso) {
    if (!iso) return ''
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }

  function toIso(display) {
    const clean = display.replace(/\D/g, '')
    if (clean.length === 8) {
      return `${clean.slice(4)}-${clean.slice(2, 4)}-${clean.slice(0, 2)}`
    }
    return ''
  }

  function handleChange(e) {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 8)
    let formatted = raw
    if (raw.length > 4) formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`
    else if (raw.length > 2) formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`
    onChange({ target: { value: toIso(raw) } })
    e.target.value = formatted
  }

  return (
    <div className="mb-4">
      {label && <label className="block text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">{label}</label>}
      <input
        className={base}
        type="text"
        placeholder="DD/MM/AAAA"
        defaultValue={toDisplay(value)}
        key={value}
        onChange={handleChange}
        maxLength={10}
        {...props}
      />
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
