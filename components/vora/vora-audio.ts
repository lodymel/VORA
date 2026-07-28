'use client'

/**
 * VORA sound — night-sky ambient + soft celestial cues.
 * Ambient bed: CC0 track (see public/audio/ATTRIBUTION.txt).
 * Cues: light Web Audio gestures over the bed.
 */

const SOUND_KEY = 'vora-sound-enabled'
const AMBIENT_SRC = '/audio/steller-dreams.mp3'
/** Soft under the UI — present, never harsh on phone speakers. */
const AMBIENT_LEVEL = 0.32

type Cue = 'enter' | 'hold' | 'select' | 'card' | 'write' | 'spark'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let ambientEl: HTMLAudioElement | null = null
let ambientSource: MediaElementAudioSourceNode | null = null
let ambientGain: GainNode | null = null
let enabled = false
let started = false
let visibilityBound = false

function loadEnabled(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const raw = window.localStorage.getItem(SOUND_KEY)
    // Explicit mute only — otherwise the sky prefers sound on.
    if (raw === '0') return false
    return true
  } catch {
    return true
  }
}

function saveEnabled(value: boolean) {
  try {
    window.localStorage.setItem(SOUND_KEY, value ? '1' : '0')
  } catch {
    // ignore
  }
}

function ensureContext() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.52
    master.connect(ctx.destination)
  }
  return ctx
}

async function resume() {
  const audio = ensureContext()
  if (!audio) return null
  if (audio.state === 'suspended') await audio.resume()
  return audio
}

function ensureAmbientGraph() {
  if (!ctx || !master) return null
  if (!ambientEl) {
    ambientEl = new Audio(AMBIENT_SRC)
    ambientEl.loop = true
    ambientEl.preload = 'auto'
    ambientEl.setAttribute('playsinline', '')
  }
  // MediaElementSource may only be created once per element.
  if (!ambientSource) {
    ambientSource = ctx.createMediaElementSource(ambientEl)
    ambientGain = ctx.createGain()
    ambientGain.gain.value = 0
    ambientSource.connect(ambientGain)
    ambientGain.connect(master)
  }
  return { el: ambientEl, gain: ambientGain! }
}

async function startAmbient() {
  if (!ctx || !master || !enabled) return
  const graph = ensureAmbientGraph()
  if (!graph) return

  const now = ctx.currentTime
  try {
    graph.gain.gain.cancelScheduledValues(now)
    graph.gain.gain.setValueAtTime(Math.max(graph.gain.gain.value, 0.0001), now)
    graph.gain.gain.linearRampToValueAtTime(AMBIENT_LEVEL, now + 2.8)
  } catch {
    graph.gain.gain.value = AMBIENT_LEVEL
  }

  try {
    if (graph.el.paused) {
      graph.el.currentTime = Math.min(graph.el.currentTime, 0.05)
      await graph.el.play()
    }
  } catch {
    // Autoplay may still be blocked until a gesture; enable() is gesture-bound.
  }
}

function stopAmbient() {
  if (!ctx || !ambientGain || !ambientEl) return
  const now = ctx.currentTime
  const stopAt = now + 1.15
  try {
    ambientGain.gain.cancelScheduledValues(now)
    ambientGain.gain.setValueAtTime(Math.max(ambientGain.gain.value, 0.0001), now)
    ambientGain.gain.linearRampToValueAtTime(0.0001, stopAt)
  } catch {
    // ignore
  }
  window.setTimeout(() => {
    try {
      ambientEl?.pause()
    } catch {
      // ignore
    }
  }, 1200)
}

function connectCueChain(peak: number, attack: number, duration: number) {
  if (!ctx || !master) return null
  const now = ctx.currentTime
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(peak, now + attack)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
  gain.connect(master)
  return { gain, now }
}

function startPartial(
  freq: number,
  type: OscillatorType,
  level: number,
  start: number,
  stop: number,
  dest: AudioNode,
  detune = 0,
) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.value = freq
  osc.detune.value = detune
  const g = ctx.createGain()
  g.gain.value = level
  osc.connect(g)
  g.connect(dest)
  osc.start(start)
  osc.stop(stop)
}

function playSparkle(dest: AudioNode, start: number, amount = 0.04) {
  if (!ctx) return
  const bufferSize = Math.floor(ctx.sampleRate * 0.12)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.2)
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 4200
  bp.Q.value = 0.9
  const g = ctx.createGain()
  g.gain.value = amount
  src.connect(bp)
  bp.connect(g)
  g.connect(dest)
  src.start(start)
}

