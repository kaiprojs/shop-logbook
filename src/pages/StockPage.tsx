import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Layout, IconButton } from '../components/Layout'
import { HeroCard, StockCard } from '../components/cards'
import { Modal } from '../components/Modal'
import {
  Field,
  TextInput,
  PrimaryButton,
  SecondaryButton,
  EmptyState,
} from '../components/ui'

export function StockPage() {
  const { stockItems, addStockItem, adjustStock, deleteStockItem } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [adjustItem, setAdjustItem] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [lowThreshold, setLowThreshold] = useState('2')

  const [delta, setDelta] = useState('')
  const [reason, setReason] = useState('')

  const sorted = [...stockItems].sort((a, b) => a.name.localeCompare(b.name))
  const lowStock = sorted.filter((i) => i.quantity <= i.lowThreshold)

  function handleAdd() {
    const qty = Number(quantity)
    const low = Number(lowThreshold)
    if (!name.trim() || isNaN(qty) || qty < 0) return
    addStockItem(name.trim(), qty, isNaN(low) ? 2 : low)
    setName('')
    setQuantity('')
    setLowThreshold('2')
    setShowAdd(false)
  }

  function handleAdjust() {
    const d = Number(delta)
    if (!adjustItem || isNaN(d) || d === 0 || !reason.trim()) return
    adjustStock(adjustItem, d, reason.trim())
    setAdjustItem(null)
    setDelta('')
    setReason('')
  }

  const adjustingItem = stockItems.find((i) => i.id === adjustItem)

  return (
    <Layout
      title="Stock"
      subtitle="Materials & supplies"
      action={
        <IconButton onClick={() => setShowAdd(true)} label="Add stock">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </IconButton>
      }
    >
      <HeroCard
        title="Inventory"
        description="Keep track of what is on the shelf."
        stats={[
          { label: 'Items', value: stockItems.length },
          { label: 'Low', value: lowStock.length },
          { label: 'OK', value: stockItems.length - lowStock.length },
        ]}
      />

      {lowStock.length > 0 && (
        <div className="mb-4 rounded-2xl border border-danger/20 bg-danger-soft p-4">
          <p className="text-sm font-semibold text-danger">Low stock alert</p>
          <p className="mt-1 text-sm text-danger/80">
            {lowStock.map((i) => `${i.name} (${i.quantity})`).join(' · ')}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <EmptyState>No stock items yet</EmptyState>
        ) : (
          sorted.map((item) => {
            const isLow = item.quantity <= item.lowThreshold
            return (
              <StockCard
                key={item.id}
                name={item.name}
                quantity={item.quantity}
                lowThreshold={item.lowThreshold}
                isLow={isLow}
                onAdjust={() => setAdjustItem(item.id)}
              />
            )
          })
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add stock item">
        <div className="space-y-4">
          <Field label="Item name">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Primer"
            />
          </Field>
          <Field label="Quantity">
            <TextInput
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>
          <Field label="Low stock alert at">
            <TextInput
              type="number"
              min="0"
              value={lowThreshold}
              onChange={(e) => setLowThreshold(e.target.value)}
            />
          </Field>
          <PrimaryButton onClick={handleAdd}>Add item</PrimaryButton>
        </div>
      </Modal>

      <Modal
        open={!!adjustItem}
        onClose={() => setAdjustItem(null)}
        title={`Adjust: ${adjustingItem?.name ?? ''}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Current quantity:{' '}
            <span className="font-semibold tabular-nums text-ink">{adjustingItem?.quantity}</span>
          </p>
          <Field label="Change (+ or -)">
            <TextInput
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="e.g. -1 or +5"
            />
          </Field>
          <Field label="Reason">
            <TextInput
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Used on job, new delivery, wastage"
            />
          </Field>
          <PrimaryButton onClick={handleAdjust}>Save adjustment</PrimaryButton>
          {adjustingItem && (
            <SecondaryButton
              onClick={() => {
                if (confirm(`Delete ${adjustingItem.name}?`)) {
                  deleteStockItem(adjustingItem.id)
                  setAdjustItem(null)
                }
              }}
              className="!text-danger !bg-danger-soft"
            >
              Delete item
            </SecondaryButton>
          )}
        </div>
      </Modal>
    </Layout>
  )
}
