import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { Layout } from '../components/Layout'
import { GivingJobCard, StatBox } from '../components/cards'
import { GhostButton, EmptyState } from '../components/ui'
import { formatMoney, sumJobExpenses, sumTakeHome } from '../utils/money'
import {
  formatSdaWeekRange,
  formatDayHeading,
  formatMonth,
  formatYear,
  shiftWeek,
  shiftMonth,
  monthKey,
  yearFromDate,
} from '../utils/dates'
import {
  getWeekPaidJobs,
  getMonthPaidJobs,
  getYearPaidJobs,
  groupJobsByDay,
  sumField,
} from '../utils/giving'
import { exportPaidJobsCsv } from '../utils/export'

type Period = 'week' | 'month' | 'year'

function PeriodTabs({
  period,
  onChange,
}: {
  period: Period
  onChange: (p: Period) => void
}) {
  const tabs: { id: Period; label: string }[] = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
  ]
  return (
    <div className="mb-4 flex rounded-xl bg-stat p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            period === t.id ? 'bg-surface text-accent shadow-sm' : 'text-muted'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function DayBreakdown({
  dayGroups,
  currency,
  emptyMessage,
}: {
  dayGroups: ReturnType<typeof groupJobsByDay>
  currency: string
  emptyMessage: string
}) {
  if (dayGroups.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>
  }

  return (
    <div className="space-y-3">
      {dayGroups.map((day) => (
        <div key={day.dateKey} className="card overflow-hidden">
          <div className="border-b border-line bg-stat px-4 py-3">
            <p className="font-semibold text-ink">{formatDayHeading(day.dateKey)}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <StatBox label="Charged" value={formatMoney(day.income, currency)} />
              <StatBox label="Materials" value={formatMoney(day.materials, currency)} />
              <StatBox label="Take home" value={formatMoney(day.takeHome, currency)} />
              <StatBox label="Tithe" value={formatMoney(day.tithe, currency)} />
            </div>
          </div>
          <div>
            {day.jobs.map((job) => (
              <GivingJobCard key={job.id} job={job} currency={currency} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function GivingPage() {
  const { settings, jobs } = useStore()
  const [period, setPeriod] = useState<Period>('week')
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [yearOffset, setYearOffset] = useState(0)

  const weekRef = useMemo(() => shiftWeek(new Date(), weekOffset), [weekOffset])
  const monthRef = useMemo(() => shiftMonth(new Date(), monthOffset), [monthOffset])
  const year = useMemo(() => yearFromDate(new Date()) + yearOffset, [yearOffset])

  const periodJobs = useMemo(() => {
    if (period === 'week') return getWeekPaidJobs(jobs, weekRef)
    if (period === 'month') return getMonthPaidJobs(jobs, monthRef)
    return getYearPaidJobs(jobs, year)
  }, [period, jobs, weekRef, monthRef, year])

  const dayGroups = useMemo(() => groupJobsByDay(periodJobs), [periodJobs])

  const income = useMemo(() => sumField(periodJobs, 'amount'), [periodJobs])
  const materials = useMemo(
    () => periodJobs.reduce((s, j) => s + sumJobExpenses(j.expenses ?? []), 0),
    [periodJobs],
  )
  const tithe = useMemo(() => sumField(periodJobs, 'titheAmount'), [periodJobs])
  const offering = useMemo(() => sumField(periodJobs, 'offeringAmount'), [periodJobs])
  const takeHome = useMemo(() => sumTakeHome(periodJobs), [periodJobs])

  const periodLabel =
    period === 'week'
      ? formatSdaWeekRange(weekRef)
      : period === 'month'
        ? formatMonth(monthKey(monthRef.toISOString()))
        : formatYear(year)

  const isCurrentPeriod =
    period === 'week'
      ? weekOffset === 0
      : period === 'month'
        ? monthOffset === 0
        : yearOffset === 0

  function handlePrev() {
    if (period === 'week') setWeekOffset((o) => o - 1)
    else if (period === 'month') setMonthOffset((o) => o - 1)
    else setYearOffset((o) => o - 1)
  }

  function handleNext() {
    if (period === 'week') setWeekOffset((o) => o + 1)
    else if (period === 'month') setMonthOffset((o) => o + 1)
    else setYearOffset((o) => o + 1)
  }

  function handlePeriodChange(p: Period) {
    setPeriod(p)
    setWeekOffset(0)
    setMonthOffset(0)
    setYearOffset(0)
  }

  function handleExport() {
    const suffix =
      period === 'week'
        ? `week-${monthKey(weekRef.toISOString())}`
        : period === 'month'
          ? monthKey(monthRef.toISOString())
          : String(year)
    exportPaidJobsCsv(periodJobs, `shop-logbook-${suffix}.csv`)
  }

  return (
    <Layout
      title="Giving"
      subtitle="Income & tithe ledger"
      action={
        periodJobs.length > 0 ? (
          <GhostButton onClick={handleExport}>Export</GhostButton>
        ) : undefined
      }
    >
      <PeriodTabs period={period} onChange={handlePeriodChange} />

      <div className="mb-5 rounded-2xl bg-hero p-5 text-white shadow-md">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
          >
            ←
          </button>
          <p className="text-center text-sm font-semibold">{periodLabel}</p>
          <button
            type="button"
            onClick={handleNext}
            disabled={isCurrentPeriod}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20 disabled:opacity-40"
          >
            →
          </button>
        </div>
        <p className="mt-4 text-3xl font-bold tabular-nums">
          {formatMoney(takeHome, settings.currency)}
        </p>
        <p className="mt-1 text-sm text-hero-muted">
          Take home {period === 'week' ? 'this week' : period === 'month' ? 'this month' : 'this year'}
        </p>
        <p className="mt-2 text-sm tabular-nums text-hero-muted">
          {formatMoney(income, settings.currency)} charged · {formatMoney(materials, settings.currency)} materials
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="hero-stat-chip">
            <p className="text-lg font-bold tabular-nums">{periodJobs.length}</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-hero-muted">
              Jobs
            </p>
          </div>
          <div className="hero-stat-chip">
            <p className="text-lg font-bold tabular-nums">
              {formatMoney(tithe, settings.currency)}
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-hero-muted">
              Tithe ({settings.tithePercent}%)
            </p>
          </div>
          <div className="hero-stat-chip">
            <p className="text-lg font-bold tabular-nums">
              {formatMoney(offering, settings.currency)}
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-hero-muted">
              Offering ({settings.offeringPercent}%)
            </p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="section-label mb-3">By day</h2>
        <DayBreakdown
          dayGroups={dayGroups}
          currency={settings.currency}
          emptyMessage={
            period === 'week'
              ? 'No paid jobs this week'
              : period === 'month'
                ? 'No paid jobs this month'
                : 'No paid jobs this year'
          }
        />
      </section>
    </Layout>
  )
}
