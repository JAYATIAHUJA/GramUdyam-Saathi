import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Projection, MonteCarlo } from '../engine/business'
import { lakh, inr, MONTHS_EN, MONTHS_HI } from '../lib/format'
import { useT } from '../lib/store'

// Validated chart palette (dataviz validator, light surface): series on the brand
// hues shifted into the lightness band; status colours carry state only.
export const SERIES = { a: '#4353B0', b: '#B98000' }
const STATUS = { go: '#1B873F', caution: '#C77700', risk: '#B42318' }
const AXIS = { fontSize: 11, fill: '#6b6558' }
const GRID = '#ece6d8'

function Tip({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-line bg-white px-3 py-2 text-[12.5px] shadow-lg">{children}</div>
}

export function CashRunway({ p }: { p: Projection }) {
  const t = useT()
  const data = p.monthlyCash.map((m) => ({ ...m, name: `${t(m.label, MONTHS_HI[MONTHS_EN.indexOf(m.label)])}` }))
  const min = Math.min(0, ...data.map((d) => d.cash))
  const max = Math.max(...data.map((d) => d.cash))
  const zeroAt = max === min ? 0 : max / (max - min)
  return (
    <ResponsiveContainer width="100%" height={150}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="cashfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor={SERIES.a} stopOpacity={0.28} />
            <stop offset={zeroAt} stopColor={SERIES.a} stopOpacity={0.06} />
            <stop offset={zeroAt} stopColor={STATUS.risk} stopOpacity={0.12} />
            <stop offset={1} stopColor={STATUS.risk} stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="cashline" x1="0" y1="0" x2="0" y2="1">
            <stop offset={zeroAt} stopColor={SERIES.a} />
            <stop offset={zeroAt} stopColor={STATUS.risk} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={false} interval={2} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => lakh(v)} width={62} />
        <ReferenceLine y={0} stroke="#8a8373" />
        <Tooltip
          cursor={{ stroke: '#8a8373', strokeDasharray: '3 3' }}
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <Tip>
                <div className="font-semibold">{t('Month', 'महीना')} {payload[0].payload.m} ({payload[0].payload.name})</div>
                <div>{t('Cash in hand', 'हाथ में पैसा')}: <b className="num">{inr(payload[0].payload.cash)}</b></div>
                {payload[0].payload.outflow > 0 && <div className="text-muted">{t('Instalment paid', 'किस्त दी')}: {inr(payload[0].payload.outflow)}</div>}
              </Tip>
            ) : null
          }
        />
        <Area type="monotone" dataKey="cash" stroke="url(#cashline)" strokeWidth={2} fill="url(#cashfill)" activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const dscrColor = (d: number) => (d >= 1.5 ? STATUS.go : d >= 1 ? STATUS.caution : STATUS.risk)

