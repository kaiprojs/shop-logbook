import { useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { Modal } from './Modal'
import { PrimaryButton, SecondaryButton } from './ui'
import { getLastBackupAt, readBackupFile } from '../utils/backup'
import { formatDateTime } from '../utils/dates'

function MenuIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  )
}

export function AppMenu() {
  const { exportBackup, restoreBackup } = useStore()
  const [open, setOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [lastBackedUp, setLastBackedUp] = useState(getLastBackupAt)
  const [message, setMessage] = useState<string | null>(null)

  function handleBackup() {
    exportBackup()
    setLastBackedUp(getLastBackupAt())
    setMessage('Backup file downloaded. Save it to Files or iCloud.')
  }

  async function handleRestore(file: File) {
    const data = await readBackupFile(file)
    if (!data) {
      setMessage('Could not read that file. Pick a shop logbook backup (.json).')
      return
    }

    const jobCount = data.jobs.length
    if (
      !confirm(
        `Restore backup with ${jobCount} job${jobCount === 1 ? '' : 's'}? This replaces all current data on this phone.`,
      )
    ) {
      return
    }

    restoreBackup(data)
    setMessage('Backup restored.')
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stat text-accent hover:bg-line/60"
      >
        <MenuIcon />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Menu">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">Backup</h3>
            <p className="mt-1 text-sm text-muted">
              Save jobs, stock, and settings to a file. Keep it in Files, iCloud, or email.
            </p>
            {lastBackedUp && (
              <p className="mt-2 text-xs text-faint">Last backup: {formatDateTime(lastBackedUp)}</p>
            )}
            {message && <p className="mt-2 text-sm font-medium text-accent">{message}</p>}
          </div>

          <div className="flex gap-2">
            <PrimaryButton onClick={handleBackup} className="flex-1">
              Backup now
            </PrimaryButton>
            <SecondaryButton onClick={() => fileInputRef.current?.click()} className="flex-1">
              Restore
            </SecondaryButton>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleRestore(file)
              e.target.value = ''
            }}
          />
        </div>
      </Modal>
    </>
  )
}
