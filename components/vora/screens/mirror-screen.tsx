'use client'

import { useEffect, useState } from 'react'
import { MirrorLightActions } from '../mirror-light-actions'
import { getAlbumTypoLines, MirrorTodaysLight } from '../mirror-todays-light'
import { MirrorPageShell } from '../mirror-page-shell'
import { MirrorStage } from '../mirror-stage'

export function MirrorScreen({
  todaysLight,
  alreadyInSky = false,
  onSaveLight,
  onWriteOwn,
}: {
  todaysLight: string
  alreadyInSky?: boolean
  onSaveLight: (sentence: string) => boolean
  onWriteOwn: () => void
}) {
  const [savedFlash, setSavedFlash] = useState(false)
  const inSky = alreadyInSky || savedFlash

  useEffect(() => {
    if (!savedFlash) return
    const timer = window.setTimeout(() => setSavedFlash(false), 2800)
    return () => window.clearTimeout(timer)
  }, [savedFlash])

  function handleSave() {
    if (inSky) return
    const added = onSaveLight(todaysLight)
    if (added) setSavedFlash(true)
  }

  const tapHint = alreadyInSky
    ? 'In your Sky'
    : savedFlash
      ? 'Held in your Sky'
      : 'Hold this Light'

  const albumLines = getAlbumTypoLines(todaysLight)

  return (
    <MirrorPageShell>
      <MirrorStage
        headline={
          <MirrorTodaysLight
            lines={albumLines}
            glowing={savedFlash}
            saveStar={savedFlash}
            tappable={!alreadyInSky}
            tapDisabled={inSky}
            onTap={handleSave}
          />
        }
        tapHint={tapHint}
        tapHintSaved={inSky}
        secondary={<MirrorLightActions onWrite={onWriteOwn} dimmed={savedFlash} />}
      />
    </MirrorPageShell>
  )
}
