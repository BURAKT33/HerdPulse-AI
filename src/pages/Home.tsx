import { Link } from 'react-router'
import { ScanEye, Radio, BrainCircuit, Cpu, Smartphone, Dna, Crosshair, Sprout, ShieldCheck, FlaskConical, Layers, Leaf, ArrowUpRight } from 'lucide-react'
import { BBox, Btn, Check, Eyebrow, IMG, PhoneApp, Spark } from '../components/ui'

const research = [
  { i: ScanEye, t: 'Computer Vision', d: 'Behavioral analysis' },
  { i: Radio, t: 'Sensor Networks', d: 'IoT data' },
  { i: BrainCircuit, t: 'Predictive AI', d: 'Early disease detection' },
  { i: Cpu, t: 'Hardware Integration', d: 'Sensors & machines' },
]

const about = [
  { i: Crosshair, t: 'Precision First', d: 'Animal-level data for every decision on the farm.' },
  { i: Sprout, t: 'Farmer Focused', d: 'Simple yet powerful tools built with and for farmers.' },
  { i: ShieldCheck, t: 'Data Security', d: 'Encrypted cloud storage you fully own and control.' },
  { i: FlaskConical, t: 'Research-Driven', d: 'Active AI R&D with universities and field partners.' },
  { i: Layers, t: 'Hardware + Software', d: 'Bridging the physical farm and the digital herd.' },
  { i: Leaf, t: 'Sustainability', d: 'Reducing emissions through healthier, efficient herds.' },
]

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-soft">
        <div className="grid-bg absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <Eyebrow>Precision livestock technology</Eyebrow>
            <h1 className="mt-5 text-[44px] font-extrabold leading-[1.04] tracking-tight text-charcoal sm:text-6xl">
              The <span className="bg-gradient-to-r from-green-brand to-green-deep bg-clip-text text-transparent">AI Brain</span> of Sheep &amp; Goat Farms
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Precision livestock technology for sheep and goat farmers — smarter decisions, healthier herds, more sustainable operations.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Btn to="/digital-farmer" variant="outline">Our Products</Btn>
              <Btn to="/contact">Get in Touch</Btn>
            </div>
            <div className="mt-12 flex gap-10 border-t border-slate-200 pt-6">
              {[['1,200+', 'animals per farm tracked'], ['−32%', 'faster disease detection'], ['24/7', 'digital farm partner']].map(([a, b]) => (
                <div key={a}>
                  <p className="text-2xl font-extrabold text-charcoal">{a}</p>
                  <p className="max-w-[110px] text-xs text-slate-500">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[560px] sm:h-[620px]">
            <div className="absolute inset-y-0 right-0 w-[88%] overflow-hidden rounded-3xl bg-green-deep shadow-2xl">
              <img src={IMG.flock} alt="Flock of sheep grazing on a modern green farm" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
            </div>
            <PhoneApp className="float absolute left-0 top-1/2 -translate-y-1/2 sm:left-[4%]" />
            <div className="glass float-slow absolute right-0 top-8 w-44 rounded-xl p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Herd health score</p>
              <p className="text-2xl font-extrabold text-charcoal">94<span className="text-sm text-green-deep"> /100</span></p>
              <Spark color="#10B981" height={44} />
            </div>
            <div className="glass float absolute bottom-10 right-2 flex items-center gap-3 rounded-xl p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ai-blue text-white"><BrainCircuit size={18} /></span>
              <div>
                <p className="text-xs font-bold text-charcoal">AI detected</p>
                <p className="text-[11px] text-slate-600">Lameness risk · 2 animals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>What we build</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-charcoal sm:text-5xl">Purpose-built for small ruminant farming.</h2>
            <p className="mt-5 text-lg text-slate-600">Not adapted from cattle software. Designed from the ground up for sheep and goat operations.</p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {[
              { to: '/digital-farmer', icon: Smartphone, tag: 'Product 01', name: 'Digital Farmer', title: 'Precision Farming Platform & App.', items: ['Animal registry & health monitoring', 'Milk & production analytics', 'Hardware integration'], bg: 'from-green-brand/10', ic: 'bg-gradient-to-br from-green-brand to-green-deep' },
              { to: '/digital-herd-book', icon: Dna, tag: 'Product 02', name: 'Digital Herd Book', title: 'Complete genealogical record-keeping.', items: ['Pedigree trees & DNA storage', 'Milk quality analysis (fat, protein, SCC)', 'Regulatory compliance'], bg: 'from-ai-blue/10', ic: 'bg-gradient-to-br from-sky-ai to-ai-blue' },
            ].map((c) => (
              <Link key={c.name} to={c.to} className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${c.bg} to-white p-8 transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(15,23,42,0.35)] sm:p-10`}>
                <div className="flex items-start justify-between">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-lg ${c.ic}`}><c.icon size={26} /></span>
                  <span className="font-mono text-xs text-slate-400">{c.tag}</span>
                </div>
                <h3 className="mt-8 text-3xl font-extrabold tracking-tight text-charcoal">{c.name}</h3>
                <p className="mt-2 text-lg font-semibold text-slate-600">{c.title}</p>
                <ul className="mt-7 space-y-3.5">
                  {c.items.map((x) => <Check key={x}>{x}</Check>)}
                </ul>
                <span className="mt-9 inline-flex items-center gap-1.5 text-sm font-bold text-green-deep">
                  Explore {c.name} <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH */}
      <section id="research" className="relative overflow-hidden bg-charcoal py-24 text-white">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-green-brand/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow light>Research &amp; technology</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Where Research Meets the Farm</h2>
            <p className="mt-5 max-w-md text-slate-400">Every model we ship is trained and validated on real sheep and goat farms.</p>
            <ul className="mt-10 space-y-3">
              {research.map((r) => (
                <li key={r.t} className="group flex items-center gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-green-brand/50 hover:bg-white/[0.06]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-brand/15 text-green-brand shadow-[0_0_24px_rgba(16,185,129,0.45)]"><r.i size={22} /></span>
                  <div>
                    <p className="font-bold">{r.t}</p>
                    <p className="text-sm text-slate-400">{r.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-white/10 bg-slate-800 shadow-[0_0_80px_-20px_rgba(16,185,129,0.4)]">
            <img src="/research-cv.jpg" alt="Sheep scanned by computer vision" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-charcoal/25" />
            <div className="scanline absolute left-0 right-0 h-px bg-green-brand shadow-[0_0_20px_4px_rgba(16,185,129,0.7)]" />
            {[
              { top: '58%', left: '0%', w: '22%', h: '18%', label: 'SHEEP', conf: '0.98', compact: false },
              { top: '56%', left: '24%', w: '26%', h: '30%', label: 'SHEEP', conf: '0.97', compact: false },
              { top: '56%', left: '56%', w: '23%', h: '22%', label: 'SHEEP', conf: '0.96', compact: false },
              { top: '58%', left: '81%', w: '12%', h: '17%', label: 'SHEEP', conf: '0.94', compact: true },
              { top: '58%', left: '92%', w: '8%', h: '16%', label: 'SHEEP', conf: '0.91', compact: true },
              { top: '43%', left: '19%', w: '10%', h: '12%', label: 'SHEEP', conf: '0.94', compact: true },
              { top: '42%', left: '29%', w: '10%', h: '11%', label: 'SHEEP', conf: '0.90', compact: true },
              { top: '44%', left: '39%', w: '10%', h: '12%', label: 'SHEEP', conf: '0.89', compact: true },
              { top: '48%', left: '1%', w: '9%', h: '11%', label: 'SHEEP', conf: '0.93', compact: true },
              { top: '48%', left: '10%', w: '10%', h: '11%', label: 'SHEEP', conf: '0.92', compact: true },
              { top: '48%', left: '20%', w: '10%', h: '11%', label: 'SHEEP', conf: '0.91', compact: true },
              { top: '47%', left: '30%', w: '10%', h: '11%', label: 'SHEEP', conf: '0.90', compact: true },
              { top: '49%', left: '40%', w: '10%', h: '11%', label: 'SHEEP', conf: '0.88', compact: true },
              { top: '52%', left: '5%', w: '11%', h: '12%', label: 'SHEEP', conf: '0.94', compact: true },
              { top: '51%', left: '16%', w: '11%', h: '12%', label: 'SHEEP', conf: '0.93', compact: true },
              { top: '50%', left: '27%', w: '11%', h: '12%', label: 'SHEEP', conf: '0.92', compact: true },
              { top: '50%', left: '48%', w: '10%', h: '11%', label: 'SHEEP', conf: '0.91', compact: true },
              { top: '50%', left: '58%', w: '10%', h: '11%', label: 'SHEEP', conf: '0.90', compact: true },
              { top: '52%', left: '68%', w: '10%', h: '12%', label: 'SHEEP', conf: '0.89', compact: true },
              { top: '54%', left: '76%', w: '10%', h: '12%', label: 'SHEEP', conf: '0.88', compact: true },
              { top: '53%', left: '36%', w: '11%', h: '12%', label: 'SHEEP', conf: '0.87', compact: true },
              { top: '47%', left: '52%', w: '9%', h: '10%', label: 'SHEEP', conf: '0.86', compact: true },
            ].map((b) => (
              <BBox key={`${b.left}-${b.top}-${b.conf}`} {...b} />
            ))}
            <div className="glass-dark absolute bottom-4 left-4 rounded-lg px-3 py-2 font-mono text-[11px] text-green-brand">
              ● LIVE · 22 animals detected · 28 fps
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-slate-soft py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>About HerdPulse AI</Eyebrow>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-charcoal sm:text-5xl">Built by farmers&apos; partners, powered by science.</h2>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {about.map((a) => (
              <div key={a.t} className="rounded-xl border border-slate-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-green-brand/40 hover:shadow-lg">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-brand/10 text-green-deep"><a.i size={21} /></span>
                <h3 className="mt-5 text-lg font-bold text-charcoal">{a.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
