import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

type FormValues = {
  role: 'customer' | 'owner' | 'admin'
  name: string
  email: string
  password: string
}

export default function RegisterPage() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues: { role: 'customer', name: '', email: '', password: '' } })

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-gray-600">Owners are marked unverified until admin approval (stub).</p>

      <form
        className="mt-5 space-y-3"
        onSubmit={handleSubmit(async (values) => {
          await authRegister(values)
          navigate('/')
        })}
      >
        <div>
          <label className="text-sm text-gray-700">Role</label>
          <select className="mt-1 w-full rounded border px-3 py-2" {...register('role', { required: true })}>
            <option value="customer">Customer</option>
            <option value="owner">Hotel owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-700">Name</label>
          <input className="mt-1 w-full rounded border px-3 py-2" {...register('name', { required: true })} />
        </div>
        <div>
          <label className="text-sm text-gray-700">Email</label>
          <input className="mt-1 w-full rounded border px-3 py-2" type="email" {...register('email', { required: true })} />
        </div>
        <div>
          <label className="text-sm text-gray-700">Password</label>
          <input className="mt-1 w-full rounded border px-3 py-2" type="password" {...register('password', { required: true })} />
        </div>

        <button className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={isSubmitting}>
          Create account
        </button>
      </form>
    </div>
  )
}
