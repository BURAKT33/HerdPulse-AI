import { useMemo, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Area, AreaChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Activity, Baby, Bell, CalendarHeart, Camera, Cpu, Droplets, Gauge, HeartPulse, LayoutDashboard, Mail, PawPrint, Plus, Settings, Stethoscope, Syringe, Thermometer, TrendingDown, TrendingUp, Users, Wifi, Sparkles, Milk, AlertTriangle, Shield, UserPlus, Trash2, Check, X,
} from 'lucide-react'
import DashShell, { Card, CardHead, Toggle } from '../components/DashShell'
import type { NavItem } from '../components/DashShell'
import CameraDetection from '../components/CameraDetection'
import { Field, FormActions, Modal, inputCls, useToast } from '../components/demo-ui'

const nav: NavItem[] = [
  { to: '/app/farmer', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/farmer/herd', label: 'Herd & Health', icon: PawPrint },
  { to: '/app/farmer/camera', label: 'Camera Detection', icon: Camera },
  { to: '/app/farmer/milk', label: 'Milk & Production', icon: Milk },
  { to: '/app/farmer/breeding', label: 'Breeding Calendar', icon: CalendarHeart },
  { to: '/app/farmer/iot', label: 'IoT & Sensors', icon: Cpu },
  { to: '/app/farmer/access', label: 'Shared Access (Vet/Advisor)', icon: Users },
  { to: '/app/farmer/settings', label: 'Settings', icon: Settings },
]

const daily = Array.from({ length: 14 }, (_, i) => ({
  x: `${i + 1} Oct`,
  actual: +(2.6 + Math.sin(i / 2) * 0.22 + i * 0.012).toFixed(2),
  target: 2.7,
}))
const weekly = ['W36', 'W37', 'W38', 'W39', 'W40', 'W41'].map((x, i) => ({ x, actual: [2.41, 2.48, 2.55, 2.52, 2.63, 2.71][i], target: 2.6 }))
const spark = [1620, 1700, 1660, 1740, 1790, 1760, 1850].map((v, i) => ({ i, v }))
const bcs = [
  { name: 'Underweight', value: 112, color: '#F59E0B' },
  { name: 'Optimal', value: 968, color: '#10B981' },
  { name: 'Overweight', value: 160, color: '#0EA5E9' },
]

const seedAnimals = [
  { id: 'GR-0412', breed: 'Chios', sex: 'F', group: 'B', status: 'Watch', weight: 58, milk: 2.4, health: 'Elevated temp' },
  { id: 'GR-0388', breed: 'Chios', sex: 'F', group: 'B', status: 'Pregnant', weight: 62, milk: 0, health: 'Healthy' },
  { id: 'GR-0501', breed: 'Skopelos', sex: 'F', group: 'A', status: 'Lactating', weight: 49, milk: 2.8, health: 'Healthy' },
  { id: 'GR-0297', breed: 'Chios', sex: 'M', group: 'Rams', status: 'Breeding', weight: 78, milk: 0, health: 'Healthy' },
  { id: 'GR-0519', breed: 'Skopelos', sex: 'F', group: 'C', status: 'Watch', weight: 51, milk: 2.1, health: 'Low rumination' },
  { id: 'GR-0440', breed: 'Chios', sex: 'F', group: 'A', status: 'Lactating', weight: 55, milk: 2.9, health: 'Healthy' },
  { id: 'GR-0331', breed: 'Chios', sex: 'F', group: 'D', status: 'Dry', weight: 60, milk: 0, health: 'Healthy' },
  { id: 'GR-0602', breed: 'Skopelos', sex: 'F', group: 'A', status: 'Lactating', weight: 47, milk: 2.6, health: 'Healthy' },
]

const seedEvents = [
  { icon: Syringe, c: 'bg-sky-ai/10 text-sky-ai', t: 'Enterotoxaemia vaccination', s: 'Group B · 214 animals', d: 'Tomorrow', ty: 'Health', day: 9 },
  { icon: Baby, c: 'bg-green-brand/10 text-green-deep', t: 'Lambing due', s: 'Ewes #0388, #0412 +10', d: '09 – 14 Oct', ty: 'Birth', day: 9 },
  { icon: CalendarHeart, c: 'bg-pink-100 text-pink-600', t: 'Mating schedule · Chios rams', s: 'Paddock 3 · 80 ewes', d: '16 Oct', ty: 'Breeding', day: 16 },
  { icon: Stethoscope, c: 'bg-amber-100 text-amber-600', t: 'Hoof trimming', s: 'Group A · Vet Lia M.', d: '18 Oct', ty: 'Health', day: 18 },
  { icon: Syringe, c: 'bg-sky-ai/10 text-sky-ai', t: 'Deworming · lambs', s: 'Group D · 96 animals', d: '21 Oct', ty: 'Health', day: 21 },
]

const seedPartners = [
  { name: 'Dr. Lia Marinou', role: 'Veterinarian', email: 'lia.m@vetclinic.gr', access: 'Full health', active: true },
  { name: 'Kostas Vlachos', role: 'Nutritionist', email: 'k.vlachos@feed.gr', access: 'Production read', active: true },
  { name: 'Breed Assoc. Desk', role: 'Advisor', email: 'desk@chiosbreeders.gr', access: 'Pedigree only', active: false },
]

const statusTone: Record<string, string> = {
  Watch: 'bg-amber-100 text-amber-700',
  Pregnant: 'bg-pink-100 text-pink-600',
  Lactating: 'bg-green-brand/15 text-green-deep',
  Breeding: 'bg-sky-ai/10 text-sky-ai',
  Dry: 'bg-slate-100 text-slate-600',
}

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '': { title: 'Good morning, Nikos', subtitle: 'Thursday, 8 October 2026 · Green Pastures Farm #4 · Chios & Skopelos flocks' },
  herd: { title: 'Herd & Health', subtitle: 'Animal registry, groups, and live health signals' },
  camera: { title: 'Camera Detection', subtitle: 'Upload photo/video → POST /predict (multipart file)' },
  milk: { title: 'Milk & Production', subtitle: 'Per-animal and herd yield analytics' },
  breeding: { title: 'Breeding Calendar', subtitle: 'Matings, births, and health schedule · October 2026' },
  iot: { title: 'IoT & Sensors', subtitle: 'Barn environment, wearables, and milking machines' },
  access: { title: 'Shared Access', subtitle: 'Invite vets and advisors to the same live farm data' },
  settings: { title: 'Farm Settings', subtitle: 'Profile, units, and notification preferences' },
}

