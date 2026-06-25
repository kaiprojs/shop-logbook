import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { Layout, IconButton } from '../components/Layout'
import { HeroCard, JobCard } from '../components/cards'
import { STATUS_LABELS } from '../components/StatusBadge'
import { Modal } from '../components/Modal'
import { JobForm } from '../components/JobForm'
import { RecordPaymentForm } from '../components/RecordPaymentForm'
import { RescheduleForm } from '../components/RescheduleForm'
import { ReadyForPaymentSection } from '../components/ReadyForPaymentSection'
import { TextInput, FilterChip, EmptyState } from '../components/ui'
import { getPaidJobs, searchJobs } from '../utils/giving'
import type { Job } from '../types'

type JobsView = 'active' | 'previous'
type ActiveFilter = 'all' | 'booked' | 'in_progress' | 'done'
type PreviousFilter = 'all' | 'cancelled'

const activeFilters: ActiveFilter[] = ['all', 'booked', 'in_progress', 'done']
const previousFilters: PreviousFilter[] = ['all', 'cancelled']

function JobsViewTabs({
  view,
  onChange,
}: {
  view: JobsView
  onChange: (v: JobsView) => void
}) {
  const tabs: { id: JobsView; label: string }[] = [
    { id: 'active', label: 'Active' },
    { id: 'previous', label: 'Previous' },
  ]
  return (
    <div className="mb-4 flex rounded-xl bg-stat p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            view === t.id ? 'bg-surface text-accent shadow-sm' : 'text-muted'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function JobsPage() {
  const { jobs, settings } = useStore()
  const [view, setView] = useState<JobsView>('active')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [previousFilter, setPreviousFilter] = useState<PreviousFilter>('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [paymentJob, setPaymentJob] = useState<Job | null>(null)
  const [rescheduleJob, setRescheduleJob] = useState<Job | null>(null)

  const filtered = useMemo(() => {
    if (view === 'previous') {
      let list =
        previousFilter === 'all'
          ? getPaidJobs(jobs)
          : jobs.filter((j) => j.status === 'cancelled')

      list = searchJobs(list, search)

      if (previousFilter === 'all') {
        return [...list].sort(
          (a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime(),
        )
      }

      return [...list].sort(
        (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime(),
      )
    }

    let list =
      activeFilter === 'all'
        ? jobs.filter((j) => j.status === 'booked' || j.status === 'in_progress')
        : jobs.filter((j) => j.status === activeFilter)

    list = searchJobs(list, search)
    return [...list].sort(
      (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime(),
    )
  }, [jobs, view, activeFilter, previousFilter, search])

  const showAwaitingSection = view === 'active' && activeFilter === 'all'

  const bookedCount = jobs.filter((j) => j.status === 'booked').length
  const inProgressCount = jobs.filter((j) => j.status === 'in_progress').length
  const readyCount = jobs.filter((j) => j.status === 'done').length
  const paidCount = jobs.filter((j) => j.status === 'paid').length
  const cancelledCount = jobs.filter((j) => j.status === 'cancelled').length

  function handleViewChange(next: JobsView) {
    setView(next)
    if (next === 'active') setActiveFilter('all')
    else setPreviousFilter('all')
    setSearch('')
  }

  function handlePaymentDone() {
    setPaymentJob(null)
    setView('previous')
    setPreviousFilter('all')
  }

  const filterChips =
    view === 'active'
      ? activeFilters.map((f) => (
          <FilterChip
            key={f}
            active={activeFilter === f}
            onClick={() => setActiveFilter(f)}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f]}
          </FilterChip>
        ))
      : previousFilters.map((f) => (
          <FilterChip
            key={f}
            active={previousFilter === f}
            onClick={() => setPreviousFilter(f)}
          >
            {f === 'all' ? 'Paid' : STATUS_LABELS.cancelled}
          </FilterChip>
        ))

  return (
    <Layout
      title="Jobs"
      subtitle={view === 'active' ? 'Current bookings' : 'Paid & cancelled jobs'}
      action={
        <IconButton onClick={() => setShowAdd(true)} label="New job">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </IconButton>
      }
    >
      <JobsViewTabs view={view} onChange={handleViewChange} />

      <HeroCard
        title={view === 'active' ? 'Active jobs' : 'Previous jobs'}
        description={
          view === 'active'
            ? 'Open bookings and jobs awaiting payment.'
            : 'Completed and cancelled bookings.'
        }
        stats={
          view === 'active'
            ? [
                { label: 'Booked', value: bookedCount },
                { label: 'In progress', value: inProgressCount },
                { label: 'To collect', value: readyCount },
              ]
            : [
                { label: 'Paid', value: paidCount },
                { label: 'Cancelled', value: cancelledCount },
              ]
        }
      />

      {showAwaitingSection && (
        <ReadyForPaymentSection
          jobs={jobs}
          currency={settings.currency}
          onRecordPayment={setPaymentJob}
          onOpenJob={setSelectedJob}
        />
      )}

      <div className="mb-3">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, job..."
        />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{filterChips}</div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState>
            {view === 'previous'
              ? previousFilter === 'cancelled'
                ? 'No cancelled jobs'
                : 'No paid jobs yet'
              : 'No jobs found'}
          </EmptyState>
        ) : (
          filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              currency={settings.currency}
              onOpen={() => setSelectedJob(job)}
              onRecordPayment={
                view === 'active' && activeFilter === 'done'
                  ? () => setPaymentJob(job)
                  : undefined
              }
              onReschedule={view === 'active' ? () => setRescheduleJob(job) : undefined}
            />
          ))
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New booking">
        <JobForm onDone={() => setShowAdd(false)} />
      </Modal>

      <Modal open={!!selectedJob} onClose={() => setSelectedJob(null)} title="Job details">
        {selectedJob && <JobForm job={selectedJob} onDone={() => setSelectedJob(null)} />}
      </Modal>

      <Modal open={!!paymentJob} onClose={() => setPaymentJob(null)} title="Record payment">
        {paymentJob && (
          <RecordPaymentForm job={paymentJob} onDone={handlePaymentDone} />
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
