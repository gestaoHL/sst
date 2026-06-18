function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    const key = prefix ? `${prefix}_${k}` : k
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      return { ...acc, ...flatten(v, key) }
    }
    return { ...acc, [key]: v }
  }, {})
}

export function exportCsv(rows, filename) {
  if (!rows || rows.length === 0) return
  const flat = rows.map((r) => flatten(r))
  const headers = Object.keys(flat[0])
  const escape = (val) => {
    const s = String(val ?? '')
    return s.includes(',') || s.includes('\n') || s.includes('"')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const csv = [headers.join(','), ...flat.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
