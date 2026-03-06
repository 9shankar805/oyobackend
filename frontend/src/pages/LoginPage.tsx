import React, { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

type FormValues = { email: string; password: string }

export default function LoginPage() {
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const googleBtnRef = useRef<HTMLDivElement | null>(null)
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    setError,
  } = useForm<FormValues>({ defaultValues: { email: '', password: '' } })

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
    const g = (window as any).google
    if (!clientId || !g?.accounts?.id || !googleBtnRef.current) return

    g.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp: { credential: string }) => {
        try {
          // Check if owner registration flow
          const urlParams = new URLSearchParams(window.location.search)
          const role = urlParams.get('role') as 'customer' | 'owner' | null || 'customer'
          
          await googleLogin(resp.credential, role)
          
          // Redirect based on role and profile completion
          if (role === 'owner') {
            // Check if profile is complete (this would come from the API response)
            const authData = JSON.parse(localStorage.getItem('auth') || '{}')
            if (authData.user?.profileComplete === false) {
              navigate('/owner/profile-completion')
            } else {
              navigate('/owner')
            }
          } else {
            navigate('/')
          }
        } catch {
          setError('password', { message: 'Google login failed' })
        }
      },
    })

    g.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline',
      size: 'large',
      width: 360,
    })
  }, [googleLogin, navigate, setError])

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Login</h1>
      <p className="mt-1 text-sm text-gray-600">Use an account you registered. Demo owner exists: owner@demo.com</p>

      <div className="mt-4 flex justify-center">
        <div ref={googleBtnRef} />
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">Want to register as a property owner?</p>
        <button
          onClick={() => navigate('/owner-registration')}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Register as Hotel Owner →
        </button>
      </div>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px w-full bg-gray-200" />
        <div className="text-xs text-gray-500">OR</div>
        <div className="h-px w-full bg-gray-200" />
      </div>

      <form
        className="mt-5 space-y-3"
        onSubmit={handleSubmit(async (values) => {
          try {
            await login(values.email, values.password)
            navigate('/')
          } catch {
            setError('password', { message: 'Invalid credentials' })
          }
        })}
      >
        <div>
          <label className="text-sm text-gray-700">Email</label>
          <input className="mt-1 w-full rounded border px-3 py-2" type="email" {...register('email', { required: true })} />
        </div>
        <div>
          <label className="text-sm text-gray-700">Password</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            type="password"
            {...register('password', { required: true })}
          />
        </div>
        <button className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={isSubmitting}>
          Sign in
        </button>
      </form>
    </div>
  )
}
