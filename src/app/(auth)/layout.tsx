export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-white'>FinanceFlow</h1>
          <p className='text-slate-400 mt-2'>Tu app de finanzas personales</p>
        </div>
        {children}
      </div>
    </div>
  )
}
