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
