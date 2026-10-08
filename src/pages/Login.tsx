import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router'
import { Eye, EyeOff, Lock, Smartphone, Dna } from 'lucide-react'
import Logo from '../components/Logo'
import { DEMO_CREDENTIALS, useAuth } from '../auth'
import { IMG } from '../components/ui'

const demos = [
  {
    to: '/app/farmer',
    icon: Smartphone,
    name: 'Digital Farmer',
    desc: 'Farm operations dashboard',
    accent: 'from-green-brand to-green-deep',
  },
  {
    to: '/app/herdbook',
    icon: Dna,
    name: 'Digital Herd Book',
    desc: 'Pedigree & genetics platform',
    accent: 'from-sky-ai to-ai-blue',
  },
]

export default function Login() {
  const { session, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const fromState = (location.state as { from?: string } | null)?.from
  const next = params.get('next') || fromState || '/app/farmer'

  const [email, setEmail] = useState(DEMO_CREDENTIALS.email)
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [target, setTarget] = useState(next.startsWith('/app/') ? next : '/app/farmer')

  if (session) return <Navigate to={target} replace />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!login(email, password)) {
      setError('Invalid credentials. Use the demo account below.')
      return
    }
    navigate(target, { replace: true })
  }

  return (
    <div className="relative flex min-h-screen">
      <div className="relative hidden w-[46%] overflow-hidden bg-charcoal lg:block">
        <img src={IMG.flock} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal/80 to-green-deep/70" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo light />
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-green-brand">Investor demo access</p>
            <h1 className="mt-4 max-w-md text-4xl font-extrabold leading-tight tracking-tight">
              Sign in to explore the live product demos.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              Two interactive platforms — Digital Farmer and Digital Herd Book — ready for walkthrough.
            </p>
          </div>
          <p className="text-xs text-slate-400">© 2026 HerdPulse AI</p>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col justify-center bg-slate-soft px-6 py-12">
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="relative mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-brand/10 text-green-deep">
                <Lock size={18} />
              </span>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-charcoal">Demo login</h2>
                <p className="text-sm text-slate-500">Protected investor access</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              {demos.map((d) => {
                const active = target === d.to || target.startsWith(d.to + '/')
                return (
                  <button
                    key={d.to}
                    type="button"
                    onClick={() => setTarget(d.to)}
                    className={`rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-green-brand bg-green-brand/5 ring-2 ring-green-brand/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${d.accent} text-white`}>
                      <d.icon size={15} />
                    </span>
                    <p className="mt-2 text-xs font-bold text-charcoal">{d.name}</p>
                    <p className="text-[10px] text-slate-500">{d.desc}</p>
                  </button>
                )
              })}
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-600">Email</span>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-soft px-3.5 py-2.5 text-sm outline-none transition focus:border-green-brand focus:bg-white focus:ring-4 focus:ring-green-brand/15"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-600">Password</span>
                <span className="relative block">
                  <input
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-soft px-3.5 py-2.5 pr-11 text-sm outline-none transition focus:border-green-brand focus:bg-white focus:ring-4 focus:ring-green-brand/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-charcoal"
                    aria-label={show ? 'Hide password' : 'Show password'}
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-green-brand py-3 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(16,185,129,0.9)] transition hover:bg-green-deep"
              >
                Enter demo
              </button>
            </form>

            <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-soft p-3.5 text-xs">
              <p className="font-bold text-slate-600">Demo credentials</p>
              <p className="mt-1 font-mono text-charcoal">
                {DEMO_CREDENTIALS.email}
                <br />
                {DEMO_CREDENTIALS.password}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail(DEMO_CREDENTIALS.email)
                  setPassword(DEMO_CREDENTIALS.password)
                  setError('')
                }}
                className="mt-2 font-bold text-green-deep hover:underline"
              >
                Fill credentials
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link to="/" className="font-semibold text-green-deep hover:underline">
              ← Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
