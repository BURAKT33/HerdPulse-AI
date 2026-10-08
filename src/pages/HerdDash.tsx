import { useMemo, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  BadgeCheck, Copy, Database, Dna, Download, Eye, EyeOff, FileCheck2, FlaskConical, KeyRound, LayoutDashboard, Network, Plus, ScrollText, ShieldCheck, TestTube2, Trash2, Upload,
} from 'lucide-react'
import DashShell, { Card, CardHead } from '../components/DashShell'
import type { NavItem } from '../components/DashShell'
import { Field, FormActions, Modal, inputCls, useToast } from '../components/demo-ui'

const nav: NavItem[] = [
  { to: '/app/herdbook', label: 'Overview', icon: LayoutDashboard },
  { to: '/app/herdbook/pedigree', label: 'Pedigree Registry', icon: Network },
  { to: '/app/herdbook/milk', label: 'Milk Quality (SCC/Fat)', icon: FlaskConical },
  { to: '/app/herdbook/dna', label: 'DNA & Genotypes', icon: Dna },
  { to: '/app/herdbook/audit', label: 'Regulatory Audit', icon: FileCheck2 },
  { to: '/app/herdbook/api', label: 'API Management', icon: KeyRound },
]

type A = { id: string; name: string; sex: 'M' | 'F'; breed: string; born: string; gen: string }
const tree: Record<string, A> = {
  S: { id: 'GR-8901', name: 'Artemis', sex: 'F', breed: 'Chios', born: '12 Feb 2024', gen: 'Subject' },
  F: { id: 'GR-6120', name: 'Zeus', sex: 'M', breed: 'Chios', born: '03 Mar 2020', gen: 'Sire' },
  M: { id: 'GR-6377', name: 'Chloe', sex: 'F', breed: 'Chios', born: '21 Jan 2021', gen: 'Dam' },
  FF: { id: 'GR-4410', name: 'Hermes', sex: 'M', breed: 'Chios', born: '2017', gen: 'Grand-sire (paternal)' },
  FM: { id: 'GR-4532', name: 'Daphne', sex: 'F', breed: 'Chios', born: '2018', gen: 'Grand-dam (paternal)' },
  MF: { id: 'GR-4707', name: 'Atlas', sex: 'M', breed: 'Chios × Lacaune', born: '2017', gen: 'Grand-sire (maternal)' },
  MM: { id: 'GR-4815', name: 'Iris', sex: 'F', breed: 'Chios', born: '2019', gen: 'Grand-dam (maternal)' },
}
const pos: Record<string, [number, number]> = { S: [90, 190], F: [330, 100], M: [330, 280], FF: [580, 55], FM: [580, 145], MF: [580, 235], MM: [580, 325] }
const links: [string, string][] = [['S', 'F'], ['S', 'M'], ['F', 'FF'], ['F', 'FM'], ['M', 'MF'], ['M', 'MM']]

const milk = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((m, i) => ({
  m, scc: [212, 238, 261, 247, 226, 204][i], fat: [6.0, 6.1, 6.3, 6.2, 6.3, 6.2][i], protein: [5.0, 5.0, 5.1, 5.2, 5.1, 5.1][i],
}))

const seedFiles = [
  ['GR-8901', 'FASTQ', '07 Oct 2026', 'ARR/ARR', 'Resistant', '4.2 GB'],
  ['GR-6120', 'VCF', '02 Oct 2026', 'ARR/ARQ', 'Low', '218 MB'],
  ['GR-6377', 'FASTA', '28 Sep 2026', 'ARR/ARR', 'Resistant', '2.8 GB'],
  ['GR-7742', 'VCF', '21 Sep 2026', 'ARQ/ARQ', 'Susceptible', '240 MB'],
  ['GR-7390', 'FASTQ', '14 Sep 2026', 'ARR/AHQ', 'Low', '3.9 GB'],
]
const susc: Record<string, string> = { Resistant: 'bg-green-brand/10 text-green-deep', Low: 'bg-sky-ai/10 text-sky-ai', Susceptible: 'bg-amber-100 text-amber-700' }

