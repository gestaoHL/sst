export default function Topbar({ breadcrumb, title, actions }) {
  return (
    <div className="bg-white border-b border-gray-100 px-6 h-[52px] flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-1.5 text-[15px] font-bold text-metro-navy">
        {breadcrumb && (
          <>
            <span className="font-normal text-metro-muted text-[13px]">{breadcrumb}</span>
            <span className="text-gray-300 mx-0.5">/</span>
          </>
        )}
        {title}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  )
}
