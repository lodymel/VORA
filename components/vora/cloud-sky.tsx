'use client'

/** Lavender Mist (Mirror) or Dream Lilac profile wash. */
export function CloudSky({ profile = false }: { profile?: boolean; aurora?: boolean; dusk?: boolean }) {
  return (
    <div
      className={`vora-cloud-sky ${profile ? 'vora-cloud-sky--profile' : ''}`}
      aria-hidden="true"
    >
      <div className="vora-cloud vora-cloud--a" />
      <div className="vora-cloud vora-cloud--b" />
      <div className="vora-cloud vora-cloud--c" />
      <div className="vora-cloud vora-cloud--d" />
    </div>
  )
}
