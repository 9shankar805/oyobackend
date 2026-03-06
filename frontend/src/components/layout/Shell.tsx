import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Building2, LogOut, User2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Building2 className="h-5 w-5" />
            <span>OYO</span>
          </Link>

          <nav className="flex items-center gap-3 text-sm">
            <NavLink
              to="/hotels"
              className={({ isActive }) => cn('rounded px-2 py-1', isActive && 'bg-gray-100')}
            >
              Hotels
            </NavLink>
            {auth?.user.role === 'customer' && (
              <NavLink
                to="/customer"
                className={({ isActive }) => cn('rounded px-2 py-1', isActive && 'bg-gray-100')}
              >
                Dashboard
              </NavLink>
            )}
            {auth?.user.role === 'owner' && (
              <NavLink
                to="/owner"
                className={({ isActive }) => cn('rounded px-2 py-1', isActive && 'bg-gray-100')}
              >
                Owner
              </NavLink>
            )}
            {auth?.user.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) => cn('rounded px-2 py-1', isActive && 'bg-gray-100')}
              >
                Admin
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {auth ? (
              <>
                <div className="hidden items-center gap-2 text-sm text-gray-600 md:flex">
                  <User2 className="h-4 w-4" />
                  <span>{auth.user.name}</span>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link className="rounded border px-3 py-2 text-sm" to="/login">
                  Login
                </Link>
                <Link className="rounded bg-black px-3 py-2 text-sm text-white" to="/register">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">© {new Date().getFullYear()} OYO</div>
      </footer>
    </div>
  )
}
