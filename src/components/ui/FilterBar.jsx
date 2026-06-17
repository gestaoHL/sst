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
