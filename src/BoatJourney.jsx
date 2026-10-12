import { useEffect, useRef, useState } from 'react'

export default function BoatJourney({ onClose }) {
  const [front, setFront] = useState(0)
  const [swapping, setSwapping] = useState(false)
  const dragStart = useRef(null)
  const swapTimer = useRef(null)

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') setFront(value => 1 - value)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('keydown', onKeyDown); window.clearTimeout(swapTimer.current) }
  }, [onClose])

  const swap = () => {
    if (swapping) return
    setSwapping(true)
    swapTimer.current = window.setTimeout(() => { setFront(value => 1 - value); setSwapping(false) }, 420)
  }

  return <section className="voyage-scene" role="dialog" aria-modal="true" aria-label="工作与实践经历">
    <div className="voyage-waves" aria-hidden="true"><i /><i /><i /></div>
    <button type="button" className="voyage-close" aria-label="关闭经历" onClick={onClose}>×</button>
    <header className="voyage-heading"><span>BOAT / A VOYAGE OF EXPERIENCE</span><h2>Along the way</h2>
      <p>每段经历，都是驶向下一片海的航标。</p></header>
    <div className={`voyage-stack ${swapping ? 'is-swapping' : ''}`}
      onPointerDown={event => { dragStart.current = event.clientX }}
      onPointerUp={event => { if (dragStart.current !== null && Math.abs(event.clientX - dragStart.current) > 55) swap(); dragStart.current = null }}>
      <article className={`voyage-card voyage-work ${front === 0 ? 'is-front' : 'is-back'}`}>
        <div className="voyage-card-top"><span>01 / WORK EXPERIENCE</span><span>2024.06 — 2025.09</span></div>
        <h3>香港中文大学（深圳）<small>深圳市人工智能与机器人研究院</small></h3>
        <p className="voyage-role">招生推广助理 · 人工智能与机器人学院部门</p>
        <div className="voyage-copy">
          <p><b>活动策划</b>策划并执行线上线下活动 30+（开放日、展会、主题讲座等），覆盖人群 1000+，提升品牌互动与曝光度。</p>
          <p><b>内容营销</b>撰写系列品牌推广文案（公众号推文、广告文案、项目推广与行业研究 PPT 等），优化标准化品牌沟通材料，提升用户粘性与内容转化。负责项目官网的维护与迭代。</p>
          <p><b>物料设计</b>独立设计品牌宣传物料 50+（海报、长图、易拉宝、横幅等），确保视觉统一。跟进供应商宣传册与宣传视频制作，应用 AIGC 工具赋能创意设计，提效降本。</p>
          <p><b>数据驱动</b>基于数据分析优化广告投放（社交媒体、巨量平台）与推广策略，持续提升投放 ROI。</p>
        </div>
        <div className="voyage-card-bottom">COAST & STARS <span>✦</span> Kymber</div>
      </article>
      <article className={`voyage-card voyage-practice ${front === 1 ? 'is-front' : 'is-back'}`}>
        <div className="voyage-card-top"><span>02 / PRACTICE EXPERIENCE</span><span>2018 — 2022</span></div>
        <h3>Practice notes<small>实践经历</small></h3>
        <div className="voyage-practice-copy">
          <section><time>2021.03 — 2021.04</time><h4>基于 Axure 的 IT 项目管理及设计</h4><em>课程设计小组负责人</em><p>设计并优化 APP 功能模块与界面布局，兼顾人机交互、易用性和可实现性。完成部分原型界面开发，与开发团队实时协调并推动交付。编写系统测试计划、监督测试和优化设计，核对测试报告。负责项目沟通、进度与质量管理。</p></section>
          <section><h4>北京林业大学 · 新媒体与宣传工作</h4><p>协助运营公众号，撰写原创文章，完成图文设计和排版。制作活动宣传视频、拍摄宣传图，设计海报与 Logo；参与主题派对、文化节、展览等学院活动的策划与组织。协调学院部门和社团的宣传合作，负责活动物品采购与日常报销。</p></section>
        </div>
        <div className="voyage-card-bottom">STEADY BY PRACTICE <span>✦</span> Kymber</div>
      </article>
    </div>
    <button type="button" className="voyage-swap" onClick={swap} aria-label={front === 0 ? '查看实践经历' : '查看工作经历'}>
      <span>↗</span> {front === 0 ? 'TURN TO PRACTICE' : 'BACK TO WORK'}
    </button>
    <p className="voyage-instruction">CLICK TO SWAP · ← →</p>
  </section>
}
