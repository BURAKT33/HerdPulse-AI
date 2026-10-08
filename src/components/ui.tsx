import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { Bell, Droplets, Heart, Home, PawPrint, BarChart3, Calendar, Users, Settings } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from 'recharts'

export const IMG = {
  flock: 'https://images.unsplash.com/photo-1470093014438-2ede8d7a4818?w=1800&q=80&auto=format&fit=crop',
  sheepGreen: 'https://images.unsplash.com/photo-1588152850700-c82ecb8ba9b1?w=1800&q=80&auto=format&fit=crop',
  sheepClose: 'https://images.unsplash.com/photo-1556704189-b3ad712c38ae?w=1400&q=80&auto=format&fit=crop',
  goats: 'https://images.unsplash.com/photo-1622837699015-9a4cb8b7a94b?w=1600&q=80&auto=format&fit=crop',
  goatClose: 'https://images.unsplash.com/photo-1542764343-436008e87145?w=1000&q=80&auto=format&fit=crop',
  pasture: 'https://images.unsplash.com/photo-1614183653806-b4b9daed1954?w=1800&q=80&auto=format&fit=crop',
}

type BtnProps = { to: string; children: ReactNode; variant?: 'solid' | 'outline' | 'light' | 'ghostLight'; className?: string }
export function Btn({ to, children, variant = 'solid', className = '' }: BtnProps) {
  const v = {
    solid: 'bg-green-brand text-white shadow-[0_10px_24px_-10px_rgba(16,185,129,0.9)] hover:bg-green-deep',
    outline: 'border border-slate-300 bg-white text-charcoal hover:border-green-brand hover:text-green-deep',
    light: 'bg-white text-green-deep hover:bg-slate-100',
    ghostLight: 'border border-white/40 text-white hover:bg-white/10',
  }[variant]
  return (
    <Link to={to} className={`inline-flex items-center justify-center rounded-lg px-6 py-3.5 text-sm font-bold transition ${v} ${className}`}>
      {children}
    </Link>
  )
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.16em] ${light ? 'text-green-brand' : 'text-green-deep'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-green-brand" />
      {children}
    </span>
  )
}

export function Check({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <li className={`flex items-start gap-3 text-[15px] ${light ? 'text-slate-200' : 'text-slate-700'}`}>
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-brand/15">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6.5 4.8 9 10 3.2" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      {children}
    </li>
  )
}

const weekly = [
  { d: 'Mon', v: 412 }, { d: 'Tue', v: 428 }, { d: 'Wed', v: 405 }, { d: 'Thu', v: 451 },
  { d: 'Fri', v: 468 }, { d: 'Sat', v: 459 }, { d: 'Sun', v: 487 },
]

