import { useEffect } from 'react'

const stars = Array.from({ length: 95 }, (_, index) => ({
  left: `${(index * 67.3 + 11) % 100}%`,
  top: `${(index * 41.7 + 8) % 100}%`,
  delay: `${(index * 0.37) % 4}s`,
  size: `${index % 9 === 0 ? 3 : index % 4 === 0 ? 2 : 1}px`,
}))

const constellations = [
  { name: 'ORION', points: '195,360 245,280 305,335 267,382 230,385 195,360 150,460 267,382 340,465 305,335' },
  { name: 'CYGNUS', points: '520,160 540,230 555,320 570,395 540,230 465,255 615,215' },
  { name: 'CASSIOPEIA', points: '705,145 750,172 793,132 830,186 885,146' },
  { name: 'URSA MAJOR', points: '700,385 755,372 800,399 790,450 738,456 700,385 650,358 608,345 565,332' },
]

export default function ConstellationSky({ onClose }) {
  useEffect(() => {
    const onKeyDown = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="constellation-sky" role="dialog" aria-modal="true" aria-label="Constellation sky">
      <div className="sky-stars" aria-hidden="true">
        {stars.map((star, index) => (
          <span key={index} style={{ left: star.left, top: star.top,
            animationDelay: star.delay, width: star.size, height: star.size }} />
        ))}
      </div>
      <button type="button" className="sky-close" onClick={onClose} aria-label="Close star map">×</button>
      <header className="sky-heading">
        <span>THE NIGHT ABOVE THE COAST</span>
        <h2>A map of quiet stars</h2>
        <p>Look up. Let the shoreline drift away.</p>
      </header>
      <svg className="constellation-map" viewBox="0 0 1000 650" role="img" aria-label="Orion, Cygnus, Cassiopeia and Ursa Major constellations">
        {constellations.map(({ name, points }) => {
          const coordinates = points.split(' ').map(pair => pair.split(',').map(Number))
          const [labelX, labelY] = coordinates[0]
          return (
            <g key={name} className="constellation">
              <polyline points={points} />
              {coordinates.map(([x, y], index) => <circle key={index} cx={x} cy={y} r={index === 0 ? 5 : 3.3} />)}
              <text x={labelX + 12} y={labelY - 12}>{name}</text>
            </g>
          )
        })}
      </svg>
      <p className="sky-footer">✦ &nbsp; COAST & STARS &nbsp; ✦</p>
    </div>
  )
}
