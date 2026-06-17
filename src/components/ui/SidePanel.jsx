export default function SidePanel({ open, title, icon, onClose, footer, children }) {
  if (!open) return null
  return (
    <div className="w-[380px] bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col flex-shrink-0">
      <div className="bg-metro-navy px-5 py-3.5 flex items-center justify-between">
        <h3 className="text-white text-[13px] font-bold flex items-center gap-2">
          {icon && <i className={`fa-solid fa-${icon} text-metro-accent`} />}
          {title}
        </h3>
        <button onClick={onClose} className="text-white/50 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-sm">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3.5 border-t border-gray-100 flex gap-2 justify-end">
          {footer}
        </div>
      )}
    </div>
  )
}
