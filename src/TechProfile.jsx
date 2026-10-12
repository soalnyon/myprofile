import { useEffect, useRef } from 'react'

export default function TechProfile() {
  const root = useRef(null)
  const hovering = useRef(false)

  useEffect(() => {
    let frame
    const animate = time => {
      if (!hovering.current && root.current) {
        const sweep = (Math.sin(time * .00125) + 1) * 50
        root.current.style.setProperty('--tech-x', `${sweep}%`)
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  return <h1 ref={root} className="tech-profile" aria-label="Profile"
    onPointerMove={event => {
      hovering.current = true
      const rect = event.currentTarget.getBoundingClientRect()
      event.currentTarget.style.setProperty('--tech-x', `${(event.clientX - rect.left) / rect.width * 100}%`)
    }}
    onPointerLeave={() => { hovering.current = false }}>
    <svg viewBox="0 0 255 70" aria-hidden="true">
      <text className="tech-profile-fill" x="2" y="53">Profile</text>
      <text className="tech-profile-wire" x="2" y="53">Profile</text>
    </svg>
  </h1>
}
