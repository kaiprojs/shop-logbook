import { useState } from 'react'
import type { Job } from '../types'
import { useStore } from '../store/useStore'
import { Field, TextInput, TextArea, Select, PrimaryButton, InfoBox } from './ui'
import { JobExpenses } from './JobExpenses'
import { formatMoney, sumJobExpenses, takeHomeFromJob } from '../utils/money'
import { toLocalDateTimeInput } from '../utils/dates'
import { STATUS_LABELS } from './StatusBadge'

interface JobFormProps {
  job?: Job
  onDone: () => void
}

function parseCost(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function JobForm({ job, onDone }: JobFormProps) {
  const { jobs, addJob, updateJob, deleteJob, settings } = useStore()
  const liveJob = job ? jobs.find((j) => j.id === job.id) ?? job : undefined
  const isEdit = !!liveJob
  const isPaid = liveJob?.status === 'paid'
  const isCancelled = liveJob?.status === 'cancelled'

  const [clientName, setClientName] = useState(liveJob?.clientName ?? job?.clientName ?? '')
  const [phone, setPhone] = useState(liveJob?.phone ?? job?.phone ?? '')
  const [description, setDescription] = useState(liveJob?.description ?? job?.description ?? '')
  const [bookedAt, setBookedAt] = useState(
    liveJob?.bookedAt ?? job?.bookedAt
      ? toLocalDateTimeInput((liveJob?.bookedAt ?? job?.bookedAt)!)
      : toLocalDateTimeInput(new Date().toISOString()),
  )
  const [status, setStatus] = useState(liveJob?.status ?? job?.status ?? 'booked')
  const [cost, setCost] = useState(
    () => (liveJob?.quotedCost ?? job?.quotedCost ?? job?.amount)?.toString() ?? '',
  )
  const [showMoreActions, setShowMoreActions] = useState(false)

  const parsedCost = parseCost(cost)
  const editableStatuses = (Object.keys(STATUS_LABELS) as Job['status'][]).filter(
    (s) => s !== 'paid' && s !== 'cancelled',
  )

  function handleSave() {
    if (!clientName.trim() || !description.trim()) return

    const bookedIso = new Date(bookedAt).toISOString()

    if (isEdit && liveJob) {
      if (!isPaid && !isCancelled) {
        updateJob(liveJob.id, {
          clientName: clientName.trim(),
          phone: phone.trim(),
          description: description.trim(),
          bookedAt: bookedIso,
          status,
          quotedCost: parsedCost,
        })
      } else {
        updateJob(liveJob.id, {
          clientName: clientName.trim(),
          phone: phone.trim(),
          description: description.trim(),
          bookedAt: bookedIso,
        })
      }
    } else {
      addJob({
        clientName: clientName.trim(),
        phone: phone.trim(),
        description: description.trim(),
        bookedAt: bookedIso,
        quotedCost: parsedCost,
      })
    }
    onDone()
  }

  function handleDelete() {
    if (!liveJob) return
    const message =
      liveJob.status === 'paid'
        ? 'Delete this paid job? It will be removed from your income and tithe records.'
        : 'Delete this job permanently?'
    if (confirm(message)) {
      deleteJob(liveJob.id)
      onDone()
    }
  }

  return (
    <>
      <div className="space-y-4">
        <Field label="Client name">
          <TextInput
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Dave"
            autoFocus
          />
        </Field>

        <Field label="Phone">
          <TextInput
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07..."
            type="tel"
          />
        </Field>

        <Field label="Job description">
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bumper scratch repair"
          />
        </Field>

        {!isCancelled && (
          <Field label="Booked date & time">
            <TextInput
              type="datetime-local"
              value={bookedAt}
              onChange={(e) => setBookedAt(e.target.value)}
            />
          </Field>
        )}

        {isEdit && !isPaid && !isCancelled && (
          <Field label="Status">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as Job['status'])}
            >
              {editableStatuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {!isPaid && !isCancelled && (
          <div className="card-inset space-y-3 p-4">
            <Field label="Estimate (BDS)">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="2000.00"
              />
            </Field>
            <p className="text-xs text-faint">
              What you plan to charge the customer. Add purchases below as you buy materials.
            </p>
          </div>
        )}

        {isEdit && liveJob && <JobExpenses job={liveJob} estimate={parsedCost} />}

        {isPaid && liveJob && liveJob.amount != null && (
          <InfoBox>
            <p className="font-medium text-ink">
              Charged: {formatMoney(liveJob.amount, settings.currency)}
            </p>
            {sumJobExpenses(liveJob.expenses ?? []) > 0 && (
              <p className="mt-1 text-sm text-muted">
                Materials: {formatMoney(sumJobExpenses(liveJob.expenses ?? []), settings.currency)}
              </p>
            )}
            <p className="mt-2 text-lg font-bold tabular-nums text-ink">
              Take home: {formatMoney(takeHomeFromJob(liveJob), settings.currency)}
            </p>
            <p className="mt-1">
              Tithe: {formatMoney(liveJob.titheAmount ?? 0, settings.currency)} · Offering:{' '}
              {formatMoney(liveJob.offeringAmount ?? 0, settings.currency)}
            </p>
          </InfoBox>
        )}

        {isPaid && liveJob && <JobExpenses job={liveJob} estimate={liveJob.amount} />}

        <PrimaryButton onClick={handleSave}>
          {isEdit ? 'Save changes' : 'Add booking'}
        </PrimaryButton>

        {isEdit && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setShowMoreActions((open) => !open)}
              className="text-sm font-semibold text-muted hover:text-ink"
            >
              {showMoreActions ? 'Hide actions' : 'More actions'}
            </button>
            {showMoreActions && (
              <button
                type="button"
                onClick={handleDelete}
                className="mt-3 w-full rounded-xl bg-danger-soft px-3 py-2.5 text-sm font-semibold text-danger hover:bg-danger-soft/80"
              >
                Delete this job
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
