import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'

export default function Layout() {
  const { pathname } = useLocation()
  const [lang, setLang] = useState<'GR' | 'EN'>('EN')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setOpen(false)
  }, [pathname])

  const link = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold transition-colors hover:text-green-deep ${isActive ? 'text-green-deep' : 'text-slate-700'}`

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
          <Link to="/" aria-label="HerdPulse AI home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-9 lg:flex">
            <NavLink to="/digital-farmer" className={link}>Our Products</NavLink>
            <a href="/#research" className="text-sm font-semibold text-slate-700 transition-colors hover:text-green-deep">Research &amp; Technology</a>
            <a href="/#about" className="text-sm font-semibold text-slate-700 transition-colors hover:text-green-deep">About Us</a>
          </nav>
          <div className="hidden items-center gap-5 lg:flex">
            <div className="flex items-center text-xs font-bold text-slate-400">
              {(['GR', 'EN'] as const).map((l, i) => (
                <span key={l} className="flex items-center">
                  {i > 0 && <span className="mx-1.5">|</span>}
                  <button onClick={() => setLang(l)} className={`transition-colors ${lang === l ? 'text-charcoal' : 'hover:text-slate-600'}`}>{l}</button>
                </span>
              ))}
            </div>
            <Link to="/contact" className="rounded-lg bg-green-brand px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.8)] transition hover:bg-green-deep">
              Get in Touch
            </Link>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-6 py-5 lg:hidden">
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
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
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
