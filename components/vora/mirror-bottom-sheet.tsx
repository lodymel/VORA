'use client'

import type { ReactNode } from 'react'

export function MirrorBottomSheet({
  open,
  title,
  onClose,
  dismissible = true,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  dismissible?: boolean
  children: ReactNode
}) {
  if (!open) return null

  return (
    <div className="vora-mirror-sheet" role="presentation">
      {dismissible && (
        <button
          type="button"
          className="vora-mirror-sheet-backdrop"
          onClick={onClose}
          aria-label="Close"
        />
      )}
      {!dismissible && <div className="vora-mirror-sheet-backdrop vora-mirror-sheet-backdrop--static" />}
      <div className="vora-mirror-sheet-panel" role="dialog" aria-label={title}>
        <div className="vora-mirror-sheet-handle" aria-hidden="true" />
        <p className="vora-mirror-sheet-title">{title}</p>
        {children}
      </div>
    </div>
  )
}
