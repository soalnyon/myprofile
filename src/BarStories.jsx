import { useEffect, useRef, useState } from 'react'

const education = [
  { period: '2022.09 — 2023.10', school: '香港城市大学', English: 'City University of Hong Kong', degree: '硕士', major: '应用社会科学', courses: '项目设计与评估 · 应用社会学 · 应用社会数据分析 · 社会科学研究方法' },
  { period: '2018.09 — 2022.06', school: '北京林业大学', English: 'Beijing Forestry University', degree: '学士', major: '信息管理与信息系统', courses: 'IT 项目管理 · 运筹学 · 数据结构 · 操作系统 · Web 应用开发 · 网页设计 · Java 程序设计 · 数据库原理与运用' },
]

const highlights = [
  {
    number: '01', title: '公众号运营', English: 'EDITORIAL', color: '#F7AE88',
    summary: '把活动与品牌故事写成值得阅读的内容。',
    details: ['撰写活动推广、活动总结与节日类推文。', '独立策划内容逻辑和活动文案，提升用户黏性。'],
  },
  {
    number: '02', title: '线下活动支持', English: 'IN PERSON', color: '#F5C39D',
    summary: '让每一次见面都有清晰、统一的表达。',
    details: ['支持校园开放日、主题讲座、咨询答疑会和展会的全流程执行。', '制作项目宣讲 PPT 与活动物料，参与线下活动 20 余场。'],
  },
  {
    number: '03', title: '线上项目推广', English: 'DIGITAL', color: '#8BD6D1',
    summary: '从用户洞察出发，持续优化推广。',
    details: ['分析招生数据，形成学生画像。', '推广短信覆盖 6 万余用户，跟进广告投放并优化物料与投放机制。'],
  },
  {
    number: '04', title: '内容策划', English: 'STORYTELLING', color: '#F6D07F',
    summary: '用内容连接活动、渠道与人。',
    details: ['策划年度内容主题、活动文案和广告文案。', '制作招生邮件模板等标准化材料，搭建内容模板与执行流程。'],
  },
]

const aboutNotes = [
  { label: 'PERSPECTIVE', title: '跨学科视角', copy: '管理学与信息技术的跨学科背景，熟悉组织运营流程，善于整合资源并高效执行项目。' },
  { label: 'CREATIVITY', title: '内容与创新', copy: '熟悉新媒体运营全流程，善用创新工具提升宣传创意与效率。' },
  { label: 'COLLABORATION', title: '协作与成长', copy: '重视沟通、细节与执行，以数据优化推广策略，助力品牌增长与业务拓展。' },
]

const posters = [
  ...Array.from({ length: 4 }, (_, index) => ({ src: `/poster-previews/海报${index + 1}.webp`, full: `/poster-full/海报${index + 1}.webp`, shape: 'portrait' })),
  ...Array.from({ length: 5 }, (_, index) => ({ src: `/poster-previews/入口图${index + 1}.webp`, full: `/poster-full/入口图${index + 1}.webp`, shape: 'landscape' })),
]

