import { Bell, Calendar, Baby, Monitor, Tablet, Smartphone, Wifi } from 'lucide-react'
import { Btn, Check, DashboardMock, Eyebrow, IMG, MilkBars, PhoneApp } from '../components/ui'

function Block({ eyebrow, title, items, visual, flip }: { eyebrow: string; title: string; items: string[]; visual: React.ReactNode; flip?: boolean }) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <div className={flip ? 'lg:order-2' : ''}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="mt-4 text-3xl font-extrabold tracking-tight text-charcoal sm:text-4xl">{title}</h3>
        <ul className="mt-7 space-y-4">{items.map((i) => <Check key={i}>{i}</Check>)}</ul>
      </div>
      <div className={flip ? 'lg:order-1' : ''}>{visual}</div>
    </div>
  )
}

const animals = [['GR-0412', 'Chios ewe', '3 yrs', 'Lactating'], ['GR-0388', 'Chios ewe', '4 yrs', 'Pregnant'], ['GR-0501', 'Skopelos goat', '2 yrs', 'Lactating'], ['GR-0297', 'Chios ram', '5 yrs', 'Breeding']]

export default function DigitalFarmer() {
  return (
    <>
      <section className="relative overflow-hidden bg-slate-soft pt-12 sm:pt-20">
        <div className="grid-bg absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <Eyebrow>Product 01 · Digital Farmer</Eyebrow>
          <h1 className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight text-charcoal sm:text-5xl lg:text-6xl">
            Digital Farmer: Your <span className="bg-gradient-to-r from-green-brand to-green-deep bg-clip-text text-transparent">24/7</span> digital farm partner.
          </h1>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Btn to="/login?next=/app/farmer">Open Live Demo</Btn>
            <Btn to="/digital-herd-book" variant="outline">See Digital Herd Book</Btn>
          </div>
        </div>
        <div className="relative mx-auto mt-10 max-w-6xl overflow-x-clip px-4 sm:mt-16 sm:px-6">
          <div className="absolute inset-x-6 -bottom-0 top-24 overflow-hidden rounded-t-3xl bg-green-deep">
            <img src={IMG.pasture} alt="Sheep on a green pasture" className="h-full w-full object-cover opacity-70" />
          </div>
          <div className="relative px-4 pt-14 sm:px-12">
            <DashboardMock className="rounded-b-none" />
            <div className="glass float absolute -left-2 top-4 hidden items-center gap-3 rounded-xl p-3 sm:left-2 sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-white"><Bell size={17} /></span>
              <div><p className="text-xs font-bold text-charcoal">New alert</p><p className="text-[11px] text-slate-600">Ewe #0412 · temperature ↑</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl space-y-16 px-4 sm:space-y-28 sm:px-6">
          <Block
            eyebrow="Herd management"
            title="Know every animal. Manage every group."
            items={['Complete herd registry & group management', 'Breeding & birth management']}
            visual={
              <div className="rounded-2xl border border-slate-200 bg-slate-soft p-5 shadow-xl">
                <div className="flex items-center gap-4 rounded-xl bg-white p-4">
                  <img src={IMG.sheepClose} alt="Ewe GR-0412" className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-extrabold text-charcoal">Ewe #GR-0412</p>
                    <p className="text-xs text-slate-500">Chios · Born 03 Mar 2023 · Group B</p>
                    <div className="mt-2 flex gap-2 text-[11px] font-bold">
                      <span className="rounded-full bg-green-brand/15 px-2.5 py-0.5 text-green-deep">Lactating</span>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-700">Watch</span>
                    </div>
                  </div>
                  <Baby className="text-ai-blue" />
                </div>
                <div className="mt-3 overflow-hidden rounded-xl bg-white text-xs">
                  {animals.map((a, i) => (
                    <div key={a[0]} className={`grid grid-cols-4 gap-2 px-4 py-3 ${i % 2 ? 'bg-slate-soft' : ''} ${i === 0 ? 'font-bold text-green-deep' : 'text-slate-600'}`}>
                      {a.map((c) => <span key={c}>{c}</span>)}
                    </div>
                  ))}
                </div>
              </div>
            }
          />
          <Block
            flip
            eyebrow="Production analytics"
            title="Every litre, measured and understood."
            items={['Milk production tracking per animal & herd', 'Custom analytics dashboards']}
            visual={
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="flex items-end justify-between">
                  <div><p className="text-xs font-bold text-slate-500">HERD MILK YIELD · THIS WEEK</p><p className="text-4xl font-extrabold text-charcoal">3,110 <span className="text-base text-slate-400">L</span></p></div>
                  <span className="rounded-full bg-green-brand/15 px-3 py-1 text-xs font-bold text-green-deep">+6.2% vs last week</span>
                </div>
                <div className="mt-4"><MilkBars height={220} /></div>
              </div>
            }
          />
          <Block
            eyebrow="Automation"
            title="Hardware talks. You get the alert."
            items={['IoT sensor & milking machine integration', 'Real-time alerts & calendar scheduling']}
            visual={
              <div className="relative rounded-2xl border border-slate-200 bg-slate-soft p-6 shadow-xl">
                <div className="rounded-xl bg-white p-4">
                  <div className="flex items-center justify-between text-sm font-bold text-charcoal"><span>October 2026</span><Calendar size={16} className="text-slate-400" /></div>
                  <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-[11px] text-slate-500">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="font-bold">{d}</span>)}
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                      <span key={d} className={`rounded-md py-1.5 ${d === 9 ? 'bg-green-brand font-bold text-white' : [14, 21].includes(d) ? 'bg-ai-blue/10 font-bold text-ai-blue' : ''}`}>{d}</span>
                    ))}
                  </div>
                </div>
                <div className="glass float absolute -right-3 -top-5 flex items-center gap-2.5 rounded-xl p-3">
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-ai-blue text-white"><Bell size={16} /><span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-red-500" /></span>
                  <div><p className="text-xs font-bold text-charcoal">Milking unit 2</p><p className="text-[11px] text-slate-600">SCC above threshold</p></div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-white p-3 text-xs font-semibold text-slate-600"><Wifi size={14} className="text-green-deep" /> 14 sensors online · 2 milking machines synced</div>
              </div>
            }
          />
        </div>
      </section>

      <section className="bg-charcoal py-16 text-white sm:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Eyebrow light>Shared access</Eyebrow>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Farmer, Vet &amp; advisor shared access from any device, anywhere.</h2>
          <div className="mt-16 flex items-end justify-center gap-4 sm:gap-8">
            <div className="hidden w-[52%] sm:block"><DashboardMock /></div>
            <div className="w-40 shrink-0 rounded-2xl border-[6px] border-slate-700 bg-slate-soft p-3 text-left sm:w-52">
              <div className="rounded-lg bg-white p-3"><p className="text-[10px] font-bold text-slate-500">MILK</p><MilkBars height={90} /></div>
              <div className="mt-2 h-16 rounded-lg bg-green-brand/20" />
              <div className="mt-2 h-10 rounded-lg bg-white" />
            </div>
            <PhoneApp className="hidden scale-90 origin-bottom md:block" />
          </div>
          <div className="mt-10 flex justify-center gap-8 text-sm text-slate-400">
            <span className="flex items-center gap-2"><Monitor size={16} className="text-green-brand" />Desktop</span>
            <span className="flex items-center gap-2"><Tablet size={16} className="text-green-brand" />iPad</span>
            <span className="flex items-center gap-2"><Smartphone size={16} className="text-green-brand" />Mobile</span>
          </div>
          <Btn to="/contact" className="mt-10">Book a Demo</Btn>
        </div>
      </section>
    </>
  )
}
