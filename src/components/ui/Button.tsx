interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  variant?: 'primary' | 'secondary'
}

export default function Button({
  children,
  isLoading,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`
        w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
        flex items-center justify-center gap-2 disabled:opacity-50
        disabled:cursor-not-allowed
        ${
          variant === 'primary'
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
        }
      `}
    >
      {isLoading ? (
        <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
      ) : (
        children
      )}
    </button>
  )
}
