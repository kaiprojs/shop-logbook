import { useState } from 'react'
import type { Job } from '../types'
import { useStore } from '../store/useStore'
import { Field, TextInput, PrimaryButton } from './ui'
import { toLocalDateTimeInput } from '../utils/dates'
import { formatDateTime } from '../utils/dates'

interface RescheduleFormProps {
  job: Job
  onDone: () => void
}

export function RescheduleForm({ job, onDone }: RescheduleFormProps) {
  const { updateJob } = useStore()
  const [bookedAt, setBookedAt] = useState(toLocalDateTimeInput(job.bookedAt))
  const rebooking = job.status === 'cancelled'

  function handleSave() {
    updateJob(job.id, {
      bookedAt: new Date(bookedAt).toISOString(),
      ...(rebooking ? { status: 'booked' as const } : {}),
    })
    onDone()
  }

  return (
    <div className="space-y-4">
      <div className="card-inset p-4">
        <p className="font-semibold text-ink">{job.clientName}</p>
        <p className="mt-1 text-sm text-muted">{job.description}</p>
        <p className="mt-2 text-xs text-faint">Currently: {formatDateTime(job.bookedAt)}</p>
      </div>

      <Field label="New date & time">
        <TextInput
          type="datetime-local"
          value={bookedAt}
          onChange={(e) => setBookedAt(e.target.value)}
          autoFocus
        />
      </Field>

      <PrimaryButton onClick={handleSave}>
        {rebooking ? 'Rebook' : 'Reschedule'}
      </PrimaryButton>
    </div>
  )
}
