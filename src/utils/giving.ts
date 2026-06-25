import type { Job } from '../types'
import { toLocalDateInput, isInSdaWeek, isInMonth, isInYear } from './dates'
import { takeHomeFromJob, sumJobExpenses } from './money'

export interface DayJobGroup {
  dateKey: string
  jobs: Job[]
  income: number
  materials: number
  tithe: number
  offering: number
  takeHome: number
}
export function getPaidJobs(jobs: Job[]): Job[] {
  return jobs.filter((j) => j.status === 'paid' && j.paidAt)
}

export function getWeekPaidJobs(jobs: Job[], ref: Date = new Date()): Job[] {
  return getPaidJobs(jobs)
    .filter((j) => isInSdaWeek(j.paidAt!, ref))
    .sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime())
}

export function getMonthPaidJobs(jobs: Job[], ref: Date = new Date()): Job[] {
  return getPaidJobs(jobs)
    .filter((j) => isInMonth(j.paidAt!, ref))
    .sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime())
}

export function getYearPaidJobs(jobs: Job[], year: number): Job[] {
  return getPaidJobs(jobs)
    .filter((j) => isInYear(j.paidAt!, year))
    .sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime())
}

export function groupJobsByDay(jobs: Job[]): DayJobGroup[] {
  const map = new Map<string, Job[]>()

  for (const job of jobs) {
    if (!job.paidAt) continue
    const key = toLocalDateInput(job.paidAt)
    const list = map.get(key) ?? []
    list.push(job)
    map.set(key, list)
  }

  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, dayJobs]) => {
      const sorted = [...dayJobs].sort(
        (a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime(),
      )
      return {
        dateKey,
        jobs: sorted,
        income: sorted.reduce((s, j) => s + (j.amount ?? 0), 0),
        materials: sorted.reduce((s, j) => s + sumJobExpenses(j.expenses ?? []), 0),
        tithe: sorted.reduce((s, j) => s + (j.titheAmount ?? 0), 0),
        offering: sorted.reduce((s, j) => s + (j.offeringAmount ?? 0), 0),
        takeHome: sorted.reduce((s, j) => s + takeHomeFromJob(j), 0),
      }
    })
}

export function sumField(jobs: Job[], field: 'titheAmount' | 'offeringAmount' | 'amount'): number {
  return jobs.reduce((s, j) => s + (j[field] ?? 0), 0)
}

export function searchJobs(jobs: Job[], query: string): Job[] {
  const q = query.trim().toLowerCase()
  if (!q) return jobs
  return jobs.filter(
    (j) =>
      j.clientName.toLowerCase().includes(q) ||
      j.phone.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q),
  )
}

export function isActiveBooking(job: Job): boolean {
  return job.status === 'booked' || job.status === 'in_progress'
}
