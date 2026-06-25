import { useState } from 'react'
import type { Job } from '../types'
import { useStore } from '../store/useStore'
import { Field, TextInput, PrimaryButton } from './ui'
import { formatMoney, netAfterMaterials, sumJobExpenses } from '../utils/money'
import { formatDate } from '../utils/dates'

function parseAmount(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) && n > 0 ? n : null
}

interface JobExpensesProps {
  job: Job
  estimate: number | null
}

export function JobExpenses({ job, estimate }: JobExpensesProps) {
  const { addJobExpense, removeJobExpense, settings } = useStore()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const isLocked = job.status === 'paid' || job.status === 'cancelled'

  const expenses = job.expenses ?? []
  const materials = sumJobExpenses(expenses)
  const net =
    estimate != null && estimate > 0 ? netAfterMaterials(estimate, expenses) : null

  function handleAdd() {
    const parsed = parseAmount(amount)
    if (!description.trim() || !parsed) return
    addJobExpense(job.id, description, parsed)
    setDescription('')
    setAmount('')
  }

  return (
    <div className="card-inset space-y-3 p-4">
      <div>
        <h3 className="text-sm font-semibold text-ink">Materials & purchases</h3>
        <p className="mt-1 text-xs text-faint">
          Add purchases for this job — they deduct from the estimate.
        </p>
      </div>

      {(estimate != null || materials > 0) && (
        <div className="grid grid-cols-2 gap-2">
          {estimate != null && (
            <div className="rounded-xl bg-surface px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">Estimate</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
                {formatMoney(estimate, settings.currency)}
              </p>
            </div>
          )}
          <div className="rounded-xl bg-surface px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">Materials</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
              {formatMoney(materials, settings.currency)}
            </p>
          </div>
          {net != null && materials > 0 && (
            <div className="col-span-2 rounded-xl bg-accent-soft px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">
                After materials
              </p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-ink">
                {formatMoney(net, settings.currency)}
              </p>
            </div>
          )}
        </div>
      )}

      {expenses.length > 0 && (
        <ul className="space-y-2">
          {expenses.map((expense) => (
            <li
              key={expense.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{expense.description}</p>
                <p className="text-xs text-faint">{formatDate(expense.date)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold tabular-nums text-ink">
                  {formatMoney(expense.amount, settings.currency)}
                </span>
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => removeJobExpense(job.id, expense.id)}
                    className="text-xs font-semibold text-danger"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isLocked && (
        <div className="space-y-3 border-t border-line pt-3">
          <Field label="What did you buy?">
            <TextInput
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bumper, primer, clear coat..."
            />
          </Field>
          <Field label="Cost (BDS)">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="150.00"
            />
          </Field>
          <PrimaryButton
            onClick={handleAdd}
            disabled={!description.trim() || !parseAmount(amount)}
          >
            Add purchase
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}
