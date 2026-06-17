const VARIANTS = {
  primary: 'bg-metro-primary hover:bg-metro-dark text-white',
  outline: 'bg-white hover:bg-gray-50 text-metro-primary border-[1.5px] border-metro-primary',
  ghost:   'bg-transparent hover:bg-metro-bg text-metro-muted',
}
const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
}

export default function Button({ variant = 'primary', size = 'md', icon, children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center rounded-md font-semibold transition-colors cursor-pointer font-sans ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {icon && <i className={`fa-solid fa-${icon}`} />}
      {children}
    </button>
  )
}
