import { NavLink, Outlet } from 'react-router-dom'

import { cn } from '@/lib/cn'

const NAV = [{ to: '/veiculos', label: 'Veículos' }]

export function AppShell() {
  return (
    <div className="min-h-screen bg-surface text-slate-900">
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface-elevated/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          <div className="flex items-center gap-2">
            <div
              aria-hidden
              className="h-6 w-6 rounded bg-primary-700"
            />
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              Gestão de Veículos
            </span>
          </div>
          <nav aria-label="Principal" className="flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded px-3 py-1.5 text-sm font-medium',
                    'motion-safe:transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                    isActive
                      ? 'bg-primary-50 text-primary-800'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
