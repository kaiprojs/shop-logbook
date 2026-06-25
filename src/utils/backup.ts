import type { AppData } from '../types'

const BACKUP_META_KEY = 'shop-logbook-last-backup'

const defaultSettings: AppData['settings'] = {
  tithePercent: 10,
  offeringPercent: 5,
  currency: 'BBD',
}

export function normalizeAppData(raw: unknown): AppData | null {
  if (!raw || typeof raw !== 'object') return null
  const parsed = raw as AppData & { givingPayments?: unknown[]; version?: number; exportedAt?: string }
  if (!Array.isArray(parsed.jobs)) return null

  return {
    jobs: parsed.jobs.map((j) => ({
      ...j,
      quotedCost: j.quotedCost ?? null,
      expenses: Array.isArray(j.expenses) ? j.expenses : [],
    })),
    stockItems: Array.isArray(parsed.stockItems) ? parsed.stockItems : [],
    stockAdjustments: Array.isArray(parsed.stockAdjustments) ? parsed.stockAdjustments : [],
    settings: { ...defaultSettings, ...parsed.settings, currency: 'BBD' },
  }
}

function downloadJson(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportFullBackup(data: AppData) {
  const exportedAt = new Date().toISOString()
  const date = exportedAt.slice(0, 10)
  downloadJson(
    {
      version: 1,
      exportedAt,
      jobs: data.jobs,
      stockItems: data.stockItems,
      stockAdjustments: data.stockAdjustments,
      settings: data.settings,
    },
    `shop-logbook-backup-${date}.json`,
  )
  localStorage.setItem(BACKUP_META_KEY, exportedAt)
}

export function getLastBackupAt(): string | null {
  return localStorage.getItem(BACKUP_META_KEY)
}

export async function readBackupFile(file: File): Promise<AppData | null> {
  try {
    const text = await file.text()
    const parsed = JSON.parse(text) as unknown
    return normalizeAppData(parsed)
  } catch {
    return null
  }
}
