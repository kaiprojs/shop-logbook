import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppData,
  Job,
  JobStatus,
  Settings,
  StockAdjustment,
  StockItem,
} from '../types'
import { calcGivingFromPayment } from '../utils/money'
import { exportFullBackup, normalizeAppData } from '../utils/backup'

const STORAGE_KEY = 'shop-logbook-data'

const defaultSettings: Settings = {
  tithePercent: 10,
  offeringPercent: 5,
  currency: 'BBD',
}

const defaultData: AppData = {
  jobs: [],
  stockItems: [],
  stockAdjustments: [],
  settings: defaultSettings,
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData
    const parsed = JSON.parse(raw) as unknown
    return normalizeAppData(parsed) ?? defaultData
  } catch {
    return defaultData
  }
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function uid(): string {
  return crypto.randomUUID()
}

interface StoreContextValue {
  jobs: Job[]
  stockItems: StockItem[]
  stockAdjustments: StockAdjustment[]
  settings: Settings
  addJob: (input: Omit<Job, 'id' | 'createdAt' | 'status' | 'amount' | 'paidAt' | 'titheAmount' | 'offeringAmount' | 'expenses'>) => void
  updateJob: (id: string, patch: Partial<Job>) => void
  addJobExpense: (jobId: string, description: string, amount: number) => void
  removeJobExpense: (jobId: string, expenseId: string) => void
  markJobPaid: (id: string, amount: number) => void
  deleteJob: (id: string) => void
  addStockItem: (name: string, quantity: number, lowThreshold: number) => void
  adjustStock: (stockItemId: string, delta: number, reason: string) => void
  deleteStockItem: (id: string) => void
  exportBackup: () => void
  restoreBackup: (data: AppData) => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  const update = useCallback((fn: (prev: AppData) => AppData) => {
    setData((prev) => fn(prev))
  }, [])

  const addJob: StoreContextValue['addJob'] = useCallback(
    (input) => {
      const job: Job = {
        ...input,
        id: uid(),
        status: 'booked',
        quotedCost: input.quotedCost ?? null,
        expenses: [],
        amount: null,
        paidAt: null,
        titheAmount: null,
        offeringAmount: null,
        createdAt: new Date().toISOString(),
      }
      update((prev) => ({ ...prev, jobs: [job, ...prev.jobs] }))
    },
    [update],
  )

  const updateJob: StoreContextValue['updateJob'] = useCallback(
    (id, patch) => {
      update((prev) => ({
        ...prev,
        jobs: prev.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
      }))
    },
    [update],
  )

  const addJobExpense: StoreContextValue['addJobExpense'] = useCallback(
    (jobId, description, amount) => {
      const expense = {
        id: uid(),
        description: description.trim(),
        amount,
        date: new Date().toISOString(),
      }
      update((prev) => ({
        ...prev,
        jobs: prev.jobs.map((j) =>
          j.id === jobId ? { ...j, expenses: [expense, ...(j.expenses ?? [])] } : j,
        ),
      }))
    },
    [update],
  )

  const removeJobExpense: StoreContextValue['removeJobExpense'] = useCallback(
    (jobId, expenseId) => {
      update((prev) => ({
        ...prev,
        jobs: prev.jobs.map((j) =>
          j.id === jobId
            ? { ...j, expenses: (j.expenses ?? []).filter((e) => e.id !== expenseId) }
            : j,
        ),
      }))
    },
    [update],
  )

  const markJobPaid: StoreContextValue['markJobPaid'] = useCallback(
    (id, amount) => {
      update((prev) => {
        const { tithePercent, offeringPercent } = prev.settings
        return {
          ...prev,
          jobs: prev.jobs.map((j) => {
            if (j.id !== id) return j
            const { tithe, offering } = calcGivingFromPayment(
              amount,
              j.expenses ?? [],
              tithePercent,
              offeringPercent,
            )
            return {
              ...j,
              status: 'paid' as JobStatus,
              amount,
              paidAt: new Date().toISOString(),
              titheAmount: tithe,
              offeringAmount: offering,
            }
          }),
        }
      })
    },
    [update],
  )

  const deleteJob: StoreContextValue['deleteJob'] = useCallback(
    (id) => {
      update((prev) => ({ ...prev, jobs: prev.jobs.filter((j) => j.id !== id) }))
    },
    [update],
  )

  const addStockItem: StoreContextValue['addStockItem'] = useCallback(
    (name, quantity, lowThreshold) => {
      const item: StockItem = {
        id: uid(),
        name,
        quantity,
        lowThreshold,
      }
      update((prev) => ({ ...prev, stockItems: [...prev.stockItems, item] }))
    },
    [update],
  )

  const adjustStock: StoreContextValue['adjustStock'] = useCallback(
    (stockItemId, delta, reason) => {
      const adjustment: StockAdjustment = {
        id: uid(),
        stockItemId,
        delta,
        reason,
        date: new Date().toISOString(),
      }
      update((prev) => ({
        ...prev,
        stockAdjustments: [adjustment, ...prev.stockAdjustments],
        stockItems: prev.stockItems.map((item) =>
          item.id === stockItemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        ),
      }))
    },
    [update],
  )

  const deleteStockItem: StoreContextValue['deleteStockItem'] = useCallback(
    (id) => {
      update((prev) => ({
        ...prev,
        stockItems: prev.stockItems.filter((i) => i.id !== id),
      }))
    },
    [update],
  )

  const exportBackup: StoreContextValue['exportBackup'] = useCallback(() => {
    exportFullBackup(data)
  }, [data])

  const restoreBackup: StoreContextValue['restoreBackup'] = useCallback((backup) => {
    setData(backup)
  }, [])

  const value: StoreContextValue = {
    jobs: data.jobs,
    stockItems: data.stockItems,
    stockAdjustments: data.stockAdjustments,
    settings: data.settings,
    addJob,
    updateJob,
    addJobExpense,
    removeJobExpense,
    markJobPaid,
    deleteJob,
    addStockItem,
    adjustStock,
    deleteStockItem,
    exportBackup,
    restoreBackup,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