function playEnter() {
  const chain = connectCueChain(0.16, 0.06, 1.35)
  if (!chain || !ctx) return
  const { gain, now } = chain
  const notes = [
    { freq: 440, at: 0, type: 'triangle' as const, level: 0.5 },
    { freq: 523.25, at: 0.14, type: 'sine' as const, level: 0.45 },
    { freq: 659.25, at: 0.28, type: 'sine' as const, level: 0.38 },
  ]
  for (const n of notes) {
    startPartial(n.freq, n.type, n.level, now + n.at, now + 1.4, gain)
    startPartial(n.freq * 2, 'sine', n.level * 0.16, now + n.at, now + 1.2, gain, 4)
  }
  playSparkle(gain, now + 0.3, 0.03)
}

function playHold() {
  const chain = connectCueChain(0.2, 0.08, 1.15)
  if (!chain || !ctx) return
  const { gain, now } = chain
  startPartial(196, 'sine', 0.65, now, now + 1.2, gain)
  startPartial(293.66, 'triangle', 0.4, now + 0.04, now + 1.15, gain, -3)
  startPartial(392, 'sine', 0.25, now + 0.12, now + 1.05, gain, 5)
  playSparkle(gain, now + 0.18, 0.024)
}

function playSelect() {
  const chain = connectCueChain(0.15, 0.012, 0.38)
  if (!chain || !ctx) return
  const { gain, now } = chain
  startPartial(880, 'sine', 0.6, now, now + 0.4, gain)
  startPartial(1318.5, 'triangle', 0.24, now, now + 0.28, gain, 8)
  playSparkle(gain, now, 0.04)
}

function playCard() {
  const chain = connectCueChain(0.17, 0.05, 0.95)
  if (!chain || !ctx) return
  const { gain, now } = chain
  startPartial(523.25, 'sine', 0.5, now, now + 1, gain)
  startPartial(784, 'sine', 0.36, now + 0.06, now + 0.95, gain, 2)
  startPartial(1046.5, 'triangle', 0.14, now + 0.1, now + 0.75, gain)
  playSparkle(gain, now + 0.08, 0.035)
}

function playWrite() {
  const chain = connectCueChain(0.14, 0.04, 0.7)
  if (!chain || !ctx) return
  const { gain, now } = chain
  startPartial(349.23, 'sine', 0.55, now, now + 0.75, gain)
  startPartial(523.25, 'triangle', 0.28, now + 0.05, now + 0.65, gain, -4)
}

function playSpark() {
  const chain = connectCueChain(0.14, 0.01, 0.45)
  if (!chain || !ctx) return
  const { gain, now } = chain
  startPartial(987.77, 'sine', 0.45, now, now + 0.45, gain)
  startPartial(1480, 'sine', 0.2, now, now + 0.3, gain, 12)
  playSparkle(gain, now, 0.05)
}

const CUE_PLAY: Record<Cue, () => void> = {
  enter: playEnter,
  hold: playHold,
  select: playSelect,
  card: playCard,
  write: playWrite,
  spark: playSpark,
}

function bindVisibilityPause() {
  if (typeof document === 'undefined' || visibilityBound) return
  visibilityBound = true
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      try {
        ambientEl?.pause()
      } catch {
        // ignore
      }
      return
    }
    if (enabled && started) void startAmbient()
  })
}

export const voraAudio = {
  isEnabled() {
    return enabled
  },

  isPlaying() {
    return enabled && started && ambientEl != null && !ambientEl.paused
  },

  hydrate() {
    enabled = loadEnabled()
    bindVisibilityPause()
    return enabled
  },

  /** Preload the ambient bed so the first gesture can start instantly. */
  warm() {
    ensureContext()
    ensureAmbientGraph()
    try {
      ambientEl?.load()
    } catch {
      // ignore
    }
  },

  /**
   * Fade the night-sky bed in (no chime).
   * Call on gate mount / first gesture — browsers may still block until a tap.
   */
  async beginSky() {
    if (!enabled) return false
    const audio = await resume()
    if (!audio) return false
    started = true
    await startAmbient()
    return true
  },

  async enable() {
    enabled = true
    saveEnabled(true)
    const audio = await resume()
    if (!audio) return false
    started = true
    await startAmbient()
    playEnter()
    return true
  },

  async disable() {
    enabled = false
    saveEnabled(false)
    stopAmbient()
    return true
  },

  async toggle() {
    if (enabled) return this.disable()
    return this.enable()
  },

  /** Call from a user gesture when sound was previously enabled. */
  async unlock() {
    if (!enabled) return
    const audio = await resume()
    if (!audio) return
    started = true
    await startAmbient()
  },

  cue(kind: Cue) {
    if (!enabled || !started) return
    void resume().then(() => CUE_PLAY[kind]())
  },
}