const seedAudit = [
  ['08 Oct 2026 09:42:17', 'K. Pappas', 'Breeder', 'UPDATE', 'GR-8901 · sire link set to GR-6120', 'a3f9…c21'],
  ['08 Oct 2026 09:31:02', 'Dr. L. Marinou', 'Vet', 'CREATE', 'GR-9014 · birth registration', '7be1…09d'],
  ['08 Oct 2026 08:58:44', 'System import', 'API', 'BULK +86', 'flock_oct.csv · 86 records', 'd04c…7a8'],
  ['07 Oct 2026 17:20:09', 'A. Stavrou', 'Inspector', 'APPROVE', 'GR-7742 · genotype validated', '19aa…e3f'],
  ['07 Oct 2026 14:03:51', 'K. Pappas', 'Breeder', 'UPDATE', 'GR-6377 · milk record corrected', 'f62d…b14'],
  ['07 Oct 2026 11:12:30', 'Dr. L. Marinou', 'Vet', 'UPLOAD', 'GR-8901.fastq.gz · 4.2 GB', '5c80…2ee'],
]

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '': { title: 'Herd Book Overview', subtitle: 'Chios Sheep Breeders Association · National registry · synced 2 min ago' },
  pedigree: { title: 'Pedigree Registry', subtitle: 'Multi-generation ancestry explorer' },
  milk: { title: 'Milk Quality', subtitle: 'SCC, fat, protein and MUN lab results' },
  dna: { title: 'DNA & Genotypes', subtitle: 'Genomic files linked to animal records' },
  audit: { title: 'Regulatory Audit', subtitle: 'Immutable trail aligned with EU 2016/1012 & ICAR' },
  api: { title: 'API Management', subtitle: 'Partner keys for breed associations, labs and ERP' },
}

function PedigreeTree({ toast }: { toast: (m: string) => void }) {
  const [sel, setSel] = useState('S')
  const a = tree[sel]
  return (
    <Card>
      <CardHead
        title="Pedigree Explorer"
        sub="3-generation ancestry · click any node to inspect"
        right={<span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium">Selected: #{a.id}</span>}
      />
      <div className="grid gap-4 p-5 xl:grid-cols-[1fr_280px]">
        <div className="overflow-x-auto rounded-lg bg-slate-soft">
          <svg viewBox="0 0 700 380" className="min-w-[640px]">
            <g fill="none" stroke="#CBD5E1" strokeWidth="1.8">
              {links.map(([p, c]) => {
                const [x1, y1] = pos[p], [x2, y2] = pos[c]
                const mx = (x1 + 55 + x2 - 55) / 2
                return <path key={p + c} d={`M${x1 + 55} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2 - 55} ${y2}`} stroke={sel === p || sel === c ? '#10B981' : '#CBD5E1'} />
              })}
            </g>
            {Object.entries(pos).map(([k, [x, y]]) => {
              const n = tree[k]
              const on = sel === k
              const col = n.sex === 'M' ? '#0EA5E9' : '#10B981'
              return (
                <g key={k} onClick={() => { setSel(k); toast(`Inspecting ${n.name} (#${n.id})`) }} className="cursor-pointer">
                  <rect x={x - 55} y={y - 24} width="110" height="48" rx="10" fill={on ? col : '#fff'} stroke={col} strokeWidth={on ? 0 : 1.6} style={{ filter: on ? 'drop-shadow(0 8px 14px rgba(16,185,129,.35))' : 'none' }} />
                  <text x={x - 43} y={y - 4} fontSize="11.5" fontWeight="800" fill={on ? '#fff' : '#0F172A'}>{n.name}</text>
                  <text x={x - 43} y={y + 12} fontSize="9.5" fontFamily="JetBrains Mono, monospace" fill={on ? '#ECFDF5' : '#64748B'}>#{n.id}</text>
                  <text x={x + 44} y={y - 8} fontSize="12" fontWeight="800" fill={on ? '#fff' : col} textAnchor="end">{n.sex === 'M' ? '♂' : '♀'}</text>
                </g>
              )
            })}
            {[['Subject', 90], ['Parents', 330], ['Grandparents', 580]].map(([l, x]) => (
              <text key={l as string} x={x as number} y="20" fontSize="10" fontWeight="700" fill="#94A3B8" textAnchor="middle" letterSpacing="1.2">{(l as string).toUpperCase()}</text>
            ))}
          </svg>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{a.gen}</p>
          <p className="mt-1 text-xl font-extrabold">{a.name}</p>
          <p className="font-mono text-xs text-slate-500">#{a.id}</p>
          <dl className="mt-4 space-y-2.5 text-[13px]">
            {[['Sex', a.sex === 'M' ? 'Male' : 'Female'], ['Breed', a.breed], ['Born', a.born], ['Inbreeding F', sel === 'S' ? '2.1%' : '—'], ['Genotyped', sel === 'MF' ? 'Pending' : 'Yes']].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-100 pb-2"><dt className="text-slate-500">{k}</dt><dd className="font-bold tabular-nums">{v}</dd></div>
            ))}
          </dl>
          <button onClick={() => setSel('S')} className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-xs font-bold hover:bg-slate-50">Reset to #GR-8901</button>
          <button onClick={() => toast(`Pedigree PDF queued for #${a.id}`)} className="mt-2 w-full rounded-lg bg-green-brand py-2 text-xs font-bold text-white hover:bg-green-deep">Export pedigree</button>
        </div>
      </div>
    </Card>
  )
}

