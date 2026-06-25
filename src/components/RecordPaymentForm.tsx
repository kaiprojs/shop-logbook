import { useState } from 'react'
import type { Job } from '../types'
import { useStore } from '../store/useStore'
import { Field, TextInput, PrimaryButton, InfoBox } from './ui'
import { calcGivingFromPayment, formatMoney } from '../utils/money'
import { formatDateTime } from '../utils/dates'

function parseCost(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) && n > 0 ? n : null
}

interface RecordPaymentFormProps {
  job: Job
  onDone: () => void
}

export function RecordPaymentForm({ job, onDone }: RecordPaymentFormProps) {
  const { markJobPaid, settings } = useStore()
  const [amount, setAmount] = useState((job.quotedCost ?? '').toString())

  const parsed = parseCost(amount)
  const preview = parsed
    ? calcGivingFromPayment(
        parsed,
        job.expenses ?? [],
        settings.tithePercent,
        settings.offeringPercent,
      )
    : null

  function handleConfirm() {
    if (!parsed) return
    markJobPaid(job.id, parsed)
    onDone()
  }

  return (
    <div className="space-y-4">
      <div className="card-inset p-4">
        <p className="text-lg font-semibold text-ink">{job.clientName}</p>
        <p className="mt-1 text-sm text-muted">{job.description}</p>
        <p className="mt-2 text-xs text-faint">{formatDateTime(job.bookedAt)}</p>
      </div>

      <Field label="Amount received (BDS)">
        <TextInput
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="180.00"
          autoFocus
        />
      </Field>

      {preview && (
        <InfoBox>
          <div className="space-y-1 text-sm text-muted">
            <p className="flex justify-between gap-2">
              <span>Estimate</span>
              <span className="font-semibold tabular-nums text-ink">
                {formatMoney(preview.gross, settings.currency)}
              </span>
            </p>
            {preview.materials > 0 && (
              <p className="flex justify-between gap-2">
                <span>Materials</span>
                <span className="font-semibold tabular-nums text-ink">
                  − {formatMoney(preview.materials, settings.currency)}
                </span>
              </p>
            )}
            {preview.materials > 0 && (
              <p className="flex justify-between gap-2 border-t border-line pt-2">
                <span>After materials</span>
                <span className="font-semibold tabular-nums text-ink">
                  {formatMoney(preview.titheBase, settings.currency)}
                </span>
              </p>
            )}
          </div>
          <p className="mt-3 text-lg font-bold tabular-nums text-ink">
            Take home: {formatMoney(preview.takeHome, settings.currency)}
          </p>
          <p className="mt-2 text-sm text-muted">
            Tithe ({settings.tithePercent}%):{' '}
            <span className="font-semibold tabular-nums text-ink">
              {formatMoney(preview.tithe, settings.currency)}
            </span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Offering ({settings.offeringPercent}%):{' '}
            <span className="font-semibold tabular-nums text-ink">
              {formatMoney(preview.offering, settings.currency)}
            </span>
          </p>
        </InfoBox>
      )}

      <PrimaryButton onClick={handleConfirm} disabled={!parsed}>
        Confirm payment
      </PrimaryButton>
    </div>
  )
}
