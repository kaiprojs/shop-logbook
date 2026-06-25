import type { Job } from '../types'
import { toLocalDateInput } from './dates'
import { sumJobExpenses } from './money'

function csvCell(value: string | number): string {
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function exportPaidJobsCsv(jobs: Job[], filename: string) {
  const paid = jobs
    .filter((j) => j.status === 'paid' && j.paidAt)
    .sort((a, b) => new Date(a.paidAt!).getTime() - new Date(b.paidAt!).getTime())

  const headers = ['Date', 'Client', 'Phone', 'Job', 'Charged', 'Materials', 'Tithe', 'Offering']
  const rows = paid.map((j) => [
    toLocalDateInput(j.paidAt!),
    j.clientName,
    j.phone,
    j.description,
    j.amount ?? 0,
    sumJobExpenses(j.expenses ?? []),
    j.titheAmount ?? 0,
    j.offeringAmount ?? 0,
  ])

  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
