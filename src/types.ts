export type JobStatus = 'booked' | 'in_progress' | 'done' | 'paid' | 'cancelled'

export interface JobExpense {
  id: string
  description: string
  amount: number
  date: string
}

export interface Job {
  id: string
  clientName: string
  phone: string
  description: string
  bookedAt: string
  status: JobStatus
  quotedCost: number | null
  expenses: JobExpense[]
  amount: number | null
  paidAt: string | null
  titheAmount: number | null
  offeringAmount: number | null
  createdAt: string
}

export interface StockItem {
  id: string
  name: string
  quantity: number
  lowThreshold: number
}

export interface StockAdjustment {
  id: string
  stockItemId: string
  delta: number
  reason: string
  date: string
}

export interface Settings {
  tithePercent: number
  offeringPercent: number
  currency: string
}

export interface AppData {
  jobs: Job[]
  stockItems: StockItem[]
  stockAdjustments: StockAdjustment[]
  settings: Settings
}