export default function HerdDash() {
  const { pathname } = useLocation()
  const section = pathname.replace(/^\/app\/herdbook\/?/, '').split('/')[0] || ''
  const meta = pageMeta[section] || pageMeta['']
  const { toast, ToastSlot } = useToast()

  const [files, setFiles] = useState(seedFiles)
  const [audit, setAudit] = useState(seedAudit)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [keyOpen, setKeyOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [auditFilter, setAuditFilter] = useState('All')
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [apiKeys, setApiKeys] = useState([
    { id: 'k1', name: 'Breed Assoc. ERP', prefix: 'hp_live_7f3a…', scope: 'read:registry write:births', created: '12 Sep 2026', active: true },
    { id: 'k2', name: 'Central Lab SCC', prefix: 'hp_live_c91e…', scope: 'write:milk', created: '01 Oct 2026', active: true },
    { id: 'k3', name: 'Sandbox · QA', prefix: 'hp_test_a0b2…', scope: 'read:*', created: '03 Oct 2026', active: false },
  ])

  const filteredAudit = useMemo(() => {
    if (auditFilter === 'All') return audit
    return audit.filter((r) => r[3] === auditFilter)
  }, [audit, auditFilter])

  const downloadHerdBook = () => {
    const csv = [
      'id,name,sex,breed,born,role',
      ...Object.values(tree).map((a) => `${a.id},${a.name},${a.sex},${a.breed},${a.born},${a.gen}`),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'official-herd-book.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast('Official herd book CSV downloaded')
  }

  const uploadDna = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const id = String(fd.get('id'))
    const fmt = String(fd.get('format'))
    const marker = String(fd.get('marker'))
    const label = marker.includes('ARR/ARR') ? 'Resistant' : marker.includes('ARQ/ARQ') ? 'Susceptible' : 'Low'
    setFiles((prev) => [[id, fmt, '08 Oct 2026', marker, label, '1.1 GB'], ...prev])
    setAudit((prev) => [[`08 Oct 2026 ${new Date().toLocaleTimeString('en-GB')}`, 'A. Stavrou', 'Registrar', 'UPLOAD', `${id}.${fmt.toLowerCase()} · uploaded`, 'e1c2…9af'], ...prev])
    setUploadOpen(false)
    toast(`DNA file linked to #${id}`)
  }

  const importCsv = (e: FormEvent) => {
    e.preventDefault()
    setAudit((prev) => [[`08 Oct 2026 ${new Date().toLocaleTimeString('en-GB')}`, 'System import', 'API', 'BULK +24', 'manual_import.csv · 24 records', 'b77d…441'], ...prev])
    setImportOpen(false)
    toast('CSV import completed · 24 pedigree records added')
  }

  const createKey = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const secret = `hp_live_${Math.random().toString(36).slice(2, 10)}`
    setApiKeys((prev) => [
      { id: `k${Date.now()}`, name: String(fd.get('name')), prefix: `${secret.slice(0, 12)}…`, scope: String(fd.get('scope')), created: '08 Oct 2026', active: true },
      ...prev,
    ])
    setKeyOpen(false)
    navigator.clipboard?.writeText(secret).catch(() => undefined)
    toast(`API key created and copied: ${secret}`)
  }

  return (
    <>
      <DashShell
        badge="Digital Herd Book"
        badgeColor="bg-sky-ai/15 text-sky-ai"
        nav={nav}
        placeholder="Search Ear Tag / Microchip / Pedigree ID..."
        profile={{ farm: 'Chios Breeders Assoc.', user: 'A. Stavrou', role: 'Registrar', initials: 'AS' }}
        title={meta.title}
        subtitle={meta.subtitle}
        topRight={
          <>
            <span className="hidden items-center gap-2 rounded-full bg-green-brand/10 px-3 py-1.5 text-xs font-bold text-green-deep xl:flex"><BadgeCheck size={15} /> ICAR &amp; EU 2016/1012 Certified</span>
            <button onClick={downloadHerdBook} className="flex items-center gap-2 rounded-lg bg-green-brand px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(16,185,129,0.9)] transition hover:bg-green-deep"><Download size={15} /> Generate Official Herd Book PDF / CSV</button>
          </>
        }
      >
        {section === '' && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { i: Database, l: 'Registered Pedigree Records', v: '45,820', u: 'Animals', t: '+312 this month', c: 'bg-green-brand/10 text-green-deep' },
                { i: Dna, l: 'Genomic Tested', v: String(12400 + (files.length - 5) * 10), u: 'DNA Profiles Saved', t: '27% of registry', c: 'bg-sky-ai/10 text-sky-ai' },
                { i: TestTube2, l: 'Avg Fat / Protein', v: '6.2% / 5.1%', u: 'Ratio across herds', t: '+0.1 pt vs Q2', c: 'bg-violet-100 text-violet-600' },
                { i: ShieldCheck, l: 'Audit Readiness', v: '100%', u: 'Compliant', t: 'Last audit: 30 Sep', c: 'bg-green-brand/10 text-green-deep' },
              ].map((k) => (
                <Card key={k.l} className="p-5">
                  <div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-500">{k.l}</p><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${k.c}`}><k.i size={16} /></span></div>
                  <p className="mt-3 text-[28px] font-extrabold leading-none tabular-nums tracking-tight">{k.v}</p>
                  <p className="mt-1 text-xs text-slate-500">{k.u}</p>
                  <p className="mt-3 border-t border-slate-100 pt-2.5 text-xs font-semibold text-green-deep">{k.t}</p>
                </Card>
              ))}
            </div>
            <div className="mt-4"><PedigreeTree toast={toast} /></div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                ['Import flock CSV', 'Bulk register pedigree records', () => setImportOpen(true)],
                ['Upload DNA file', 'Link FASTQ / VCF / FASTA', () => setUploadOpen(true)],
                ['Create partner API key', 'Labs & associations', () => setKeyOpen(true)],
              ].map(([t, s, fn]) => (
                <button key={t as string} onClick={fn as () => void} className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-green-brand/40 hover:shadow-lg">
                  <p className="text-sm font-extrabold">{t as string}</p>
                  <p className="mt-1 text-xs text-slate-500">{s as string}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {section === 'pedigree' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-green-brand px-3.5 py-2 text-[13px] font-bold text-white hover:bg-green-deep"><Upload size={14} /> Bulk CSV import</button>
              <button onClick={() => toast('New pedigree record form opened')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-bold hover:border-green-brand"><Plus size={14} /> Register animal</button>
            </div>
            <PedigreeTree toast={toast} />
          </div>
        )}

        {section === 'milk' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              {[['Avg SCC', '204k', 'cells/ml · Oct'], ['Fat', '6.2%', '+0.1 vs Sep'], ['Protein', '5.1%', 'stable'], ['MUN', '14.2', 'mg/dL']].map(([l, v, s]) => (
                <Card key={l} className="p-5">
                  <p className="text-xs font-semibold text-slate-500">{l}</p>
                  <p className="mt-2 text-2xl font-extrabold tabular-nums">{v}</p>
                  <p className="mt-1 text-xs text-slate-500">{s}</p>
                </Card>
              ))}
            </div>
            <Card>
              <CardHead title="Milk Quality & Lab Results" sub="Somatic Cell Count (×1,000 cells/ml) with Fat and Protein % · last 6 months" right={<button onClick={() => toast('Lab results exported')} className="text-xs font-bold text-sky-ai hover:underline">Export</button>} />
              <div className="h-[300px] px-3 pb-4 pt-2">
                <ResponsiveContainer>
                  <LineChart data={milk} margin={{ left: 0, right: 8, top: 8 }}>
                    <CartesianGrid stroke="#EEF2F6" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="l" domain={[150, 300]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={36} />
                    <YAxis yAxisId="r" orientation="right" domain={[4, 8]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Line yAxisId="l" dataKey="scc" name="SCC (×1,000/ml)" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line yAxisId="r" dataKey="fat" name="Fat %" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line yAxisId="r" dataKey="protein" name="Protein %" stroke="#0EA5E9" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {section === 'dna' && (
          <Card>
            <CardHead
              title="DNA & Genomics File Manager"
              sub="Sequence files linked to animal records"
              right={<button onClick={() => setUploadOpen(true)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:bg-slate-50">Upload file</button>}
            />
            <div className="overflow-x-auto px-2 pb-2 pt-3">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                    {['Animal ID', 'File Format', 'Upload Date', 'Scrapie Susceptibility Marker', 'Size', ''].map((h) => <th key={h || 'a'} className="px-3 py-2 font-bold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {files.map((f) => (
                    <tr key={f[0] + f[1] + f[2]} className="border-t border-slate-100 transition hover:bg-slate-50">
                      <td className="px-3 py-3 font-mono font-bold">#{f[0]}</td>
                      <td className="px-3 py-3"><span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold">{f[1]}</span></td>
                      <td className="px-3 py-3 tabular-nums text-slate-600">{f[2]}</td>
                      <td className="px-3 py-3"><span className="mr-2 font-mono text-xs font-semibold">{f[3]}</span><span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${susc[f[4]]}`}>{f[4]}</span></td>
                      <td className="px-3 py-3 tabular-nums text-slate-500">{f[5]}</td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => {
                            const blob = new Blob([`HerdPulse AI genomic stub for ${f[0]} (${f[1]})\n`], { type: 'text/plain' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `${f[0]}.${f[1].toLowerCase()}.txt`
                            a.click()
                            URL.revokeObjectURL(url)
                            toast(`Download started for #${f[0]}`)
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-ai hover:underline"
                        >
                          <Download size={13} /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {section === 'audit' && (
          <Card>
            <CardHead
              title="Audit Trail"
              sub="Immutable log · every edit carries a timestamped user signature"
              right={
                <div className="flex items-center gap-2">
                  <select value={auditFilter} onChange={(e) => setAuditFilter(e.target.value)} className={`${inputCls} !w-auto !py-1.5`}>
                    {['All', 'UPDATE', 'CREATE', 'BULK +86', 'BULK +24', 'APPROVE', 'UPLOAD'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-deep"><ScrollText size={14} /> Chain verified</span>
                </div>
              }
            />
            <div className="overflow-x-auto px-2 pb-2 pt-3">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                    {['Timestamp', 'User', 'Role', 'Action', 'Record', 'Signature'].map((h) => <th key={h} className="px-3 py-2 font-bold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredAudit.map((r) => (
                    <tr key={r[0] + r[5]} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-mono text-xs tabular-nums text-slate-500">{r[0]}</td>
                      <td className="px-3 py-2.5 font-bold">{r[1]}</td>
                      <td className="px-3 py-2.5 text-slate-500">{r[2]}</td>
                      <td className="px-3 py-2.5"><span className="rounded bg-green-brand/10 px-2 py-0.5 font-mono text-[11px] font-bold text-green-deep">{r[3]}</span></td>
                      <td className="px-3 py-2.5 text-slate-600">{r[4]}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-400">{r[5]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {section === 'api' && (
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">Partner REST API</p>
                  <p className="text-xs text-slate-500">Connect breed associations, labs and ERP systems.</p>
                </div>
                <button onClick={() => setKeyOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-green-brand px-3.5 py-2.5 text-[13px] font-bold text-white hover:bg-green-deep"><Plus size={15} /> Create key</button>
              </div>
            </Card>
            <Card>
              <CardHead title="API keys" sub="Keys are shown once at creation · store securely" />
              <div className="overflow-x-auto px-2 pb-3">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                      {['Name', 'Key', 'Scope', 'Created', 'Status', ''].map((h) => <th key={h || 'x'} className="px-3 py-2 font-bold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((k) => (
                      <tr key={k.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-3 font-bold">{k.name}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-2 font-mono text-xs">
                            {revealed[k.id] ? k.prefix.replace('…', '_demo_secret') : k.prefix}
                            <button onClick={() => setRevealed((r) => ({ ...r, [k.id]: !r[k.id] }))} className="text-slate-400 hover:text-charcoal" aria-label="Toggle key">
                              {revealed[k.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button onClick={() => { navigator.clipboard?.writeText(k.prefix); toast('Key prefix copied') }} className="text-slate-400 hover:text-charcoal" aria-label="Copy">
                              <Copy size={13} />
                            </button>
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-slate-500">{k.scope}</td>
                        <td className="px-3 py-3 tabular-nums text-slate-500">{k.created}</td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => {
                              setApiKeys((prev) => prev.map((x) => x.id === k.id ? { ...x, active: !x.active } : x))
                              toast(k.active ? `${k.name} revoked` : `${k.name} activated`)
                            }}
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${k.active ? 'bg-green-brand/15 text-green-deep' : 'bg-slate-100 text-slate-500'}`}
                          >
                            {k.active ? 'Active' : 'Revoked'}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => {
                              setApiKeys((prev) => prev.filter((x) => x.id !== k.id))
                              toast(`${k.name} deleted`)
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete key"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </DashShell>

      <Modal open={uploadOpen} title="Upload DNA file" onClose={() => setUploadOpen(false)}>
        <form onSubmit={uploadDna} className="space-y-3">
          <Field label="Animal ID">
            <select name="id" className={inputCls}>{Object.values(tree).map((a) => <option key={a.id}>{a.id}</option>)}</select>
          </Field>
          <Field label="Format">
            <select name="format" className={inputCls}><option>FASTQ</option><option>VCF</option><option>FASTA</option></select>
          </Field>
          <Field label="Scrapie marker">
            <select name="marker" className={inputCls}>
              <option>ARR/ARR</option>
              <option>ARR/ARQ</option>
              <option>ARQ/ARQ</option>
              <option>ARR/AHQ</option>
            </select>
          </Field>
          <Field label="File">
            <input name="file" type="file" className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-green-brand/15 file:px-3 file:py-2 file:text-xs file:font-bold file:text-green-deep" />
          </Field>
          <FormActions onCancel={() => setUploadOpen(false)} submitLabel="Link to record" />
        </form>
      </Modal>

      <Modal open={importOpen} title="Bulk CSV / Excel import" onClose={() => setImportOpen(false)}>
        <form onSubmit={importCsv} className="space-y-3">
          <p className="text-sm text-slate-600">Upload a flock file. Columns are auto-mapped to pedigree fields (ear tag, sire, dam, breed, sex, DOB).</p>
          <Field label="File">
            <input type="file" accept=".csv,.xlsx" className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-ai/15 file:px-3 file:py-2 file:text-xs file:font-bold file:text-sky-ai" />
          </Field>
          <FormActions onCancel={() => setImportOpen(false)} submitLabel="Import records" />
        </form>
      </Modal>

      <Modal open={keyOpen} title="Create API key" onClose={() => setKeyOpen(false)}>
        <form onSubmit={createKey} className="space-y-3">
          <Field label="Key name"><input name="name" required placeholder="Lab integration" className={inputCls} /></Field>
          <Field label="Scope">
            <select name="scope" className={inputCls}>
              <option>read:registry write:births</option>
              <option>write:milk</option>
              <option>read:*</option>
              <option>read:registry write:genotypes</option>
            </select>
          </Field>
          <FormActions onCancel={() => setKeyOpen(false)} submitLabel="Generate key" />
        </form>
      </Modal>

      {ToastSlot}
    </>
  )
}