function Kpi({ icon: Icon, label, value, unit, foot, tone, children }: { icon: typeof Bell; label: string; value: string; unit: string; foot: React.ReactNode; tone: string; children?: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}><Icon size={16} /></span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-[28px] font-extrabold leading-none tabular-nums tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{unit}</p>
        </div>
        {children}
      </div>
      <div className="mt-3 border-t border-slate-100 pt-2.5 text-xs font-semibold">{foot}</div>
    </Card>
  )
}

function Gauge180({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = value / max
  const r = 54
  const len = Math.PI * r
  return (
    <svg viewBox="0 0 140 84" className="w-36">
      <path d="M16 70A54 54 0 0 1 124 70" fill="none" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round" />
      <path d="M16 70A54 54 0 0 1 124 70" fill="none" stroke="#10B981" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${len * pct} ${len}`} />
      <text x="70" y="62" textAnchor="middle" fontSize="22" fontWeight="800" fill="#0F172A" className="tabular-nums">{value}</text>
      <text x="70" y="78" textAnchor="middle" fontSize="8.5" fill="#64748B">{label}</text>
    </svg>
  )
}

export default function FarmerDash() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const section = pathname.replace(/^\/app\/farmer\/?/, '').split('/')[0] || ''
  const meta = pageMeta[section] || pageMeta['']
  const { toast, ToastSlot } = useToast()

  const [animals, setAnimals] = useState(seedAnimals)
  const [partners, setPartners] = useState(seedPartners)
  const [range, setRange] = useState<'Daily' | 'Weekly'>('Daily')
  const [q, setQ] = useState('')
  const [groupFilter, setGroupFilter] = useState('All')
  const [notifsOpen, setNotifsOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [treatOpen, setTreatOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [isolated, setIsolated] = useState<string[]>([])
  const [settings, setSettings] = useState({ farm: 'Green Pastures Farm #4', region: 'Thessaloniki', unit: 'Litres', alerts: true, ai: true })

  const filtered = useMemo(() => {
    return animals.filter((a) => {
      const matchQ = !q || a.id.toLowerCase().includes(q.toLowerCase()) || a.breed.toLowerCase().includes(q.toLowerCase())
      const matchG = groupFilter === 'All' || a.group === groupFilter
      return matchQ && matchG
    })
  }, [animals, q, groupFilter])

  const data = range === 'Daily' ? daily : weekly

  const addAnimal = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const id = String(fd.get('id') || '').trim().toUpperCase()
    if (!id) return
    setAnimals((prev) => [
      { id, breed: String(fd.get('breed')), sex: String(fd.get('sex')) as 'F' | 'M', group: String(fd.get('group')), status: 'Lactating', weight: Number(fd.get('weight') || 50), milk: 0, health: 'Healthy' },
      ...prev,
    ])
    setAddOpen(false)
    toast(`Animal #${id} added to the herd registry`)
  }

  const recordTreatment = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setTreatOpen(false)
    toast(`Treatment recorded for #${fd.get('animal')} · ${fd.get('type')}`)
  }

  const invitePartner = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setPartners((prev) => [
      ...prev,
      { name: String(fd.get('name')), role: String(fd.get('role')), email: String(fd.get('email')), access: String(fd.get('access')), active: true },
    ])
    setInviteOpen(false)
    toast(`Invite sent to ${fd.get('email')}`)
  }

  const saveSettings = (e: FormEvent) => {
    e.preventDefault()
    toast('Farm settings saved')
  }

  const topRight = (
    <>
      <span className="hidden items-center gap-2 rounded-full bg-green-brand/10 px-3 py-1.5 text-xs font-bold text-green-deep xl:flex">
        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-brand opacity-70" /><span className="relative h-2 w-2 rounded-full bg-green-brand" /></span>
        <Wifi size={13} /> IoT Hub Connected (Online)
      </span>
      <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-green-brand px-2.5 py-2 text-[13px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(16,185,129,0.9)] transition hover:bg-green-deep sm:px-3.5 sm:py-2.5"><Plus size={15} /> <span className="hidden sm:inline">Add Animal</span></button>
      <button onClick={() => setTreatOpen(true)} className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-bold transition hover:border-green-brand hover:text-green-deep sm:flex"><Plus size={15} /> Record Treatment</button>
      <div className="relative">
        <button onClick={() => setNotifsOpen(!notifsOpen)} className="relative rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50" aria-label="Notifications">
          <Bell size={17} />
          <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">4</span>
        </button>
        {notifsOpen && (
          <div className="absolute right-0 z-20 mt-2 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-bold">Notifications</p>
              <button onClick={() => { setNotifsOpen(false); toast('All notifications marked as read') }} className="text-[11px] font-bold text-green-deep hover:underline">Mark all read</button>
            </div>
            <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
              {[
                ['Ewe #0412 temperature ↑', 'AI early mastitis risk · 12 min ago'],
                ['Milking unit 2 · SCC high', 'Hardware alert · 28 min ago'],
                ['Vaccination due · Group B', 'Calendar · tomorrow'],
                ['Invite accepted · Dr. Lia M.', 'Shared access · 2 h ago'],
              ].map(([t, s]) => (
                <li key={t} className="px-4 py-3 hover:bg-slate-50">
                  <p className="text-[13px] font-bold">{t}</p>
                  <p className="text-xs text-slate-500">{s}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      <DashShell
        badge="Digital Farmer"
        badgeColor="bg-green-brand/15 text-green-brand"
        nav={nav}
        placeholder="Search tag #, animal ID, or alert..."
        profile={{ farm: settings.farm, user: 'N. Papadakis', role: 'Farmer', initials: 'NP' }}
        title={meta.title}
        subtitle={meta.subtitle}
        topRight={topRight}
      >
        {section === '' && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Kpi icon={PawPrint} label="Total Animals" value={String(animals.length > 8 ? 1240 + (animals.length - 8) : 1240)} unit="Sheep & Goats" tone="bg-green-brand/10 text-green-deep" foot={<span className="flex items-center gap-1 text-green-deep"><TrendingUp size={14} /> +2.4% <span className="font-medium text-slate-400">vs last month</span></span>} />
              <Kpi icon={Droplets} label="Today's Milk Yield" value="1,850" unit="Litres · 642 lactating" tone="bg-sky-ai/10 text-sky-ai" foot={<span className="flex items-center gap-1 text-green-deep"><TrendingUp size={14} /> +5.1% <span className="font-medium text-slate-400">vs yesterday</span></span>}>
                <div className="h-12 w-24">
                  <ResponsiveContainer><AreaChart data={spark}><defs><linearGradient id="kg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0EA5E9" stopOpacity={0.35} /><stop offset="1" stopColor="#0EA5E9" stopOpacity={0} /></linearGradient></defs><Area dataKey="v" stroke="#0EA5E9" strokeWidth={2} fill="url(#kg)" /></AreaChart></ResponsiveContainer>
                </div>
              </Kpi>
              <button type="button" onClick={() => navigate('/app/farmer/herd')} className="text-left">
                <Kpi icon={AlertTriangle} label="Active Health Alerts" value="3" unit="Require Attention" tone="bg-amber-100 text-amber-600" foot={<span className="flex items-center gap-1 text-amber-600"><TrendingDown size={14} className="rotate-180" /> 1 critical <span className="font-medium text-slate-400">· 2 moderate</span></span>} />
              </button>
              <button type="button" onClick={() => navigate('/app/farmer/breeding')} className="text-left">
                <Kpi icon={Baby} label="Expected Births This Week" value="12" unit="Pregnant Ewes" tone="bg-pink-100 text-pink-600" foot={<span className="text-slate-500">Next: <b className="text-charcoal">Ewe #0388</b> · tomorrow</span>} />
              </button>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[3fr_2fr]">
              <Card>
                <CardHead title="Milk Yield vs. Target" sub="Litres per animal per day" right={<Toggle value={range} options={['Daily', 'Weekly']} onChange={setRange} />} />
                <div className="h-[290px] px-3 pb-3 pt-2">
                  <ResponsiveContainer>
                    <LineChart data={data} margin={{ left: -12, right: 12, top: 8 }}>
                      <CartesianGrid stroke="#EEF2F6" vertical={false} />
                      <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[2, 3.2]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,.1)', fontSize: 12 }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="actual" name="Actual (L/animal)" stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="target" name="Target" stroke="#94A3B8" strokeWidth={1.8} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <CardHead title="Body Condition Score (BCS)" sub="AI camera scan · parlour exit, 07:30 today" right={<span className="flex items-center gap-1 rounded-md bg-sky-ai/10 px-2 py-1 text-[11px] font-bold text-sky-ai"><Sparkles size={12} /> AI</span>} />
                <div className="flex h-[290px] items-center px-5">
                  <div className="relative h-full w-1/2">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={bcs} dataKey="value" innerRadius="62%" outerRadius="88%" paddingAngle={3} strokeWidth={0}>
                          {bcs.map((b) => <Cell key={b.name} fill={b.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold tabular-nums">1,240</span>
                      <span className="text-[11px] text-slate-500">scanned</span>
                    </div>
                  </div>
                  <ul className="w-1/2 space-y-4">
                    {bcs.map((b) => (
                      <li key={b.name} className="flex items-center gap-3 text-[13px]">
                        <span className="h-3 w-3 rounded-sm" style={{ background: b.color }} />
                        <span className="flex-1 font-semibold">{b.name}</span>
                        <span className="tabular-nums font-bold">{b.value}</span>
                        <span className="w-10 text-right text-xs tabular-nums text-slate-400">{((b.value / 1240) * 100).toFixed(0)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              <Card>
                <CardHead title="Breeding & Health Calendar" sub="Next 14 days" right={<button onClick={() => navigate('/app/farmer/breeding')} className="text-xs font-bold text-green-deep hover:underline">View all</button>} />
                <ul className="divide-y divide-slate-100 px-2 pb-2 pt-1">
                  {seedEvents.map((e) => (
                    <li key={e.t + e.d} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-slate-50">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${e.c}`}><e.icon size={16} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold">{e.t}</p>
                        <p className="truncate text-xs text-slate-500">{e.s}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold tabular-nums">{e.d}</p>
                        <p className="text-[10px] font-semibold text-slate-400">{e.ty}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <CardHead title="IoT & Milking Machine Status" sub="Live · updated 4 s ago" right={<button onClick={() => navigate('/app/farmer/iot')} className="rounded-md bg-green-brand/10 px-2 py-1 text-[11px] font-bold text-green-deep hover:underline">14 / 14 online</button>} />
                <div className="px-5 pb-5 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    {[[Thermometer, 'Barn temp', '18.4', '°C', 'text-amber-600 bg-amber-100'], [Droplets, 'Humidity', '62', '%', 'text-sky-ai bg-sky-ai/10']].map(([I, l, v, u, c]) => {
                      const Icon = I as typeof Bell
                      return (
                        <div key={l as string} className="rounded-lg bg-slate-soft p-3">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-md ${c as string}`}><Icon size={15} /></span>
                          <p className="mt-2 text-[11px] font-semibold text-slate-500">{l as string}</p>
                          <p className="text-xl font-extrabold tabular-nums">{v as string}<span className="ml-0.5 text-xs font-semibold text-slate-400">{u as string}</span></p>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-soft p-3">
                    <Gauge180 value={168} max={240} label="animals / hour" />
                    <div className="flex-1 space-y-1.5 text-xs">
                      <p className="flex items-center gap-1.5 font-bold"><Gauge size={14} className="text-green-deep" /> Milking throughput</p>
                      <p className="text-slate-500">Unit 1 · <b className="text-green-deep">Running</b></p>
                      <p className="text-slate-500">Unit 2 · <b className="text-amber-600">SCC high</b></p>
                      <p className="text-slate-500">Avg flow · <b className="tabular-nums text-charcoal">1.38 L/min</b></p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="relative overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 to-white">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white"><Sparkles size={12} /> AI INSIGHT</span>
                    <span className="text-[11px] text-slate-500">Detected 06:12 today</span>
                  </div>
                  <h3 className="mt-3 text-lg font-extrabold leading-snug">Early Disease Detection Alert</h3>
                  <p className="mt-1 text-[13px] text-slate-600">Two animals show decreased activity and rumination vs. their 14-day baseline.</p>
                  <div className="mt-4 space-y-2.5">
                    {[['#GR-0412', 'Chios ewe', '−38%', '−27%', '92%'], ['#GR-0519', 'Skopelos goat', '−31%', '−22%', '84%']].map(([id, br, a, r, c]) => (
                      <div key={id} className={`rounded-lg border bg-white p-3 ${isolated.includes(id) ? 'border-green-brand' : 'border-amber-200'}`}>
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] font-extrabold">{id} <span className="font-medium text-slate-500">· {br}</span></p>
                          <span className="text-[11px] font-bold text-amber-600">{isolated.includes(id) ? 'Isolated' : `${c} risk conf.`}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <p className="flex items-center gap-1.5 text-slate-500"><Activity size={13} className="text-amber-600" /> Activity <b className="tabular-nums text-red-600">{a}</b></p>
                          <p className="flex items-center gap-1.5 text-slate-500"><HeartPulse size={13} className="text-amber-600" /> Rumination <b className="tabular-nums text-red-600">{r}</b></p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setIsolated(['#GR-0412', '#GR-0519'])
                        toast('Animals #GR-0412 and #GR-0519 flagged for isolation & inspection')
                      }}
                      className="flex-1 rounded-lg bg-amber-500 py-2.5 text-[13px] font-bold text-white transition hover:bg-amber-600"
                    >
                      Isolate &amp; Inspect
                    </button>
                    <button
                      onClick={() => {
                        toast('Vet Dr. Lia Marinou notified with live health data')
                        navigate('/app/farmer/access')
                      }}
                      className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-[13px] font-bold transition hover:bg-slate-50"
                    >
                      Notify Vet
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {section === 'camera' && <CameraDetection onToast={toast} />}

        {section === 'herd' && (
          <Card>
            <CardHead
              title="Animal registry"
              sub={`${filtered.length} animals shown`}
              right={
                <div className="flex flex-wrap items-center gap-2">
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter ID / breed" className={`${inputCls} !w-40 !py-1.5`} />
                  <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className={`${inputCls} !w-auto !py-1.5`}>
                    {['All', 'A', 'B', 'C', 'D', 'Rams'].map((g) => <option key={g} value={g}>{g === 'All' ? 'All groups' : `Group ${g}`}</option>)}
                  </select>
                  <button onClick={() => setAddOpen(true)} className="rounded-lg bg-green-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-green-deep">Add</button>
                </div>
              }
            />
            <div className="overflow-x-auto px-2 pb-3 pt-2">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                    {['ID', 'Breed', 'Sex', 'Group', 'Status', 'Weight', 'Milk L/d', 'Health', ''].map((h) => <th key={h} className="px-3 py-2 font-bold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-3 font-mono font-bold">#{a.id}</td>
                      <td className="px-3 py-3">{a.breed}</td>
                      <td className="px-3 py-3">{a.sex === 'F' ? '♀ Female' : '♂ Male'}</td>
                      <td className="px-3 py-3">{a.group}</td>
                      <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusTone[a.status]}`}>{a.status}</span></td>
                      <td className="px-3 py-3 tabular-nums">{a.weight} kg</td>
                      <td className="px-3 py-3 tabular-nums">{a.milk || '—'}</td>
                      <td className={`px-3 py-3 ${a.health === 'Healthy' ? 'text-slate-500' : 'font-semibold text-amber-600'}`}>{a.health}</td>
                      <td className="px-3 py-3 text-right">
                        <button onClick={() => { setTreatOpen(true); toast(`Opened treatment form for #${a.id}`) }} className="text-xs font-bold text-green-deep hover:underline">Treat</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {section === 'milk' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {[['Today', '1,850 L', '+5.1%'], ['7-day avg', '1,742 L', '+3.2%'], ['Lactating', '642', '51.8% of herd']].map(([l, v, f]) => (
                <Card key={l} className="p-5">
                  <p className="text-xs font-semibold text-slate-500">{l}</p>
                  <p className="mt-2 text-2xl font-extrabold tabular-nums">{v}</p>
                  <p className="mt-1 text-xs font-semibold text-green-deep">{f}</p>
                </Card>
              ))}
            </div>
            <Card>
              <CardHead title="Herd milk yield" sub="Litres per animal vs target" right={<Toggle value={range} options={['Daily', 'Weekly']} onChange={setRange} />} />
              <div className="h-[300px] px-3 pb-4 pt-2">
                <ResponsiveContainer>
                  <LineChart data={data} margin={{ left: -12, right: 12, top: 8 }}>
                    <CartesianGrid stroke="#EEF2F6" vertical={false} />
                    <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[2, 3.2]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="actual" name="Actual" stroke="#10B981" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="target" name="Target" stroke="#94A3B8" strokeWidth={1.8} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHead title="Top producers today" sub="Individual yield from parlour sync" right={<button onClick={() => toast('Production CSV exported')} className="text-xs font-bold text-green-deep hover:underline">Export CSV</button>} />
              <div className="overflow-x-auto px-2 pb-3">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                      {['Animal', 'Group', 'AM', 'PM', 'Total', 'vs 7d avg'].map((h) => <th key={h} className="px-3 py-2 font-bold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {animals.filter((a) => a.milk > 0).map((a) => (
                      <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-3 font-mono font-bold">#{a.id}</td>
                        <td className="px-3 py-3">{a.group}</td>
                        <td className="px-3 py-3 tabular-nums">{(a.milk * 0.55).toFixed(1)}</td>
                        <td className="px-3 py-3 tabular-nums">{(a.milk * 0.45).toFixed(1)}</td>
                        <td className="px-3 py-3 font-bold tabular-nums">{a.milk.toFixed(1)} L</td>
                        <td className="px-3 py-3 font-semibold text-green-deep">+{(a.milk * 0.04).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {section === 'breeding' && (
          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHead title="October 2026" sub="Click a scheduled day to open details" />
              <div className="px-5 pb-5">
                <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-slate-400">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="py-2">{d}</span>)}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                    const ev = seedEvents.find((e) => e.day === d)
                    return (
                      <button
                        key={d}
                        onClick={() => ev && toast(`${ev.t} · ${ev.s}`)}
                        className={`rounded-lg py-2.5 text-[13px] font-semibold transition ${
                          d === 8 ? 'bg-green-brand text-white' : ev ? 'bg-ai-blue/10 font-bold text-ai-blue hover:bg-ai-blue/20' : 'hover:bg-slate-50'
                        }`}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>
            </Card>
            <Card>
              <CardHead title="Upcoming events" sub="Health · Breeding · Births" right={<button onClick={() => toast('New calendar event form opened')} className="rounded-lg bg-green-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-green-deep">+ Event</button>} />
              <ul className="divide-y divide-slate-100 px-2 pb-3">
                {seedEvents.map((e) => (
                  <li key={e.t} className="flex items-center gap-3 px-3 py-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${e.c}`}><e.icon size={16} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold">{e.t}</p>
                      <p className="text-xs text-slate-500">{e.s}</p>
                    </div>
                    <button onClick={() => toast(`Reminder set for ${e.t}`)} className="text-xs font-bold text-green-deep hover:underline">Remind</button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {section === 'iot' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Barn A temp', '18.4°C', 'Online', true],
                ['Barn A humidity', '62%', 'Online', true],
                ['Activity collars', '1,186 / 1,240', 'Online', true],
                ['Milking unit 2', 'SCC high', 'Alert', false],
              ].map(([l, v, s, ok]) => (
                <Card key={l as string} className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500">{l as string}</p>
                    <span className={`h-2 w-2 rounded-full ${ok ? 'bg-green-brand' : 'bg-amber-500'}`} />
                  </div>
                  <p className="mt-2 text-xl font-extrabold tabular-nums">{v as string}</p>
                  <p className={`mt-1 text-xs font-bold ${ok ? 'text-green-deep' : 'text-amber-600'}`}>{s as string}</p>
                </Card>
              ))}
            </div>
            <Card>
              <CardHead title="Connected devices" sub="IoT hub · last heartbeat 4 s ago" right={<button onClick={() => toast('Sensor sync requested')} className="text-xs font-bold text-green-deep hover:underline">Sync now</button>} />
              <div className="overflow-x-auto px-2 pb-3">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                      {['Device', 'Type', 'Location', 'Battery', 'Status', ''].map((h) => <th key={h} className="px-3 py-2 font-bold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['ENV-A1', 'Climate', 'Barn A', '—', 'Online'],
                      ['MILK-U1', 'Milking machine', 'Parlour', '—', 'Running'],
                      ['MILK-U2', 'Milking machine', 'Parlour', '—', 'SCC alert'],
                      ['CAM-BCS', 'AI camera', 'Exit race', '—', 'Online'],
                      ['COLLAR-412', 'Activity', 'Ewe #0412', '74%', 'Watch'],
                    ].map((r) => (
                      <tr key={r[0]} className="border-t border-slate-100 hover:bg-slate-50">
                        {r.map((c, i) => <td key={i} className={`px-3 py-3 ${i === 0 ? 'font-mono font-bold' : ''} ${c.includes('alert') || c === 'Watch' ? 'font-semibold text-amber-600' : ''}`}>{c}</td>)}
                        <td className="px-3 py-3 text-right"><button onClick={() => toast(`Diagnostics opened for ${r[0]}`)} className="text-xs font-bold text-sky-ai hover:underline">Inspect</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {section === 'access' && (
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">Farmer, vet & advisor collaboration</p>
                  <p className="text-xs text-slate-500">Same live data — no printouts, no delays.</p>
                </div>
                <button onClick={() => setInviteOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-green-brand px-3.5 py-2.5 text-[13px] font-bold text-white hover:bg-green-deep"><UserPlus size={15} /> Invite partner</button>
              </div>
            </Card>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {partners.map((p) => (
                <Card key={p.email} className="p-5">
                  <div className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-brand/10 text-sm font-bold text-green-deep">{p.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${p.active ? 'bg-green-brand/15 text-green-deep' : 'bg-slate-100 text-slate-500'}`}>{p.active ? 'Active' : 'Pending'}</span>
                  </div>
                  <p className="mt-3 text-[15px] font-extrabold">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.role}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600"><Mail size={12} /> {p.email}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600"><Shield size={12} /> {p.access}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setPartners((prev) => prev.map((x) => x.email === p.email ? { ...x, active: !x.active } : x))
                        toast(p.active ? `Access revoked for ${p.name}` : `Access restored for ${p.name}`)
                      }}
                      className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold hover:bg-slate-50"
                    >
                      {p.active ? 'Revoke' : 'Activate'}
                    </button>
                    <button
                      onClick={() => {
                        setPartners((prev) => prev.filter((x) => x.email !== p.email))
                        toast(`${p.name} removed`)
                      }}
                      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:text-red-600"
                      aria-label="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {section === 'settings' && (
          <Card className="max-w-xl p-6">
            <form onSubmit={saveSettings} className="space-y-4">
              <Field label="Farm name">
                <input className={inputCls} value={settings.farm} onChange={(e) => setSettings({ ...settings, farm: e.target.value })} />
              </Field>
              <Field label="Region">
                <input className={inputCls} value={settings.region} onChange={(e) => setSettings({ ...settings, region: e.target.value })} />
              </Field>
              <Field label="Milk unit">
                <select className={inputCls} value={settings.unit} onChange={(e) => setSettings({ ...settings, unit: e.target.value })}>
                  <option>Litres</option>
                  <option>Kilograms</option>
                </select>
              </Field>
              <div className="space-y-3 pt-2">
                {([['alerts', 'Real-time health alerts'], ['ai', 'AI early disease detection']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSettings({ ...settings, [key]: !settings[key] })}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-semibold hover:bg-slate-50"
                  >
                    {label}
                    <span className={`flex h-6 w-10 items-center rounded-full px-0.5 transition ${settings[key] ? 'bg-green-brand' : 'bg-slate-200'}`}>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] shadow transition ${settings[key] ? 'translate-x-4 text-green-deep' : 'text-slate-400'}`}>
                        {settings[key] ? <Check size={12} /> : <X size={12} />}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <button type="submit" className="w-full rounded-lg bg-green-brand py-3 text-sm font-bold text-white hover:bg-green-deep">Save settings</button>
            </form>
          </Card>
        )}
      </DashShell>

      <Modal open={addOpen} title="Add animal" onClose={() => setAddOpen(false)}>
        <form onSubmit={addAnimal} className="space-y-3">
          <Field label="Ear tag / ID"><input name="id" required placeholder="GR-0701" className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Breed">
              <select name="breed" className={inputCls}><option>Chios</option><option>Skopelos</option><option>Lacaune</option></select>
            </Field>
            <Field label="Sex">
              <select name="sex" className={inputCls}><option value="F">Female</option><option value="M">Male</option></select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Group">
              <select name="group" className={inputCls}>{['A', 'B', 'C', 'D', 'Rams'].map((g) => <option key={g}>{g}</option>)}</select>
            </Field>
            <Field label="Weight (kg)"><input name="weight" type="number" defaultValue={55} className={inputCls} /></Field>
          </div>
          <FormActions onCancel={() => setAddOpen(false)} submitLabel="Add to herd" />
        </form>
      </Modal>

      <Modal open={treatOpen} title="Record treatment" onClose={() => setTreatOpen(false)}>
        <form onSubmit={recordTreatment} className="space-y-3">
          <Field label="Animal">
            <select name="animal" className={inputCls}>{animals.map((a) => <option key={a.id}>{a.id}</option>)}</select>
          </Field>
          <Field label="Treatment type">
            <select name="type" className={inputCls}>
              <option>Antibiotic</option>
              <option>Vaccination</option>
              <option>Deworming</option>
              <option>Hoof trim</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Notes"><textarea name="notes" rows={3} className={inputCls} placeholder="Dosage, withdrawal period..." /></Field>
          <FormActions onCancel={() => setTreatOpen(false)} submitLabel="Save treatment" />
        </form>
      </Modal>

      <Modal open={inviteOpen} title="Invite partner" onClose={() => setInviteOpen(false)}>
        <form onSubmit={invitePartner} className="space-y-3">
          <Field label="Name"><input name="name" required className={inputCls} /></Field>
          <Field label="Email"><input name="email" type="email" required className={inputCls} /></Field>
          <Field label="Role">
            <select name="role" className={inputCls}><option>Veterinarian</option><option>Nutritionist</option><option>Advisor</option></select>
          </Field>
          <Field label="Access level">
            <select name="access" className={inputCls}>
              <option>Full health</option>
              <option>Production read</option>
              <option>Pedigree only</option>
            </select>
          </Field>
          <FormActions onCancel={() => setInviteOpen(false)} submitLabel="Send invite" />
        </form>
      </Modal>

      {ToastSlot}
    </>
  )
}
