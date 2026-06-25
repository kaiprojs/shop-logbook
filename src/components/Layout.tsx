import type { ReactNode } from 'react'
import { NavIcon } from './NavIcons'
import { AppMenu } from './AppMenu'

type Tab = 'today' | 'jobs' | 'giving' | 'stock'

const tabs: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'giving', label: 'Giving' },
  { id: 'stock', label: 'Stock' },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: Tab
  onChange: (tab: Tab) => void
}) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              active === tab.id ? 'text-accent' : 'text-faint'
            }`}
          >
            <NavIcon tab={tab.id} active={active === tab.id} />
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

export function Layout({
  title,
  subtitle,
  children,
  action,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-24 pt-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <AppMenu />
        </div>
      </header>
      {children}
    </div>
  )
}

export function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stat text-accent hover:bg-line/60"
    >
      {children}
    </button>
  )
}

export type { Tab }
