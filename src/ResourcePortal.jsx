import { useEffect } from 'react'
import { FaArrowUpRightFromSquare, FaBrain, FaBookOpen, FaEnvelope, FaFilePdf, FaFilePowerpoint, FaImage, FaLayerGroup, FaLightbulb, FaNoteSticky, FaPalette, FaPen, FaPhone, FaRobot, FaSwatchbook, FaWandMagicSparkles } from 'react-icons/fa6'
import { SiDeepseek, SiDeepl, SiFigma, SiFreepik, SiGithub, SiGoogle, SiGooglegemini, SiNotion, SiPhotopea, SiPinterest, SiPoe, SiPerplexity, SiConvertio, SiThreedotjs } from 'react-icons/si'

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
      { name: 'Usecases', url: 'https://agentusecases.ai/', icon: FaLightbulb },
      { name: '秘塔搜索', url: 'https://metaso.cn/?s=wetaba', icon: FaBrain },
    ],
  },
  {
    title: '灵感来源', subtitle: 'MAKE / IMAGINE', icon: FaPalette,
    items: [
      { name: '即梦', url: 'https://jimeng.jianying.com/ai-tool/image/generate', icon: FaImage },
      { name: 'Ideogram', url: 'https://ideogram.ai/', icon: FaWandMagicSparkles },
      { name: 'Liblib', url: 'https://www.liblib.art/sd', icon: FaPalette },
      { name: 'Lovart', url: 'https://www.lovart.ai/', icon: FaWandMagicSparkles },
      { name: 'Freepik', url: 'http://freepik.com', icon: SiFreepik },
      { name: 'Pinterest', url: 'https://www.pinterest.com/', icon: SiPinterest },
      { name: 'Designspiration', url: 'https://www.designspiration.com/', icon: FaLightbulb },
      { name: 'Three.js', url: 'https://threejs.org/', icon: SiThreedotjs },
      { name: 'Color Hunt', url: 'https://www.colorhunt.co/', icon: FaSwatchbook },
      { name: 'ColorSpace', url: 'https://mycolor.space/gradient3', icon: FaPalette },
    ],
  },
  {
    title: '思绪重构', subtitle: 'PLAN / WRITE / PRESENT', icon: FaBookOpen,
    items: [
      { name: 'Gamma', url: 'https://gamma.app/', icon: FaFilePowerpoint },
      { name: 'Slidesgo', url: 'https://slidesgo.com/', icon: FaLayerGroup },
      { name: 'Napkin', url: 'https://app.napkin.ai/page', icon: FaPen },
      { name: '有道云', url: 'https://note.youdao.com/web/#', icon: FaNoteSticky },
      { name: 'Notion', url: 'https://www.notion.com/', icon: SiNotion },
    ],
  },
  {
    title: '常用工具', subtitle: 'A LITTLE SHORTCUT', icon: FaWandMagicSparkles,
    items: [
      { name: 'Canva', url: 'http://www.canva.cn', icon: FaPalette },
      { name: 'Convertio', url: 'https://convertio.co/zh/', icon: SiConvertio },
      { name: 'GitHub', url: 'https://github.com/', icon: SiGithub },
      { name: 'Figma', url: 'https://www.figma.com/files/drafts', icon: SiFigma },
      { name: 'Recraft', url: 'https://www.recraft.ai/', icon: FaWandMagicSparkles },
      { name: 'Photopea', url: 'https://www.photopea.com/', icon: SiPhotopea },
      { name: 'DeepL', url: 'https://www.deepl.com/zh/translator', icon: SiDeepl },
      { name: 'Qwerty', url: 'https://qwerty.kaiyi.cool/', icon: FaBookOpen },
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
          {sectionIndex === sections.length - 1 && <div className="resource-empty"><span>✦</span> MORE TO COME</div>}
        </div>
      </section>)}
    </div>
    <footer className="resource-footer">
      <div className="resource-contact-title"><span>05 / SAY HELLO</span><h3>Contact me.</h3></div>
      <div className="resource-contact-links">
        <a href="mailto:wzh139628@gmail.com"><FaEnvelope aria-hidden="true" /> wzh139628@gmail.com</a>
        <a href="tel:18451037068"><FaPhone aria-hidden="true" /> 184 5103 7068</a>
      </div>
      <p>A SMALL COLLECTION FROM THE COAST <span>✦</span> GROWING WITH TIME</p>
    </footer>
    <a className="resource-cv-float" href="/cv22.pdf" download="王子涵_完整简历.pdf" aria-label="下载完整简历 PDF" title="下载完整简历">
      <FaFilePdf aria-hidden="true" /><span>查看简历</span>
    </a>
  </section>
}
