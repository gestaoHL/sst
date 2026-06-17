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
