import { useState } from 'react'
import { StoreProvider } from './store/useStore'
import { BottomNav, type Tab } from './components/Layout'
import { TodayPage } from './pages/TodayPage'
import { JobsPage } from './pages/JobsPage'
import { GivingPage } from './pages/GivingPage'
import { StockPage } from './pages/StockPage'

function AppContent() {
  const [tab, setTab] = useState<Tab>('today')

  return (
    <>
      {tab === 'today' && <TodayPage />}
      {tab === 'jobs' && <JobsPage />}
      {tab === 'giving' && <GivingPage />}
      {tab === 'stock' && <StockPage />}
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  )
}
