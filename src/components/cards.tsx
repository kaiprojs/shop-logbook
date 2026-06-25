import type { ReactNode } from 'react'
import type { Job } from '../types'
import { StatusPill } from './StatusBadge'
import { formatDateTime } from '../utils/dates'
import { formatMoney, sumJobExpenses, takeHomeFromJob } from '../utils/money'
import { JobBookingActions } from './JobBookingActions'

export function StatBox({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="card-inset px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-ink">{value}</p>
    </div>
  )
}

export function HeroCard({
  title,
  description,
  stats,
}: {
  title: string
  description: string
  stats: { label: string; value: ReactNode }[]
}) {
  return (
    <div className="mb-5 rounded-2xl bg-hero p-5 text-white shadow-md">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm text-hero-muted">{description}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="hero-stat-chip">
            <p className="text-lg font-bold tabular-nums">{stat.value}</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-hero-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-inset flex flex-1 flex-col items-center gap-2 px-2 py-4 text-center transition hover:bg-line/40"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
        {icon}
      </span>
      <span className="text-xs font-medium text-ink">{label}</span>
    </button>
  )
}

export function QuickActions({ children }: { children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="section-label mb-3">Quick actions</h2>
      <div className="flex gap-2">{children}</div>
    </section>
  )
}

export function JobCard({
  job,
  currency,
  onOpen,
  onRecordPayment,
  onReschedule,
}: {
  job: Job
  currency: string
  onOpen: () => void
  onRecordPayment?: () => void
  onReschedule?: () => void
}) {
  const showBookingActions =
    (job.status === 'booked' || job.status === 'in_progress' || job.status === 'cancelled') &&
    onReschedule
  const estimate =
    job.status === 'paid' && job.amount != null
      ? formatMoney(job.amount, currency)
      : job.quotedCost != null
        ? formatMoney(job.quotedCost, currency)
        : '—'
  const materials = sumJobExpenses(job.expenses ?? [])
  const showMaterials = materials > 0 && job.status !== 'paid' && job.status !== 'cancelled'

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink">{job.clientName}</p>
          <p className="mt-0.5 truncate text-sm text-muted">{job.description}</p>
        </div>
        <StatusPill status={job.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <StatBox label="Date" value={formatDateTime(job.bookedAt)} />
        <StatBox label="Estimate" value={estimate} />
        {showMaterials ? (
          <>
            <StatBox label="Materials" value={formatMoney(materials, currency)} />
            <StatBox
              label="After materials"
              value={
                job.quotedCost != null
                  ? formatMoney(Math.max(0, job.quotedCost - materials), currency)
                  : '—'
              }
            />
          </>
        ) : (
          <>
            <StatBox label="Phone" value={job.phone || '—'} />
            <StatBox
              label="Booked"
              value={new Date(job.bookedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}
            />
          </>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 rounded-xl bg-stat px-3 py-2.5 text-sm font-semibold text-ink hover:bg-line/60"
        >
          Edit
        </button>
        {job.status === 'done' && onRecordPayment && (
          <button
            type="button"
            onClick={onRecordPayment}
            className="flex-1 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Record payment
          </button>
        )}
      </div>

      {showBookingActions && (
        <div className="mt-2">
          <JobBookingActions job={job} compact onReschedule={onReschedule} onDone={() => {}} />
        </div>
      )}
    </div>
  )
}

export function StockCard({
  name,
  quantity,
  lowThreshold,
  isLow,
  onAdjust,
}: {
  name: string
  quantity: number
  lowThreshold: number
  isLow: boolean
  onAdjust: () => void
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-ink">{name}</p>
          <p className="mt-0.5 text-sm text-muted">Alert below {lowThreshold}</p>
        </div>
        {isLow ? (
          <span className="rounded-full bg-danger-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-danger">
            Low
          </span>
        ) : (
          <span className="rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
            OK
          </span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <StatBox label="On hand" value={quantity} />
        <StatBox label="Min level" value={lowThreshold} />
      </div>
      <button
        type="button"
        onClick={onAdjust}
        className="mt-3 w-full rounded-xl bg-stat px-3 py-2.5 text-sm font-semibold text-ink hover:bg-line/60"
      >
        Adjust stock
      </button>
    </div>
  )
}

export function GivingJobCard({ job, currency }: { job: Job; currency: string }) {
  const materials = sumJobExpenses(job.expenses ?? [])
  return (
    <div className="border-b border-line px-4 py-3 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{job.clientName}</p>
          <p className="text-sm text-muted truncate">{job.description}</p>
        </div>
        <StatusPill status="paid" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <StatBox label="Charged" value={formatMoney(job.amount ?? 0, currency)} />
        <StatBox label="Materials" value={formatMoney(materials, currency)} />
        <StatBox label="Take home" value={formatMoney(takeHomeFromJob(job), currency)} />
        <StatBox label="Tithe" value={formatMoney(job.titheAmount ?? 0, currency)} />
        <StatBox label="Offering" value={formatMoney(job.offeringAmount ?? 0, currency)} />
      </div>
    </div>
  )
}
