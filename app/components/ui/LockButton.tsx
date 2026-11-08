'use client'

interface LockButtonProps {
  locked: boolean
  onToggle: () => void
}

export default function LockButton({ locked, onToggle }: LockButtonProps) {
  return (
    <button
      onClick={e => {
        e.stopPropagation()
        onToggle()
      }}
      aria-label={locked ? 'Unlock recipe' : 'Lock recipe'}
      className={`
        relative flex items-center justify-center w-9 h-9 rounded-full
        transition-all duration-200 ease-out
        ${locked
          ? 'bg-white text-ink shadow-lg scale-110'
          : 'bg-black/20 text-white backdrop-blur-sm hover:bg-black/35'
        }
      `}
    >
      {locked ? (
        // Locked padlock
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="7.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M5 7.5V5a3 3 0 1 1 6 0v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <circle cx="8" cy="11" r="1" fill="currentColor"/>
        </svg>
      ) : (
        // Unlocked padlock
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="7.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M5 7.5V5a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <circle cx="8" cy="11" r="1" fill="currentColor"/>
        </svg>
      )}
    </button>
  )
}