function ProfileLanyard() {
  const [flipped, setFlipped] = useState(false)
  const [pose, setPose] = useState({ x: 0, y: 0, dx: 0, dy: 0 })
  const pointer = useRef(null)
  const dragged = useRef(false)

  return <div className="profile-lanyard-stage">
    <div className="profile-lanyard" style={{ '--lanyard-x': `${pose.x}deg`, '--lanyard-y': `${pose.y}deg`, '--lanyard-dx': `${pose.dx}px`, '--lanyard-dy': `${pose.dy}px` }}>
      <div className="profile-lanyard-cord" aria-hidden="true"><i /><i /></div>
      <button type="button" className={`profile-lanyard-badge ${flipped ? 'is-flipped' : ''}`}
        aria-label={flipped ? '翻回个人资料正面' : '翻看个人资料背面'}
        onPointerDown={event => {
          pointer.current = { x: event.clientX, y: event.clientY }
          dragged.current = false
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={event => {
          if (!pointer.current) return
          const dx = event.clientX - pointer.current.x
          const dy = event.clientY - pointer.current.y
          if (Math.abs(dx) + Math.abs(dy) > 8) dragged.current = true
          setPose({ x: Math.max(-17, Math.min(17, dx * .13)), y: Math.max(-12, Math.min(12, -dy * .12)),
            dx: Math.max(-42, Math.min(42, dx * .36)), dy: Math.max(-22, Math.min(44, dy * .36)) })
        }}
        onPointerUp={() => { pointer.current = null; setPose({ x: 0, y: 0, dx: 0, dy: 0 }) }}
        onPointerCancel={() => { pointer.current = null; setPose({ x: 0, y: 0, dx: 0, dy: 0 }) }}
        onClick={() => {
          if (dragged.current) { dragged.current = false; return }
          setFlipped(value => !value)
        }}>
        <span className="profile-lanyard-face profile-lanyard-front">
          <span className="profile-lanyard-top">COAST & STARS <span>01 / PROFILE</span></span>
          <span className="profile-lanyard-identity"><span className="profile-lanyard-monogram">W·ZH</span><span><small>A LITTLE INTRODUCTION</small><strong>王子涵</strong><em>26 岁 · 内容运营 / 活动执行 / 增长推广</em></span></span>
          <span className="profile-lanyard-bottom">K Y M B E R <span>✦</span> TURN TO DISCOVER</span>
        </span>
        <span className="profile-lanyard-face profile-lanyard-back">
          <span className="profile-lanyard-top">FIELD NOTES <span>WZH / 2026</span></span>
          <strong>Curiosity meets craft.</strong>
          <span>以内容连接人和项目，以设计与数据让想法落地。</span>
          <small>COAST & STARS · TURN TO RETURN</small>
        </span>
      </button>
    </div>
    <p>拖动吊牌，轻点翻面</p>
  </div>
}

function CircularPosterCarousel() {
  const [zoomed, setZoomed] = useState(null)
  const ring = useRef(null)
  const angle = useRef(0)
  const pointerStart = useRef(null)
  const dragged = useRef(false)
  const step = 360 / posters.length

  useEffect(() => {
    let frame
    let previous = 0
    const animate = now => {
      if (previous && pointerStart.current === null && zoomed === null) angle.current -= Math.min((now - previous) * .0035, .12)
      previous = now
      if (ring.current) ring.current.style.transform = `rotateY(${angle.current}deg)`
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [zoomed])

  return <div className="poster-gallery">
    <div className="poster-carousel-stage" onPointerDown={event => {
      pointerStart.current = { x: event.clientX, angle: angle.current }
      dragged.current = false
      event.currentTarget.setPointerCapture(event.pointerId)
    }} onPointerMove={event => {
      if (pointerStart.current === null) return
      const distance = event.clientX - pointerStart.current.x
      if (Math.abs(distance) > 6) dragged.current = true
      angle.current = pointerStart.current.angle + distance * .25
    }} onPointerUp={() => { pointerStart.current = null }}
      onPointerCancel={() => { pointerStart.current = null }}>
      <div className="poster-carousel-ring" ref={ring}>
        {posters.map((poster, index) => <button key={poster.src} type="button"
          className={`poster-carousel-card ${poster.shape}`}
          style={{ transform: `rotateY(${index * step}deg) translateZ(var(--poster-ring-radius))` }}
          aria-label={`查看视觉作品 ${index + 1}`} onClick={() => {
            if (dragged.current) { dragged.current = false; return }
            setZoomed(index)
          }}>
          <img src={poster.src} alt={`视觉作品 ${index + 1}`} draggable="false" loading="eager" />
        </button>)}
      </div>
    </div>
    {zoomed !== null && <div className="poster-zoom" role="presentation" onClick={() => setZoomed(null)}>
      <button type="button" aria-label="关闭图片" onClick={() => setZoomed(null)}>×</button>
      <img src={posters[zoomed].full} alt={`视觉作品 ${zoomed + 1}`} />
    </div>}
  </div>
}

export default function BarStories({ panel, onClose }) {
  const [active, setActive] = useState(0)
  const [folderOpen, setFolderOpen] = useState(false)
  const [activeNote, setActiveNote] = useState(0)

  useEffect(() => {
    const closeOnEscape = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="bar-story-overlay" role="presentation" onMouseDown={onClose}>
      <section className={`bar-story-sheet ${panel === 'highlights' || panel === 'posters' ? 'bar-story-wide' : ''} bar-story-${panel}`}
        role="dialog" aria-modal="true" aria-label={{ profile: '个人信息', highlights: 'Highlights', posters: 'Posters', about: '自我评价' }[panel]}
        onMouseDown={event => event.stopPropagation()}>
        <button type="button" className="bar-story-close" aria-label="关闭" onClick={onClose}>×</button>
        <div className="bar-story-topline"><span>THE BAR · COAST & STARS</span><span>WZH / PORTFOLIO</span></div>
        {panel === 'profile' ? (
          <div className="bar-profile">
            <ProfileLanyard />
            <div className="bar-profile-contact">
              <a href="tel:18451037068"><span>PHONE</span>184 5103 7068</a>
              <a href="mailto:wzh139628@gmail.com"><span>EMAIL</span>wzh139628@gmail.com</a>
            </div>
            <div className="bar-profile-education">
              <p className="bar-story-eyebrow">EDUCATION / 教育经历</p>
              {education.map(item => <div className="bar-education-row" key={item.period}>
                <time>{item.period}</time><div><div className="bar-education-main"><h3>{item.school}</h3><span>{item.English}</span><b>{item.degree}</b></div><p>{item.major}</p><small>主修课程　{item.courses}</small></div>
              </div>)}
            </div>
            <div className="bar-story-footer">01 / 04 <span>PERSONAL PROFILE</span></div>
          </div>
        ) : panel === 'highlights' ? (
          <div className="bar-highlights">
            <p className="bar-story-eyebrow">A FEW THINGS I DO</p>
            <h2>Highlights<span> — 跨平台、多渠道的内容策划与落地</span></h2>
            <div className="bar-bounce-stage" aria-label="四项工作亮点">
              {highlights.map((item, index) => (
                <button type="button" key={item.number}
                  className={`bar-bounce-card ${active === index ? 'is-active' : ''}`}
                  style={{ '--fan-x': `${(index - 1.5) * 205}px`, '--fan-angle': `${(index - 1.5) * 8}deg`, '--card-index': index }}
                  aria-pressed={active === index}
                  onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)}
                  onClick={() => setActive(index)}>
                  <span className="bar-bounce-no">{item.number} / 04 <em>{item.color}</em></span>
                  <span className="bar-bounce-art" aria-hidden="true"><i /><i /><i /></span>
                  <span className="bar-bounce-copy"><small>{item.English}</small><strong>{item.title}</strong></span>
                </button>
              ))}
            </div>
            <div className="bar-bounce-detail" aria-live="polite">
              <span>{highlights[active].number} / {highlights[active].English}</span>
              <p>{highlights[active].summary}</p>
              <ul>{highlights[active].details.map(line => <li key={line}>{line}</li>)}</ul>
            </div>
            <p className="bar-highlights-hint">移入或点击卡片，查看内容</p>
            <div className="bar-story-footer">02 / 04 <span>SELECTED HIGHLIGHTS</span></div>
          </div>
        ) : panel === 'posters' ? (
          <div className="bar-posters">
            <p className="bar-story-eyebrow">AIGC / VISUAL MATERIALS</p>
            <h2>Posters</h2>
            <p className="bar-posters-lead">以 AIGC 为灵感和工具，让活动视觉呈现更多可能。</p>
            <CircularPosterCarousel />
            <div className="bar-posters-notes">
              <p>应用 Midjourney · Ideogram · Stable Diffusion · 即梦 等 AIGC 工具</p>
              <p>设计海报、入口图、易拉宝、长图落地页、横幅等活动宣传物料</p>
              <p>为项目推广提供视觉支持</p>
            </div>
            <div className="bar-story-footer">03 / 04 <span>AIGC MATERIAL DESIGN</span></div>
          </div>
        ) : (
          <div className="bar-about">
            <div className="bar-about-sun" aria-hidden="true" /><div className="bar-about-wave" aria-hidden="true"><i /><i /><i /></div>
            <p className="bar-story-eyebrow">ABOUT ME / 自我评价</p>
            <h2>Thoughtful ideas.<br /><em>Thoughtful execution.</em></h2>
            <div className="bar-about-content">
              <div className={`bar-folder ${folderOpen ? 'is-open' : ''}`} onMouseEnter={() => setFolderOpen(true)} onMouseLeave={() => setFolderOpen(false)}>
                <div className="bar-folder-pages">
                  {aboutNotes.map((note, index) => <button type="button" key={note.label}
                    className={`bar-folder-page ${activeNote === index ? 'is-selected' : ''}`}
                    onClick={() => { setFolderOpen(true); setActiveNote(index) }}
                    aria-label={`查看${note.title}`} aria-hidden={!folderOpen} tabIndex={folderOpen ? 0 : -1}
                    style={{ '--page-index': index }}>
                    <span>0{index + 1}</span><strong>{note.title}</strong><small>{note.label}</small>
                  </button>)}
                </div>
                <button type="button" className="bar-folder-cover" aria-expanded={folderOpen}
                  aria-label={folderOpen ? '合上自我评价文件夹' : '打开自我评价文件夹'}
                  onClick={event => setFolderOpen(value => event.nativeEvent.pointerType === 'mouse' ? true : !value)}>
                  <span className="bar-folder-tab">PROFILE / 04</span>
                  <span className="bar-folder-mark" aria-hidden="true">W·ZH</span>
                  <span className="bar-folder-caption">FIELD NOTES <i>✦</i> COAST & STARS</span>
                </button>
              </div>
              <div className="bar-folder-detail" aria-live="polite">
                <span>0{activeNote + 1} / 03 · {aboutNotes[activeNote].label}</span>
                <h3>{aboutNotes[activeNote].title}</h3>
                <p>{aboutNotes[activeNote].copy}</p>
                <small>打开文件夹，选一张纸页阅读</small>
              </div>
            </div>
            <div className="bar-story-footer">04 / 04 <span>FROM THE SHORE, WITH PURPOSE</span></div>
          </div>
        )}
      </section>
    </div>
  )
}