export function DscrBars({ p, loanYears }: { p: Projection; loanYears: number }) {
  const t = useT()
  const data = p.years.filter((y) => y.year <= loanYears).map((y) => ({ name: t(`Yr ${y.year}`, `वर्ष ${y.year}`), dscr: Math.min(y.dscr, 6), raw: y }))
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} domain={[0, (max: number) => Math.max(2, Math.ceil(max))]} />
        <ReferenceLine y={1.5} stroke={STATUS.go} strokeDasharray="4 3" label={{ value: t('safe 1.5', 'सुरक्षित 1.5'), position: 'insideTopRight', fontSize: 10.5, fill: STATUS.go, fontWeight: 700 }} />
        <ReferenceLine y={1} stroke={STATUS.risk} strokeDasharray="2 3" />
        <Tooltip
          cursor={{ fill: 'rgba(46,58,140,0.06)' }}
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <Tip>
                <div className="font-semibold">{payload[0].payload.name}</div>
                <div>DSCR <b className="num">{payload[0].payload.raw.dscr.toFixed(2)}</b></div>
                <div className="text-muted">{t('Cash for repayment', 'किस्त के लिए पैसा')}: {inr(payload[0].payload.raw.cfads)}</div>
                <div className="text-muted">{t('Due to bank', 'बैंक को देना')}: {inr(payload[0].payload.raw.principal + payload[0].payload.raw.interest)}</div>
              </Tip>
            ) : null
          }
        />
        <Bar dataKey="dscr" radius={[4, 4, 0, 0]} maxBarSize={34}>
          {data.map((d, i) => (
            <Cell key={i} fill={dscrColor(d.raw.dscr)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function McHistogram({ mc }: { mc: MonteCarlo }) {
  const t = useT()
  const data = mc.histogram.map((b) => ({ ...b, name: b.bin.toFixed(2) }))
  return (
    <ResponsiveContainer width="100%" height={130}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }} barCategoryGap={2}>
        <XAxis dataKey="bin" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => (v % 1 === 0 ? String(v) : '')} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: 'rgba(46,58,140,0.06)' }}
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <Tip>
                {t('Worst-year DSCR', 'सबसे ख़राब साल DSCR')} {payload[0].payload.bin.toFixed(2)}–{(payload[0].payload.bin + 0.25).toFixed(2)}
                <div>
                  <b className="num">{payload[0].payload.count}</b> {t('of 1,000 futures', '1,000 में से')}
                </div>
              </Tip>
            ) : null
          }
        />
        <ReferenceLine x={1} stroke={STATUS.risk} strokeDasharray="3 3" />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.bin < 1 ? STATUS.risk : d.bin < 1.5 ? STATUS.caution : SERIES.a} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SeasonBars({ idx, lean }: { idx: number[]; lean: number[] }) {
  const t = useT()
  const data = idx.map((v, i) => ({ v, name: t(MONTHS_EN[i], MONTHS_HI[i]).slice(0, 3), lean: lean.includes(i) }))
  return (
    <ResponsiveContainer width="100%" height={115}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -30, bottom: 0 }} barCategoryGap="18%">
        <XAxis dataKey="name" tick={{ ...AXIS, fontSize: 10 }} tickLine={false} axisLine={false} interval={0} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} domain={[0, 'dataMax']} hide />
        <ReferenceLine y={1} stroke="#8a8373" strokeDasharray="3 3" />
        <Tooltip
          cursor={{ fill: 'rgba(46,58,140,0.06)' }}
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <Tip>
                {payload[0].payload.name}: <b className="num">{Math.round(payload[0].payload.v * 100)}%</b> {t('of an average month', 'औसत महीने का')}
              </Tip>
            ) : null
          }
        />
        <Bar dataKey="v" radius={[3, 3, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.lean ? STATUS.caution : SERIES.a} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Two-bar comparison drawn in plain HTML, expected sales vs break-even. */
export function DemandVsBreakeven({ expected, breakeven }: { expected: number; breakeven: number }) {
  const t = useT()
  const max = Math.max(expected, breakeven) * 1.1
  const ok = expected >= breakeven
  const Row = ({ label, v, color }: { label: string; v: number; color: string }) => (
    <div className="grid grid-cols-[112px_1fr_auto] items-center gap-2">
      <span className="text-[12.5px] text-muted">{label}</span>
      <div className="h-3 rounded-r bg-khadi">
        <div className="h-3 rounded-r" style={{ width: `${(v / max) * 100}%`, background: color }} />
      </div>
      <span className="num text-[14px] font-bold">{lakh(v)}</span>
    </div>
  )
  return (
    <div className="space-y-2">
      <Row label={t('Expected sales / mo', 'अनुमानित बिक्री / माह')} v={expected} color={SERIES.a} />
      <Row label={t('Break-even / mo', 'बराबरी बिंदु / माह')} v={breakeven} color={SERIES.b} />
      <p className={ok ? 'text-go text-[13px] font-semibold' : 'text-risk text-[13px] font-semibold'}>
        {ok
          ? t(`Sales clear break-even by ${Math.round((expected / breakeven - 1) * 100)}%.`, `बिक्री बराबरी बिंदु से ${Math.round((expected / breakeven - 1) * 100)}% ऊपर।`)
          : t('Expected sales are below break-even.', 'अनुमानित बिक्री बराबरी बिंदु से कम।')}
      </p>
    </div>
  )
}
