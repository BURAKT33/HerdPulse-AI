import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { ChevronsUpDown, LogOut, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'
import { useAuth } from '../auth'
import Logo from './Logo'

export type NavItem = { to: string; label: string; icon: LucideIcon }

type Props = {
  badge: string
  badgeColor: string
  nav: NavItem[]
  placeholder: string
  profile: { farm: string; user: string; role: string; initials: string }
  topRight: ReactNode
  title: string
  subtitle: string
  children: ReactNode
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] ${className}`}>
      {children}
    </div>
  )
}

export function CardHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pb-1 pt-4">
      <div>
        <h3 className="text-sm font-bold text-charcoal">{title}</h3>
        {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export function Toggle<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className={`rounded-md px-3 py-1 transition ${value === o ? 'bg-white text-charcoal shadow-sm' : 'text-slate-500 hover:text-charcoal'}`}>
          {o}
        </button>
      ))}
    </div>
  )
}

export default function DashShell({ badge, badgeColor, nav, placeholder, profile, topRight, title, subtitle, children }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const signOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen bg-slate-soft text-charcoal">
      <aside className={`flex shrink-0 flex-col bg-charcoal text-slate-400 transition-[width] duration-200 ${collapsed ? 'w-[72px]' : 'w-60'}`}>
        <div className={`flex h-16 items-center border-b border-white/10 ${collapsed ? 'justify-center' : 'justify-between px-4'}`}>
          {collapsed ? (
            <Link to="/"><Logo light size={32} /></Link>
          ) : (
            <Link to="/" className="flex flex-col gap-1"><Logo light size={26} /></Link>
          )}
          {!collapsed && <button onClick={() => setCollapsed(true)} aria-label="Collapse sidebar" className="rounded-md p-1.5 hover:bg-white/10 hover:text-white"><PanelLeftClose size={17} /></button>}
        </div>
        {!collapsed && (
          <div className="px-4 pt-4">
            <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold ${badgeColor}`}>{badge}</span>
          </div>
        )}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} aria-label="Expand sidebar" className="mx-auto mt-3 rounded-md p-2 hover:bg-white/10 hover:text-white"><PanelLeftOpen size={17} /></button>
        )}
        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3">
          {nav.map((n, i) => (
            <NavLink
              key={n.label}
              to={n.to}
              end
              title={n.label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg py-2.5 text-[13px] font-semibold transition ${collapsed ? 'justify-center px-0' : 'px-3'} ${
                  isActive ? 'bg-green-brand/15 text-green-brand' : 'hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <n.icon size={18} />
              {!collapsed && n.label}
            </NavLink>
          ))}
        </nav>
        <div className="relative border-t border-white/10 p-3">
          {menuOpen && (
            <div className={`absolute bottom-full mb-2 rounded-lg border border-white/10 bg-slate-900 py-1 shadow-xl ${collapsed ? 'left-1/2 w-40 -translate-x-1/2' : 'left-3 right-3'}`}>
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-brand to-green-deep text-xs font-bold text-white">{profile.initials}</span>
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-white">{profile.farm}</span>
                  <span className="block truncate text-[11px]">{profile.user} · {profile.role}</span>
                </span>
                <ChevronsUpDown size={15} />
              </>
            )}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6">
          <label className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input placeholder={placeholder} className="w-full rounded-lg border border-slate-200 bg-slate-soft py-2.5 pl-10 pr-3 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-green-brand focus:bg-white focus:ring-4 focus:ring-green-brand/15" />
          </label>
          <div className="ml-auto flex items-center gap-3">{topRight}</div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            <p className="text-[13px] text-slate-500">{subtitle}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
