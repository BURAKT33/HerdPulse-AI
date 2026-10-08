import { useState } from 'react'
import { Link } from 'react-router'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Clock, ScrollText, Undo2, Lock, FileSpreadsheet, Dna, ShieldCheck, Upload } from 'lucide-react'
import Logo from '../components/Logo'
import { Btn, Eyebrow } from '../components/ui'

const pills = ['Registry & Pedigree', 'DNA & Genotype', 'Milk Analysis', 'Cloud Solution', 'Partner API']
const ids = ['registry', 'dna', 'milk', 'cloud', 'api']

const milk = [
  { m: 'Jan', fat: 6.1, protein: 5.2, yield: 1.8 }, { m: 'Feb', fat: 6.4, protein: 5.3, yield: 2.1 },
  { m: 'Mar', fat: 6.8, protein: 5.5, yield: 2.4 }, { m: 'Apr', fat: 6.5, protein: 5.4, yield: 2.6 },
  { m: 'May', fat: 6.9, protein: 5.7, yield: 2.5 }, { m: 'Jun', fat: 7.1, protein: 5.8, yield: 2.2 },
]

function Node({ x, y, label, sex }: { x: number; y: number; label: string; sex: 'm' | 'f' | 'x' }) {
  const c = sex === 'm' ? '#2563EB' : sex === 'f' ? '#10B981' : '#047857'
  return (
    <g>
      <rect x={x - 46} y={y - 15} width="92" height="30" rx="8" fill="#fff" stroke={c} strokeWidth="1.5" />
      <circle cx={x - 33} cy={y} r="4" fill={c} />
      <text x={x - 24} y={y + 4} fontSize="10.5" fontWeight="600" fill="#0F172A">{label}</text>
    </g>
  )
}

function Pedigree() {
  return (
    <svg viewBox="0 0 440 230" className="w-full">
      <g stroke="#CBD5E1" strokeWidth="1.5" fill="none">
        <path d="M96 115H130M130 60V170M130 60H170M130 170H170" />
        <path d="M262 60H290M290 30V90M290 30H320M290 90H320M262 170H290M290 140V200M290 140H320M290 200H320" />
      </g>
      <Node x={60} y={115} label="GR-0412" sex="x" />
      <Node x={216} y={60} label="Sire · Zeus" sex="m" />
      <Node x={216} y={170} label="Dam · Chloe" sex="f" />
      <Node x={366} y={30} label="Hermes" sex="m" />
      <Node x={366} y={90} label="Daphne" sex="f" />
      <Node x={366} y={140} label="Atlas" sex="m" />
      <Node x={366} y={200} label="Iris" sex="f" />
    </svg>
  )
}

function Card({ id, tag, title, desc, children, className = '' }: { id: string; tag: string; title: string; desc: string; children: React.ReactNode; className?: string }) {
  return (
    <div id={id} className={`scroll-mt-40 rounded-2xl border border-slate-200 bg-white p-7 transition hover:shadow-[0_30px_60px_-30px_rgba(15,23,42,0.3)] ${className}`}>
      <span className="font-mono text-xs uppercase tracking-widest text-ai-blue">{tag}</span>
      <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-charcoal">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-600">{desc}</p>
      <div className="mt-6 rounded-xl bg-slate-soft p-4">{children}</div>
    </div>
  )
}

const why = [
  { i: Clock, t: 'Time Saving', d: 'Automated registration, imports and reports replace paperwork.' },
  { i: ShieldCheck, t: 'Regulatory Compliance', d: 'Aligned with EU 2016/1012 and ICAR guidelines by design.' },
  { i: Undo2, t: 'Data That Returns to You', d: 'Breeders get their data and insights back, always exportable.' },
  { i: Lock, t: 'Secure Storage', d: 'Encrypted, backed-up cloud with a full audit trail.' },
]

