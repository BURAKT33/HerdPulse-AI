import { useState } from 'react'
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react'
import { Eyebrow } from '../components/ui'

const field = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-charcoal outline-none transition placeholder:text-slate-400 focus:border-green-brand focus:ring-4 focus:ring-green-brand/15'

function Map() {
  return (
    <div className="relative h-60 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="240" fill="#E8F1EE" />
        <path d="M0 150C60 130 90 170 150 150S250 100 300 130 380 150 400 140V240H0Z" fill="#CFE3DD" />
        <path d="M0 60C80 40 120 80 200 60S330 20 400 50V0H0Z" fill="#D9ECE6" />
        <g stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round">
          <path d="M-10 110 140 100 230 130 410 90" />
          <path d="M200 -10 215 120 190 250" />
        </g>
        <g stroke="#fff" strokeWidth="3" fill="none"><path d="M60 0 80 100 50 250M320 0 300 110 340 250M0 190 400 200" /></g>
      </svg>
      <div className="absolute left-[52%] top-[48%] -translate-x-1/2 -translate-y-full">
        <span className="absolute left-1/2 top-full h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-green-brand/40" />
        <span className="flex h-10 w-10 items-center justify-center rounded-full rounded-br-none bg-green-brand text-white shadow-lg ring-4 ring-white [transform:rotate(45deg)]">
          <MapPin size={18} className="[transform:rotate(-45deg)]" />
        </span>
      </div>
      <div className="glass absolute bottom-3 left-3 rounded-lg px-3 py-2 text-xs font-bold text-charcoal">HerdPulse AI HQ</div>
    </div>
  )
}

export default function Contact() {
  const [sent, setSent] = useState(false)
  return (
    <section className="grid min-h-[calc(100vh-72px)] lg:grid-cols-2">
      <div className="px-6 py-16 sm:px-14 lg:px-20">
        <div className="mx-auto max-w-xl">
          <Eyebrow>Get in touch</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-charcoal sm:text-5xl">Let&apos;s talk about your herd.</h1>
          <p className="mt-4 text-slate-600">Tell us about your farm and we&apos;ll show you how HerdPulse AI fits. We reply within one business day.</p>

          {sent ? (
            <div className="mt-10 flex items-start gap-4 rounded-xl border border-green-brand/30 bg-green-brand/10 p-6">
              <CheckCircle2 className="text-green-deep" />
              <div><p className="font-bold text-charcoal">Thank you — message received.</p><p className="mt-1 text-sm text-slate-600">Our team will be in touch shortly.</p></div>
            </div>
          ) : (
            <form className="mt-10 grid gap-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
              {[['Name', 'text', 'Nikos Papadakis', true], ['Farm Name', 'text', 'Kalamata Dairy Farm', false], ['Email', 'email', 'nikos@farm.gr', true], ['Phone', 'tel', '+30 69X XXX XXXX', false]].map(([l, t, p, r]) => (
                <label key={l as string} className="block text-sm font-semibold text-slate-700">
                  {l as string}
                  <input type={t as string} placeholder={p as string} required={r as boolean} className={`${field} mt-1.5 font-normal`} />
                </label>
              ))}
              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                Number of Animals
                <select className={`${field} mt-1.5 font-normal`} defaultValue="">
                  <option value="" disabled>Select range</option>
                  <option>Under 200</option><option>200 – 500</option><option>500 – 1,000</option><option>1,000+</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                Message
                <textarea rows={5} placeholder="How can we help?" className={`${field} mt-1.5 resize-none font-normal`} />
              </label>
              <button className="rounded-lg bg-green-brand px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(16,185,129,0.9)] transition hover:bg-green-deep sm:col-span-2">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="bg-slate-soft px-6 py-16 sm:px-14 lg:px-20">
        <div className="mx-auto max-w-xl space-y-8">
          <div className="space-y-4">
            {[[Mail, 'Email', 'hello@herdpulse.ai'], [Phone, 'Phone', '+90 212 000 0000']].map(([I, l, v]) => {
              const Icon = I as typeof Mail
              return (
                <div key={l as string} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-brand/10 text-green-deep"><Icon size={20} /></span>
                  <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{l as string}</p><p className="font-bold text-charcoal">{v as string}</p></div>
                </div>
              )
            })}
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Headquarters</h2>
            <p className="mt-2 font-bold text-charcoal">HerdPulse AI<br />Istanbul, Türkiye</p>
          </div>
          <Map />
        </div>
      </div>
    </section>
  )
}
