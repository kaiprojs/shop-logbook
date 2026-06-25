import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { Layout, IconButton } from '../components/Layout'
import { HeroCard, JobCard, QuickAction, QuickActions } from '../components/cards'
import { Modal } from '../components/Modal'
import { JobForm } from '../components/JobForm'
import { RecordPaymentForm } from '../components/RecordPaymentForm'
import { RescheduleForm } from '../components/RescheduleForm'
import { ReadyForPaymentSection } from '../components/ReadyForPaymentSection'
import { EmptyState } from '../components/ui'
import { formatMoney, sumTakeHome } from '../utils/money'
import { isToday } from '../utils/dates'
import { getWeekPaidJobs } from '../utils/giving'
import { exportPaidJobsCsv } from '../utils/export'
import type { Job } from '../types'

export function TodayPage() {
  const { jobs, settings } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [paymentJob, setPaymentJob] = useState<Job | null>(null)
  const [rescheduleJob, setRescheduleJob] = useState<Job | null>(null)

  const todayJobs = jobs
    .filter(
      (j) =>
        isToday(j.bookedAt) &&
        j.status !== 'paid' &&
        j.status !== 'done' &&
        j.status !== 'cancelled',
    )
    .sort((a, b) => new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime())

  const upcoming = jobs
    .filter((j) => !isToday(j.bookedAt) && j.status === 'booked')
    .sort((a, b) => new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime())
    .slice(0, 3)

  const awaitingPaymentCount = jobs.filter((j) => j.status === 'done').length
  const weekTakeHome = useMemo(() => sumTakeHome(getWeekPaidJobs(jobs)), [jobs])

  return (
    <Layout
      title="My shop"
      subtitle="Jobs & income overview"
      action={
        <IconButton onClick={() => setShowAdd(true)} label="New job">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </IconButton>
      }
    >
      <HeroCard
        title="Shop logbook"
        description="Track bookings, payments, and tithe from one place."
        stats={[
          { label: 'Today', value: todayJobs.length },
          { label: 'To collect', value: awaitingPaymentCount },
          {
            label: 'Take home',
            value: formatMoney(weekTakeHome, settings.currency),
          },
        ]}
      />

      <ReadyForPaymentSection
        jobs={jobs}
        currency={settings.currency}
        onRecordPayment={setPaymentJob}
        onOpenJob={setSelectedJob}
      />

      <section className="space-y-3">
        <h2 className="section-label">Scheduled today ({todayJobs.length})</h2>
        {todayJobs.length === 0 ? (
          <EmptyState>
            No jobs booked for today.{' '}
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="mt-2 font-semibold text-accent"
            >
              Log a call
            </button>
          </EmptyState>
        ) : (
          todayJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              currency={settings.currency}
              onOpen={() => setSelectedJob(job)}
              onReschedule={() => setRescheduleJob(job)}
            />
          ))
        )}
      </section>

      {upcoming.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="section-label">Coming up</h2>
          {upcoming.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              currency={settings.currency}
              onOpen={() => setSelectedJob(job)}
              onReschedule={() => setRescheduleJob(job)}
            />
          ))}
        </section>
      )}

      <QuickActions>
        <QuickAction
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          }
          label="New job"
          onClick={() => setShowAdd(true)}
        />
        <QuickAction
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12M8 11l4 4 4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          label="Export CSV"
          onClick={() => exportPaidJobsCsv(getWeekPaidJobs(jobs), 'shop-logbook-week.csv')}
        />
      </QuickActions>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New booking">
        <JobForm onDone={() => setShowAdd(false)} />
      </Modal>

      <Modal open={!!selectedJob} onClose={() => setSelectedJob(null)} title="Job details">
        {selectedJob && <JobForm job={selectedJob} onDone={() => setSelectedJob(null)} />}
      </Modal>

      <Modal open={!!paymentJob} onClose={() => setPaymentJob(null)} title="Record payment">
        {paymentJob && (
          <RecordPaymentForm job={paymentJob} onDone={() => setPaymentJob(null)} />
        )}
      </Modal>

      <Modal open={!!rescheduleJob} onClose={() => setRescheduleJob(null)} title="Reschedule">
        {rescheduleJob && (
          <RescheduleForm job={rescheduleJob} onDone={() => setRescheduleJob(null)} />
        )}
      </Modal>
    </Layout>
  )
}
