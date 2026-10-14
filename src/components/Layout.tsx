import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { BookOpen, ChevronDown, LayoutDashboard, LogIn, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../auth'
import Logo from './Logo'

export default function Layout() {
  const { pathname } = useLocation()
  const { session, logout } = useAuth()
  const [lang, setLang] = useState<'GR' | 'EN'>('EN')
  const [open, setOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)
  const demoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    setOpen(false)
    setDemoOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!demoOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!demoRef.current?.contains(e.target as Node)) setDemoOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [demoOpen])

  const link = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold transition-colors hover:text-green-deep ${isActive ? 'text-green-deep' : 'text-slate-700'}`

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:gap-4 sm:px-6">
          <Link to="/" aria-label="HerdPulse AI home" className="min-w-0">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-9 lg:flex">
            <NavLink to="/digital-farmer" className={link}>Our Products</NavLink>
            <a href="/#research" className="text-sm font-semibold text-slate-700 transition-colors hover:text-green-deep">Research &amp; Technology</a>
            <a href="/#about" className="text-sm font-semibold text-slate-700 transition-colors hover:text-green-deep">About Us</a>
          </nav>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden items-center text-xs font-bold text-slate-400 lg:flex">
              {(['GR', 'EN'] as const).map((l, i) => (
                <span key={l} className="flex items-center">
                  {i > 0 && <span className="mx-1.5">|</span>}
                  <button onClick={() => setLang(l)} className={`transition-colors ${lang === l ? 'text-charcoal' : 'hover:text-slate-600'}`}>{l}</button>
                </span>
              ))}
            </div>
            <Link to="/contact" className="hidden rounded-lg bg-green-brand px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.8)] transition hover:bg-green-deep lg:inline-flex">
              Get in Touch
            </Link>
            <div className="relative" ref={demoRef}>
              {session ? (
                <>
                  <button
                    onClick={() => setDemoOpen(!demoOpen)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-green-brand/30 bg-green-brand/10 px-3 py-2 text-xs font-bold text-green-deep transition hover:bg-green-brand/15"
                  >
                    <LogIn size={14} />
                    <span className="hidden sm:inline">Demo</span>
                    <ChevronDown size={14} className={`transition ${demoOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {demoOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                      <p className="border-b border-slate-100 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Switch dashboard
                      </p>
                      <Link
                        to="/app/farmer"
                        onClick={() => setDemoOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-3 text-sm font-semibold text-charcoal transition hover:bg-slate-50"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-brand/10 text-green-deep">
                          <LayoutDashboard size={16} />
                        </span>
                        Farmer Dashboard
                      </Link>
                      <Link
                        to="/app/herdbook"
                        onClick={() => setDemoOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-3 text-sm font-semibold text-charcoal transition hover:bg-slate-50"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-ai/10 text-sky-ai">
                          <BookOpen size={16} />
                        </span>
                        Herd Book Dashboard
                      </Link>
                      <button
                        onClick={() => { logout(); setDemoOpen(false) }}
                        className="flex w-full items-center gap-3 border-t border-slate-100 px-3.5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-charcoal"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-charcoal transition hover:border-green-brand hover:text-green-deep"
                >
                  <LogIn size={14} />
                  <span>Login</span>
                </Link>
              )}
            </div>
            <button className="rounded-lg p-2 text-charcoal lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-6 py-5 lg:hidden">
            {session ? (
              <>
                <Link to="/app/farmer" className="font-semibold">Farmer Dashboard</Link>
                <Link to="/app/herdbook" className="font-semibold">Herd Book Dashboard</Link>
                <button onClick={logout} className="text-left font-semibold text-slate-500">Sign out</button>
              </>
            ) : (
              <Link to="/login" className="font-semibold text-green-deep">Login · Demo access</Link>
            )}
            <Link to="/digital-farmer" className="font-semibold">Digital Farmer</Link>
            <Link to="/digital-herd-book" className="font-semibold">Digital Herd Book</Link>
            <a href="/#research" className="font-semibold">Research &amp; Technology</a>
            <a href="/#about" className="font-semibold">About Us</a>
            <Link to="/contact" className="rounded-lg bg-green-brand px-5 py-3 text-center font-bold text-white">Get in Touch</Link>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-charcoal text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              Your 24/7 digital farm partner. Precision livestock technology built from the ground up for sheep and goat farms.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-green-brand">Home</Link></li>
              <li><Link to="/contact" className="hover:text-green-brand">Contact</Link></li>
              <li><a href="#" className="hover:text-green-brand">Terms of Use</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Products</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/digital-farmer" className="hover:text-green-brand">Digital Farmer</Link></li>
              <li><Link to="/digital-herd-book" className="hover:text-green-brand">Digital Herd Book</Link></li>
              <li><Link to="/login?next=/app/farmer" className="hover:text-green-brand">Farmer Dashboard (demo)</Link></li>
              <li><Link to="/login?next=/app/herdbook" className="hover:text-green-brand">Herd Book Dashboard (demo)</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-6 text-center text-xs">© 2026 HerdPulse AI. All rights reserved.</div>
      </footer>
    </div>
  )
}
