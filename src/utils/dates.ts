export function toLocalDateInput(iso: string): string {
  const d = new Date(iso)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 10)
}

export function toLocalDateTimeInput(iso: string): string {
  const d = new Date(iso)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

export function startOfDay(iso: string): Date {
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(iso: string): Date {
  const d = new Date(iso)
  d.setHours(23, 59, 59, 999)
  return d
}

export function isSameDay(a: string, b: string): boolean {
  return toLocalDateInput(a) === toLocalDateInput(b)
}

export function isToday(iso: string): boolean {
  return isSameDay(iso, new Date().toISOString())
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function monthKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonth(key: string): string {
  const [year, month] = key.split('-')
  const d = new Date(Number(year), Number(month) - 1, 1)
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

/** SDA week: Sunday 00:00 through Saturday 23:59 (local time). */
export function getSdaWeekStart(ref: Date = new Date()): Date {
  const d = new Date(ref)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0 = Sunday
  d.setDate(d.getDate() - day)
  return d
}

export function getSdaWeekEnd(ref: Date = new Date()): Date {
  const start = getSdaWeekStart(ref)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

export function sdaWeekKey(ref: Date = new Date()): string {
  return toLocalDateInput(getSdaWeekStart(ref).toISOString())
}

export function isInSdaWeek(iso: string, ref: Date = new Date()): boolean {
  const t = new Date(iso).getTime()
  return t >= getSdaWeekStart(ref).getTime() && t <= getSdaWeekEnd(ref).getTime()
}

export function formatSdaWeekRange(ref: Date = new Date()): string {
  const start = getSdaWeekStart(ref)
  const end = getSdaWeekEnd(ref)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(end)}`
}

export function formatDayHeading(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })
}

export function shiftWeek(ref: Date, weeks: number): Date {
  const d = new Date(ref)
  d.setDate(d.getDate() + weeks * 7)
  return d
}

export function shiftMonth(ref: Date, months: number): Date {
  const d = new Date(ref)
  d.setDate(1)
  d.setMonth(d.getMonth() + months)
  return d
}

export function yearFromDate(d: Date): number {
  return d.getFullYear()
}

export function isInMonth(iso: string, ref: Date): boolean {
  return monthKey(iso) === monthKey(ref.toISOString())
}

export function isInYear(iso: string, year: number): boolean {
  return new Date(iso).getFullYear() === year
}

export function formatYear(year: number): string {
  return String(year)
}
