import type { JobStatus } from '../types'

export const STATUS_LABELS: Record<JobStatus, string> = {
  booked: 'Booked',
  in_progress: 'In progress',
  done: 'Ready',
  paid: 'Paid',
  cancelled: 'Cancelled',
}

const PILL_STYLES: Record<JobStatus, string> = {
  booked: 'bg-accent-soft text-accent',
  in_progress: 'bg-warn-soft text-warn-text',
  done: 'bg-danger-soft text-danger',
  paid: 'bg-success-soft text-success',
  cancelled: 'bg-stat text-muted',
}

export function StatusPill({ status }: { status: JobStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${PILL_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

/** @deprecated use StatusPill */
export function StatusBadge({ status }: { status: JobStatus }) {
  return <StatusPill status={status} />
}
