export function formatMoney(amount: number, currency = 'BBD'): string {
  return new Intl.NumberFormat('en-BB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export function sumJobExpenses(expenses: { amount: number }[]): number {
  return roundMoney(expenses.reduce((s, e) => s + e.amount, 0))
}

export function netAfterMaterials(gross: number, expenses: { amount: number }[]): number {
  return roundMoney(Math.max(0, gross - sumJobExpenses(expenses)))
}

export function calcGiving(amount: number, tithePercent: number, offeringPercent: number) {
  const tithe = roundMoney((amount * tithePercent) / 100)
  const offering = roundMoney((amount * offeringPercent) / 100)
  return { tithe, offering, total: roundMoney(tithe + offering), takeHome: roundMoney(amount - tithe - offering) }
}

export function calcGivingFromPayment(
  gross: number,
  expenses: { amount: number }[],
  tithePercent: number,
  offeringPercent: number,
) {
  const materials = sumJobExpenses(expenses)
  const titheBase = netAfterMaterials(gross, expenses)
  const { tithe, offering, takeHome } = calcGiving(titheBase, tithePercent, offeringPercent)
  return { gross, materials, titheBase, tithe, offering, takeHome }
}

export function takeHomeFromJob(job: {
  amount: number | null
  titheAmount: number | null
  offeringAmount: number | null
}): number {
  const amount = job.amount ?? 0
  return roundMoney(amount - (job.titheAmount ?? 0) - (job.offeringAmount ?? 0))
}

export function sumTakeHome(
  jobs: Array<{
    amount: number | null
    titheAmount: number | null
    offeringAmount: number | null
  }>,
): number {
  return roundMoney(jobs.reduce((s, j) => s + takeHomeFromJob(j), 0))
}
