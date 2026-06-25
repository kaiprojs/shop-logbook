import type { Job } from '../types'
import { useStore } from '../store/useStore'
import { GhostButton } from './ui'

interface JobBookingActionsProps {
  job: Job
  onReschedule: () => void
  onDone: () => void
  compact?: boolean
  className?: string
}

export function JobBookingActions({
  job,
  onReschedule,
  onDone,
  compact = false,
  className = '',
}: JobBookingActionsProps) {
  const { updateJob } = useStore()

  const canManage =
    job.status === 'booked' || job.status === 'in_progress' || job.status === 'cancelled'

  if (!canManage) return null

  function handleCancel() {
    if (!confirm(`Cancel booking for ${job.clientName}?`)) return
    updateJob(job.id, { status: 'cancelled' })
    onDone()
  }

  return (
    <div className={`flex gap-2 ${compact ? '' : 'flex-col'} ${className}`}>
      <GhostButton onClick={onReschedule} className={compact ? 'flex-1' : 'w-full'}>
        {job.status === 'cancelled' ? 'Rebook' : 'Reschedule'}
      </GhostButton>
      {job.status !== 'cancelled' && (
        <button
          type="button"
          onClick={handleCancel}
          className={`rounded-xl bg-danger-soft px-3 py-2 text-sm font-semibold text-danger hover:bg-danger-soft/80 ${
            compact ? 'flex-1' : 'w-full py-3'
          }`}
        >
          Cancel
        </button>
      )}
    </div>
  )
}
