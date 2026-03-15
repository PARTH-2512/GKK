export default function Button({ children, variant = 'primary', className = '', loading, ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95',
    success: 'bg-success hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95',
  }

  return (
    <button
      className={`${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  )
}
