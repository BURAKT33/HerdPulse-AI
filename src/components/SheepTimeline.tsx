import { Download } from 'lucide-react'
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardHead } from './DashShell'
import { behaviourShares, type Timeline } from '../lib/vision'

const SERIES: { key: string; label: string; color: string }[] = [
  { key: 'sit', label: 'Sit', color: '#F59E0B' },
  { key: 'stand', label: 'Stand', color: '#10B981' },
  { key: 'eat', label: 'Eat', color: '#0EA5E9' },
  { key: 'total', label: 'Total', color: '#64748B' },
]

type Props = {
  timeline: Timeline | null
  csvUrl: string | null
  dominant?: Record<string, number>
}

export default function SheepTimeline({ timeline, csvUrl, dominant }: Props) {
  if (!timeline?.points.length && !dominant && !csvUrl) return null

  const keys = timeline?.series?.length ? timeline.series : ['sit', 'stand', 'eat']
  const lines = SERIES.filter((s) => keys.includes(s.key))
  const shares = behaviourShares(timeline, dominant)
  const pieData = shares.filter((s) => s.pct > 0 || s.sum > 0)
  const chartData = pieData.length ? pieData : shares
  const top = [...shares].sort((a, b) => b.pct - a.pct)[0]
  const nFrames = timeline?.points.length ?? 0
  const hasPie = shares.some((s) => s.sum > 0)

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
      <Card className="overflow-hidden">
        <CardHead
          title="Behaviour timeline"
          sub="Per-frame counts from sheep_timeline.csv"
          right={
            csvUrl ? (
              <a
                href={csvUrl}
                download="sheep_timeline.csv"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold hover:border-green-brand"
              >
                <Download size={14} /> Download CSV
              </a>
            ) : null
          }
        />

        {timeline && timeline.points.length > 0 ? (
          <div className="h-[280px] px-2 pb-4 pt-1">
            <ResponsiveContainer>
              <LineChart data={timeline.points} margin={{ left: -8, right: 16, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="#EEF2F6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,.1)', fontSize: 12 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                {lines.map((s) => (
                  <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="px-5 pb-5 text-xs text-slate-500">CSV downloaded. Timeline chart appears when sit / stand / eat columns are present.</p>
        )}
      </Card>

      <Card className="overflow-hidden">
        <CardHead
          title="Average time by behaviour"
          sub={nFrames ? `Sit / stand / eat share across ${nFrames} samples` : 'From detection summary'}
        />
        {hasPie ? (
          <div className="flex min-h-[280px] flex-col items-center gap-4 px-5 pb-5 sm:flex-row">
            <div className="relative h-[220px] w-full max-w-[220px] shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={chartData} dataKey="sum" nameKey="label" innerRadius="58%" outerRadius="88%" paddingAngle={3} strokeWidth={0}>
                    {chartData.map((s) => (
                      <Cell key={s.key} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, item) => {
                      const pct = (item?.payload as { pct?: number } | undefined)?.pct
                      return [`${pct?.toFixed(0) ?? 0}%`, String(name)]
                    }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {top && top.pct > 0 && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold tabular-nums">{top.pct.toFixed(0)}%</span>
                  <span className="text-[11px] text-slate-500">{top.label}</span>
                </div>
              )}
            </div>
            <ul className="w-full space-y-3">
              {shares.map((s) => (
                <li key={s.key} className="text-[13px]">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
                    <span className="flex-1 font-semibold">{s.label}</span>
                    <span className="tabular-nums font-bold">{s.pct.toFixed(0)}%</span>
                  </div>
                  <p className="mt-0.5 pl-6 text-[11px] text-slate-500">
                    {s.avg.toFixed(2)} avg / frame · {s.sum.toFixed(0)} total
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="px-5 pb-5 text-xs text-slate-500">No sit / stand / eat totals in the CSV yet. Re-run video detection after the API writes class columns.</p>
        )}
      </Card>
    </div>
  )
}
