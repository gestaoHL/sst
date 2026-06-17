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
