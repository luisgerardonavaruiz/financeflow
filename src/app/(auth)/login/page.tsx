'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError('')
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setServerError('Email o contraseña incorrectos')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setServerError('Error de conexión. Intenta de nuevo.')
    }
  }

  return (
    <div className='bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700'>
      <h2 className='text-2xl font-bold text-white mb-2'>Bienvenido</h2>
      <p className='text-slate-400 mb-6 text-sm'>Inicia sesión en tu cuenta</p>

      {registered && (
        <div className='bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4'>
          <p className='text-emerald-400 text-sm'>
            ¡Cuenta creada exitosamente! Ya puedes iniciar sesión.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <Input
          label='Email'
          type='email'
          placeholder='tu@email.com'
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label='Contraseña'
          type='password'
          placeholder='Tu contraseña'
          {...register('password')}
          error={errors.password?.message}
        />

        {serverError && (
          <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-3'>
            <p className='text-red-400 text-sm'>{serverError}</p>
          </div>
        )}

        <Button type='submit' isLoading={isSubmitting}>
          Iniciar sesión
        </Button>
      </form>

      <p className='text-center text-slate-400 text-sm mt-6'>
        ¿No tienes cuenta?{' '}
        <Link
          href='/register'
          className='text-emerald-400 hover:text-emerald-300 font-medium'
        >
          Regístrate gratis
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700'>
          <div className='flex items-center justify-center py-8'>
            <div className='w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
