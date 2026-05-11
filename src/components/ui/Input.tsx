import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className='flex flex-col gap-1'>
        <label className='text-sm font-medium text-slate-300'>{label}</label>
        <input
          ref={ref}
          {...props}
          className={`
            w-full px-4 py-3 rounded-lg bg-slate-800 border text-white
            placeholder-slate-500 outline-none transition-all duration-200
            focus:ring-2 focus:ring-emerald-500 focus:border-transparent
            ${error ? 'border-red-500' : 'border-slate-700'}
          `}
        />
        {error && <span className='text-red-400 text-xs mt-1'>{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
