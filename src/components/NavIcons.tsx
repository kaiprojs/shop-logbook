import type { Tab } from './Layout'

const iconClass = 'h-6 w-6'

export function NavIcon({ tab, active }: { tab: Tab; active: boolean }) {
  const stroke = active ? 'currentColor' : 'currentColor'
  const fill = active ? 'currentColor' : 'none'

  switch (tab) {
    case 'today':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
          <path
            d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"
            fill={active ? fill : 'none'}
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'jobs':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
          <rect x="4" y="4" width="16" height="16" rx="3" fill={active ? fill : 'none'} />
          <path d="M8 9h8M8 13h5" strokeLinecap="round" />
        </svg>
      )
    case 'giving':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
          <path
            d="M12 3v18M7 8c0-2.2 2.2-4 5-4s5 1.8 5 4c0 3.5-5 6-5 6s-5-2.5-5-6z"
            fill={active ? fill : 'none'}
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'stock':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75">
          <path
            d="M4 8l8-4 8 4v8l-8 4-8-4V8z"
            fill={active ? fill : 'none'}
            strokeLinejoin="round"
          />
          <path d="M12 12v8M4 8l8 4 8-4" strokeLinejoin="round" />
        </svg>
      )
  }
}
