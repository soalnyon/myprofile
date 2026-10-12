import { useEffect, useState } from 'react'

const planets = [
  { title: 'Data & Insight', text: '熟悉 SQL / VBA, 熟练使用 SPSS / Tableau 等数据分析软件', sprite: 0 },
  { title: 'Code & Creation', text: '熟悉 JavaScript / Java / C 等编程语言，并辅佐 Vibe Coding', sprite: 1 },
  { title: 'Visual Storytelling', text: '熟悉 Adobe 系列软件: Photoshop / Premiere Pro / Illustrator', sprite: 2 },
  { title: 'Design & Systems', text: '熟悉 Axure / Figma / Visio / Canva / Echarts 等可视化工具', sprite: 5 },
  { title: 'Languages', text: 'IELTS 7.0 / CET-6 532 / TOPIK (5 级) 良好的听说读写能力', sprite: 7 },
]

const spritePosition = index => ({
  backgroundPosition: `${index % 4 * 100 / 3}% ${Math.floor(index / 4) * 100}%`,
})

const scatteredStars = Array.from({ length: 60 }, (_, index) => ({
  left: `${(index * 71.3 + 9) % 100}%`, top: `${(index * 43.7 + 13) % 100}%`,
  delay: `${(index * .31) % 4}s`, size: index % 7 === 0 ? '4px' : '2px',
}))

export default function ConstellationSky({ onClose }) {
  const [selected, setSelected] = useState(null)
  useEffect(() => {
    const onKeyDown = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return <div className="planet-sky" role="dialog" aria-modal="true" aria-label="手绘星球技能图">
    <div className="planet-stars" aria-hidden="true">{scatteredStars.map((star, index) =>
      <i key={index} style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: star.delay }} />)}</div>
    <button className="sky-close planet-close" type="button" onClick={onClose} aria-label="关闭星图">×</button>
    <header className="planet-heading"><span>OBSERVATORY / A MAP OF SKILLS</span><h2>Little worlds, big ideas</h2><p>选择一颗星球，阅读它藏着的技能。</p></header>
    <div className="planet-system">
      <div className="planet-orbit-line planet-orbit-line-one" aria-hidden="true" />
      <div className="planet-orbit-line planet-orbit-line-two" aria-hidden="true" />
      <span className="planet-center-mark" aria-hidden="true">✦</span>
      {planets.map((planet, index) => <button type="button" key={planet.title}
        className={`planet-orbiting ${selected === index ? 'is-selected' : ''}`}
        style={{ '--start-angle': `${index * 72}deg`, '--orbit-delay': `${index * -.16}s` }}
        aria-label={planet.title} onClick={() => setSelected(index)}>
        <span className="planet-sprite" style={spritePosition(planet.sprite)} />
      </button>)}
      {[3, 4, 6].map((sprite, index) => <span key={sprite} className={`planet-distant planet-distant-${index + 1}`}
        style={spritePosition(sprite)} aria-hidden="true" />)}
    </div>
    <div className="planet-skill-readout" aria-live="polite" key={selected ?? 'empty'}>
      {selected === null ? <p>✧ &nbsp; Touch a planet to reveal its story &nbsp; ✧</p> : <>
        <span>SKILL / 0{selected + 1}</span>
        <h3>{planets[selected].title}</h3>
        <p>{planets[selected].text}</p>
      </>}
    </div>
    <div className="planet-footer">COAST & STARS <span>✦</span> THE NIGHT IS FULL OF POSSIBILITIES</div>
  </div>
}
