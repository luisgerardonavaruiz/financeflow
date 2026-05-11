'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const registerSchema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setServerError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error)
        return
      }

      router.push('/login?registered=true')
    } catch {
      setServerError('Error de conexión. Intenta de nuevo.')
    }
  }

  return (
    <div className='bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700'>
      <h2 className='text-2xl font-bold text-white mb-2'>Crear cuenta</h2>
      <p className='text-slate-400 mb-6 text-sm'>
        Comienza a controlar tus finanzas hoy
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <Input
          label='Nombre completo'
          placeholder='Tu nombre'
          {...register('name')}
          error={errors.name?.message}
        />
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
          placeholder='Mínimo 6 caracteres'
          {...register('password')}
          error={errors.password?.message}
        />
        <Input
          label='Confirmar contraseña'
          type='password'
          placeholder='Repite tu contraseña'
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        {serverError && (
          <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-3'>
            <p className='text-red-400 text-sm'>{serverError}</p>
          </div>
        )}

        <Button type='submit' isLoading={isSubmitting}>
          Crear cuenta
        </Button>
      </form>

      <p className='text-center text-slate-400 text-sm mt-6'>
        ¿Ya tienes cuenta?{' '}
        <Link
          href='/login'
          className='text-emerald-400 hover:text-emerald-300 font-medium'
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
