/** Sky themes — quiet craft: one default, then clear moods.
 *  Invariant: themed sky surfaces must carry data-sky-theme / data-theme —
 *  Light card, theme studio, and Privacy / Who made this? / Status sheets.
 */
export type LightCardThemeId = 'default' | 'pure' | 'black' | 'pink' | 'aurora'

export type SkyThemeId = LightCardThemeId

export const DEFAULT_LIGHT_CARD_THEME: LightCardThemeId = 'default'
export const DEFAULT_SKY_THEME: SkyThemeId = 'default'

export const LIGHT_CARD_THEMES: readonly {
  id: LightCardThemeId
  label: string
}[] = [
  { id: 'default', label: 'Default' },
  { id: 'pure', label: 'Pure' },
  { id: 'black', label: 'Black' },
  { id: 'pink', label: 'Pink' },
  { id: 'aurora', label: 'Aurora' },
] as const

export const SKY_THEMES = LIGHT_CARD_THEMES

/** Old ids → current (localStorage / bookmarks). */
const LEGACY_SKY_THEME: Record<string, SkyThemeId> = {
  pale: 'pure',
  blush: 'pink',
  ink: 'black',
}

export function normalizeSkyThemeId(value: unknown): SkyThemeId | null {
  if (typeof value !== 'string') return null
  if (LEGACY_SKY_THEME[value]) return LEGACY_SKY_THEME[value]
  if (LIGHT_CARD_THEMES.some((theme) => theme.id === value)) {
    return value as SkyThemeId
  }
  return null
}

export function isSkyThemeId(value: unknown): value is SkyThemeId {
  return normalizeSkyThemeId(value) !== null
}

/** Day-bright skies flip chrome to dark ink. All current themes are night. */
export function skyThemeUsesLightChrome(theme: SkyThemeId): boolean {
  void theme
  return false
}

export type CardOrigin = {
  x: number
  y: number
}