export function MilkBars({ height = 160 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={weekly} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <Tooltip cursor={{ fill: 'rgba(16,185,129,0.08)' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 8px 24px rgba(15,23,42,.15)', fontSize: 12 }} />
        <Bar dataKey="v" name="Litres" fill="#10B981" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Spark({ color = '#2563EB', height = 70 }: { color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={weekly} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sp${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={0.35} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#sp${color.slice(1)})`} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function PhoneApp({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-[270px] rounded-[42px] border-[9px] border-charcoal bg-charcoal shadow-[0_40px_80px_-20px_rgba(15,23,42,0.55)] ${className}`}>
      <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-charcoal" />
      <div className="overflow-hidden rounded-[33px] bg-slate-soft">
        <div className="bg-gradient-to-br from-green-brand to-green-deep px-4 pb-5 pt-9 text-white">
          <div className="flex items-center justify-between text-[10px] font-semibold opacity-90">
            <span>Digital Farmer</span><Bell size={13} />
          </div>
          <p className="mt-3 text-xs opacity-80">Good morning, Nikos</p>
          <p className="text-2xl font-extrabold">Kalamata Flock</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[['1,284', 'Animals'], ['487L', 'Milk today'], ['3', 'Alerts']].map(([a, b]) => (
              <div key={b} className="rounded-lg bg-white/15 py-2">
                <p className="text-sm font-bold">{a}</p>
                <p className="text-[9px] opacity-80">{b}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2.5 p-3">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
              <span>MILK · 7 DAYS</span><span className="text-green-deep">+6.2%</span>
            </div>
            <MilkBars height={80} />
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/90 text-white"><Heart size={14} /></span>
            <div>
              <p className="text-[11px] font-bold text-charcoal">Ewe #GR-0412 · Temp ↑</p>
              <p className="text-[9px] text-slate-500">Early mastitis risk · 12 min ago</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 shadow-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ai-blue/10 text-ai-blue"><Calendar size={14} /></span>
            <div>
              <p className="text-[11px] font-bold text-charcoal">Vaccination · Group B</p>
              <p className="text-[9px] text-slate-500">Tomorrow, 08:00</p>
            </div>
          </div>
        </div>
        <div className="flex justify-around border-t border-slate-200 bg-white py-2.5 text-slate-400">
          <Home size={16} className="text-green-deep" /><PawPrint size={16} /><BarChart3 size={16} /><Settings size={16} />
        </div>
      </div>
    </div>
  )
}

export function DashboardMock({ className = '' }: { className?: string }) {
  const nav = [Home, PawPrint, Droplets, Calendar, Users, Settings]
  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_50px_100px_-30px_rgba(15,23,42,0.5)] ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-soft px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-green-brand" />
        <span className="ml-4 rounded-md bg-white px-3 py-1 font-mono text-[10px] text-slate-400">app.herdpulse.ai/farm/demo</span>
      </div>
      <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[64px_1fr]">
        <div className="flex flex-col items-center gap-5 border-r border-slate-200 bg-charcoal py-5 text-slate-400">
          {nav.map((I, i) => <I key={i} size={18} className={i === 0 ? 'text-green-brand' : ''} />)}
        </div>
        <div className="space-y-4 bg-slate-soft p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[['Total herd', '1,284', '+18', 'text-green-deep'], ['Lactating', '642', '+4', 'text-green-deep'], ['Milk / day', '487 L', '+6.2%', 'text-green-deep'], ['Open alerts', '3', '2 new', 'text-amber-600']].map(([a, b, c, col]) => (
              <div key={a} className="rounded-xl bg-white p-3.5 shadow-sm">
                <p className="text-[11px] font-semibold text-slate-500">{a}</p>
                <p className="mt-1 text-xl font-extrabold text-charcoal sm:text-2xl">{b}</p>
                <p className={`text-[11px] font-bold ${col}`}>{c}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-600">Milk production · last 7 days</p>
              <MilkBars height={170} />
            </div>
            <div className="space-y-2.5 rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-600">Alerts</p>
              {[['Ewe #0412 · temperature', 'bg-amber-400'], ['Milking unit 2 · SCC high', 'bg-red-400'], ['Group B · vaccination due', 'bg-ai-blue']].map(([t, c]) => (
                <div key={t} className="flex items-center gap-2.5 rounded-lg bg-slate-soft p-2.5 text-[11px] font-semibold text-slate-700">
                  <span className={`h-2 w-2 rounded-full ${c}`} />{t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BBox({
  top, left, w, h, label, conf, compact = false,
}: {
  top: string; left: string; w: string; h: string; label: string; conf: string; compact?: boolean
}) {
  return (
    <div
      className={`bbox absolute rounded-[3px] border-green-brand ${compact ? 'border' : 'border-2'}`}
      style={{ top, left, width: w, height: h }}
    >
      <span
        className={`absolute left-[-1px] whitespace-nowrap rounded-sm bg-green-brand font-mono font-medium text-charcoal ${
          compact ? '-top-4 px-1 py-px text-[8px]' : '-top-6 px-1.5 py-0.5 text-[10px]'
        }`}
      >
        {label} {conf}
      </span>
      {!compact &&
        ['-left-1 -top-1', '-right-1 -top-1', '-left-1 -bottom-1', '-right-1 -bottom-1'].map((p) => (
          <span key={p} className={`absolute h-2 w-2 bg-white ${p}`} />
        ))}
    </div>
  )
}
