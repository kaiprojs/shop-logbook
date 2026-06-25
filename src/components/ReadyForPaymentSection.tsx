import { useMemo } from 'react'
import type { Job } from '../types'
import { JobCard } from './cards'

interface ReadyForPaymentSectionProps {
  jobs: Job[]
  currency: string
  onRecordPayment: (job: Job) => void
  onOpenJob?: (job: Job) => void
}

export function ReadyForPaymentSection({
  jobs,
  currency,
  onRecordPayment,
  onOpenJob,
}: ReadyForPaymentSectionProps) {
  const ready = useMemo(
    () =>
      jobs
        .filter((j) => j.status === 'done')
        .sort((a, b) => new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime()),
    [jobs],
  )

  if (ready.length === 0) return null

  return (
    <section className="mb-6 space-y-3">
      <h2 className="section-label">Awaiting payment ({ready.length})</h2>
      <div className="space-y-3">
        {ready.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            currency={currency}
            onOpen={() => {
              onOpenJob?.(job)
            }}
            onRecordPayment={() => onRecordPayment(job)}
          />
        ))}
      </div>
    </section>
  )
}
