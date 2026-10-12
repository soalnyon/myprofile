import { useEffect } from 'react'
import { FaArrowUpRightFromSquare, FaBrain, FaImage, FaPalette, FaRobot, FaWandMagicSparkles } from 'react-icons/fa6'
import { SiDeepseek, SiFreepik, SiGoogle, SiGooglegemini, SiPoe, SiPerplexity, SiConvertio } from 'react-icons/si'

const sections = [
  {
    title: 'AI 工具', subtitle: 'THINK / SEARCH / CREATE', icon: FaBrain,
    items: [
      { name: 'ChatGPT', url: 'https://chatgpt.com/', icon: FaRobot },
      { name: 'Gemini', url: 'https://gemini.google.com/', icon: SiGooglegemini },
      { name: 'AI Studio', url: 'https://aistudio.google.com/', icon: SiGoogle },
      { name: 'DeepSeek', url: 'https://www.deepseek.com/', icon: SiDeepseek },
      { name: '扣子空间', url: 'https://space.coze.cn/', icon: FaWandMagicSparkles },
      { name: 'Poe', url: 'https://poe.com/', icon: SiPoe },
      { name: 'Perplexity', url: 'https://www.perplexity.ai/', icon: SiPerplexity },
      { name: '秘塔搜索', url: 'https://metaso.cn/?s=wetaba', icon: FaBrain },
    ],
  },
  {
    title: '设计灵感', subtitle: 'MAKE / IMAGINE', icon: FaPalette,
    items: [
      { name: '即梦', url: 'https://jimeng.jianying.com/ai-tool/image/generate', icon: FaImage },
      { name: 'Ideogram', url: 'https://ideogram.ai/', icon: FaWandMagicSparkles },
      { name: 'Liblib', url: 'https://www.liblib.art/sd', icon: FaPalette },
      { name: 'Lovart', url: 'https://www.lovart.ai/', icon: FaWandMagicSparkles },
      { name: 'Freepik', url: 'http://freepik.com', icon: SiFreepik },
    ],
  },
  {
    title: '常用工具', subtitle: 'A LITTLE SHORTCUT', icon: FaWandMagicSparkles,
    items: [
      { name: 'Canva', url: 'http://www.canva.cn', icon: FaPalette },
      { name: 'Convertio', url: 'https://convertio.co/zh/', icon: SiConvertio },
    ],
  },
]

export default function ResourcePortal({ onClose }) {
  useEffect(() => {
    const closeOnEscape = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return <section className="resource-portal" role="dialog" aria-modal="true" aria-label="常用工具与资源导航">
    <div className="resource-sun" aria-hidden="true" />
    <button type="button" className="resource-close" aria-label="关闭资源导航" onClick={onClose}>×</button>
    <header className="resource-heading">
      <span>FIELD NOTES / 01 — THE PALM</span>
      <h2>A little island<br /><em>of ideas.</em></h2>
      <p>常用的工具和灵感，收在这片椰影之下。</p>
    </header>
    <div className="resource-sections">
      {sections.map((section, sectionIndex) => <section className="resource-section" key={section.title}
        style={{ '--section-delay': `${sectionIndex * 100}ms` }}>
        <div className="resource-section-head"><span className="resource-section-number">0{sectionIndex + 1}</span><div>
          <span>{section.subtitle}</span><h3>{section.title}</h3>
        </div></div>
        <div className="resource-grid">
          {section.items.map((item, index) => <a className="resource-link" key={item.name} href={item.url}
            target="_blank" rel="noopener noreferrer" style={{ '--item-delay': `${index * 40}ms` }}
            onPointerMove={event => {
              const bounds = event.currentTarget.getBoundingClientRect()
              event.currentTarget.style.setProperty('--glare-x', `${event.clientX - bounds.left}px`)
              event.currentTarget.style.setProperty('--glare-y', `${event.clientY - bounds.top}px`)
            }}>
            <item.icon className="resource-link-icon" aria-hidden="true" />
            <span>{item.name}</span><FaArrowUpRightFromSquare className="resource-arrow" aria-hidden="true" />
          </a>)}
          {sectionIndex === 2 && <div className="resource-empty"><span>✦</span> MORE TO COME</div>}
        </div>
      </section>)}
    </div>
    <footer className="resource-footer">A SMALL COLLECTION FROM THE COAST <span>✦</span> GROWING WITH TIME</footer>
  </section>
}