export default function HerdBook() {
  const [active, setActive] = useState(0)
  const go = (i: number) => {
    setActive(i)
    document.getElementById(ids[i])?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <>
      {/* product header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <span className="rounded-full bg-ai-blue/10 px-3 py-1 text-xs font-bold text-ai-blue">Digital Herd Book</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login?next=/app/herdbook" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-charcoal transition hover:border-ai-blue hover:text-ai-blue">Platform Login</Link>
            <Link to="/contact" className="rounded-lg bg-ai-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700">Book a Demo</Link>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden bg-slate-soft pb-20 pt-20">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sky-ai/15 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <Eyebrow>Product 02</Eyebrow>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-charcoal sm:text-[52px]">
            Everything you need for complete digital maintenance of genealogical herd books.
          </h1>
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {pills.map((p, i) => (
              <button key={p} onClick={() => go(i)} className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${active === i ? 'border-green-brand bg-green-brand text-white shadow-lg shadow-green-brand/30' : 'border-slate-300 bg-white text-slate-700 hover:border-green-brand'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-2">
          <Card id="registry" tag="01 · Registry" title="Registry & Pedigree" desc="Multi-generation pedigree trees, linked automatically from birth records.">
            <Pedigree />
          </Card>
          <Card id="milk" tag="02 · Milk analysis" title="Milk Analysis" desc="Yield (kg), fat % and protein % tracked across lactations.">
            <div className="mb-2 flex gap-4 text-[11px] font-bold">
              <span className="text-green-deep">● Yield (kg)</span><span className="text-ai-blue">● Fat %</span><span className="text-sky-ai">● Protein %</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={milk}>
                <CartesianGrid stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 8px 24px rgba(15,23,42,.15)', fontSize: 12 }} />
                <Line type="monotone" dataKey="yield" stroke="#10B981" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="fat" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="protein" stroke="#0EA5E9" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card id="dna" tag="03 · Genetics" title="DNA & Genetic Evaluation" desc="Store and link raw genomic files directly to each animal record.">
            <div className="space-y-2">
              {[['GR-0412_S1.fastq.gz', 'FASTQ', '4.2 GB'], ['GR-0412.genome.fasta', 'FASTA', '2.8 GB'], ['flock_2026.vcf', 'VCF', '612 MB']].map(([f, t, s]) => (
                <div key={f} className="flex items-center gap-3 rounded-lg bg-white p-3 text-xs shadow-sm">
                  <Dna size={16} className="text-green-deep" />
                  <span className="flex-1 font-mono font-medium text-charcoal">{f}</span>
                  <span className="rounded bg-ai-blue/10 px-2 py-0.5 font-mono font-bold text-ai-blue">{t}</span>
                  <span className="text-slate-400">{s}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card id="cloud" tag="04 · Trust" title="Audit Trail & Import" desc="A tamper-evident log of every change, plus bulk CSV / Excel import.">
            <div className="overflow-hidden rounded-lg bg-white font-mono text-[11px]">
              {[['09:42', 'k.pappas', 'UPDATE', 'GR-0412'], ['09:31', 'vet.lia', 'CREATE', 'GR-0519'], ['09:05', 'import', 'BULK +86', 'flock.csv']].map((r, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 border-b border-slate-100 px-3 py-2 text-slate-600 last:border-0">
                  {r.map((c, j) => <span key={j} className={j === 2 ? 'font-bold text-green-deep' : ''}>{c}</span>)}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 bg-white p-3 text-xs font-semibold text-slate-500">
              <Upload size={16} className="text-ai-blue" /> Drop CSV / Excel here <FileSpreadsheet size={16} className="ml-auto text-green-deep" />
            </div>
          </Card>
        </div>
        <p id="api" className="mx-auto mt-6 flex max-w-7xl scroll-mt-40 items-center gap-3 px-6 text-sm text-slate-500">
          <ScrollText size={16} className="text-ai-blue" /> Partner API: connect breed associations, labs and ERP systems via a documented REST API.
        </p>
      </section>

      {/* compliance */}
      <section className="border-y border-slate-200 bg-slate-soft py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 lg:flex-row lg:justify-between">
          <p className="max-w-xs text-sm font-bold uppercase tracking-widest text-slate-500">Compliance &amp; standards</p>
          {[
            ['ICAR', 'International Committee for Animal Recording'],
            ['EU 2016/1012', 'Zootechnical Regulation'],
          ].map(([a, b]) => (
            <div key={a} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-deep text-[11px] font-extrabold text-green-deep">{a.startsWith('EU') ? 'EU' : 'ICAR'}</span>
              <div><p className="font-extrabold text-charcoal">{a}</p><p className="text-xs text-slate-500">{b}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <Eyebrow>Why choose</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-charcoal">Why Choose Digital Herd Book</h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((w) => (
              <div key={w.t} className="border-t-2 border-green-brand pt-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-brand/10 text-green-deep"><w.i size={22} /></span>
                <h3 className="mt-5 text-lg font-bold text-charcoal">{w.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-green-brand via-green-deep to-charcoal px-8 py-24 text-center text-white">
          <div className="grid-bg absolute inset-0 opacity-30" />
          <h2 className="relative text-6xl font-extrabold tracking-tight sm:text-8xl">Start Today.</h2>
          <div className="relative mt-10 flex flex-wrap justify-center gap-3">
            <Btn to="/login?next=/app/herdbook" variant="light">Open Live Demo</Btn>
            <Btn to="/contact" variant="ghostLight">Contact</Btn>
          </div>
        </div>
      </section>
    </>
  )
}
