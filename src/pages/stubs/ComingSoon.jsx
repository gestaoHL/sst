export default function ComingSoon({ modulo }) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <i className="fa-solid fa-hammer text-metro-primary text-4xl mb-4 block" />
        <h2 className="text-metro-navy font-bold text-lg mb-2">{modulo}</h2>
        <p className="text-metro-muted text-sm">Este módulo será implementado em breve.</p>
      </div>
    </div>
  )
}
