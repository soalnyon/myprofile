import React, { useState, useEffect, useLayoutEffect, Suspense, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, Environment, Lightformer, Sparkles, useProgress } from '@react-three/drei';
import { EffectComposer, HueSaturation, Bloom } from '@react-three/postprocessing';
import { Model as ItemA } from './ItemA'; 
import ConstellationSky from './ConstellationSky';
import BarStories from './BarStories';
import BoatJourney from './BoatJourney';
import TechProfile from './TechProfile';
import ClickSpark from './ClickSpark';
import ResourcePortal from './ResourcePortal';
import './index.css';


// ==========================================
// 1. 定义不同场景的相机视角配置 (你需要根据实际模型微调这些坐标)
// ==========================================
const VIEW_CONFIG = {
  overview: { position: [2, 5, 8], target: [0, -2, 0] },
  thebar: { position: [3, -0.65, 3], target: [2, -1, 0] },
  boat: { position: [5.5, 1, 3], target: [3.9, -2.1, 1.15] },
  observatory: { position: [5, 2, 2.5], target: [3, 0, -1] },
  beach: { position: [1.1, -1, 3], target: [0, -1.5, 0] },
  greenery: { position: [-1, 3, 1.5], target: [0, 1, 0] }
};
const MODEL_POSITION = [2, -3, 0];
const MODEL_ROTATION = -Math.PI / 5.2;
const MOBILE_BAR_VIEW = { position: [3.3, 0, 3], target: [2.3, -1, 0] };
const rotateWithModel = ([x, y, z]) => {
  const dx = x - MODEL_POSITION[0];
  const dz = z - MODEL_POSITION[2];
  return [
    MODEL_POSITION[0] + dx * Math.cos(MODEL_ROTATION) + dz * Math.sin(MODEL_ROTATION),
    y,
    MODEL_POSITION[2] - dx * Math.sin(MODEL_ROTATION) + dz * Math.cos(MODEL_ROTATION),
  ];
};
const POSTCARD_LINES = [
  'The sea folds gold into the sand,',
  'A quiet light upon my hand.',
  'The palms lean close, the blue waves roam,',
  'And every little breeze says home.'
];

function FallingPoem() {
  let character = 0;
  return <p className="postcard-poem" aria-label={POSTCARD_LINES.join(' ')}>
    {POSTCARD_LINES.map((line, lineIndex) => <span className="postcard-poem-line" key={line} aria-hidden="true">
      {Array.from(line).map((letter, index) => <span className="falling-letter" key={`${lineIndex}-${index}`}
        style={{ '--fall-delay': `${Math.min(character++ * 28, 1700)}ms` }}>{letter === ' ' ? '\u00a0' : letter}</span>)}
    </span>)}
  </p>;
}



// ==========================================
// 2. 相机动画控制器组件
// ==========================================
function CameraAnimator({ currentView, modelCenter, isMobile }) {
  const controlsRef = useRef();

  useEffect(() => {
    if (controlsRef.current && VIEW_CONFIG[currentView]) {
      const { position: viewPosition, target: viewTarget } = isMobile && currentView === 'thebar'
        ? MOBILE_BAR_VIEW : VIEW_CONFIG[currentView];
      const overview = currentView === 'overview';
      const target = overview ? modelCenter : rotateWithModel(viewTarget);
      let position = overview ? viewPosition : rotateWithModel(viewPosition);
      if (isMobile) {
        const distanceScale = overview ? 1.9 : currentView === 'thebar' ? 1.65 : 1.35;
        position = position.map((coordinate, index) => target[index] + (coordinate - target[index]) * distanceScale);
      }
      // 开启平滑过渡 (true)
      controlsRef.current.setLookAt(
        position[0], position[1], position[2],
        target[0], target[1], target[2],
        true 
      );
    }
  }, [currentView, modelCenter, isMobile]);

  return (
    <CameraControls 
      ref={controlsRef} 
      makeDefault 
      minDistance={2} 
      maxDistance={20}
      // 如果需要在全景模式下保持原有的自动旋转，可以解开下方注释并在 useEffect 里动态控制它
      // azimuthRotateSpeed={currentView === 'overview' ? 0.1 : 0} 
    />
  );
}

function SceneLighting({ isDay }) {
  return (
    <>
      <Environment resolution={128} frames={1}>
        <Lightformer position={[0, 6, 0]} rotation={[-Math.PI / 2, 0, 0]}
          scale={[10, 10, 1]} color={isDay ? '#e5efff' : '#a9c9e1'} intensity={isDay ? 2 : 1.6} />
        <Lightformer position={[-4, 3, 2]} rotation={[0, Math.PI / 2, 0]}
          scale={[5, 3, 1]} color={isDay ? '#ffd9aa' : '#b9d8ee'} intensity={isDay ? 2.5 : 1.5} />
        <Lightformer position={[0, 2, -5]} scale={[8, 2, 1]}
          color={isDay ? '#c2dedf' : '#6c9cbd'} intensity={isDay ? 1 : 1.4} />
      </Environment>
      <ambientLight intensity={isDay ? 0.8 : 0.48} color={isDay ? '#fffaf0' : '#c6d7df'} />
      <directionalLight position={[5, 7, 4]} intensity={isDay ? 1.7 : 0.9}
        color={isDay ? '#fff8e7' : '#dce8ed'} />
      <directionalLight position={[-4, 4, -3]} intensity={isDay ? 0.6 : 0.5}
        color={isDay ? '#d6e8e5' : '#96b5c5'} />
      {isDay && <Sparkles count={42} scale={[7, 3.2, 6]} size={1.5} speed={0.12}
        opacity={0.46} color="#fff3cf" position={[0, 0.3, 0]} />}
      {!isDay && (
        <>
          {/* Pendant bulb in the GLB is at [0.7, 2.82, -0.45], with model scale 0.5. */}
          <pointLight position={[2.35, -0.52, -0.22]} intensity={2.2}
            color="#ffe0a0" distance={2.7} decay={2} />
          <pointLight position={[1.3, 0.1, 1.1]} intensity={1.4}
            color="#ffc67a" distance={3.2} decay={2} />
          <pointLight position={[3.6, -0.55, 0.55]} intensity={1.2}
            color="#ffd19a" distance={3} decay={2} />
          <Sparkles count={100} scale={8} size={3.1} speed={0.34}
            opacity={0.98} color="#ffe0a1" position={[0, 0.5, 0]} />
        </>
      )}
    </>
  );
}

// ==========================================
// 3. 主应用组件
// ==========================================
function App() {
  const [showPostcard, setShowPostcard] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [drinkPanel, setDrinkPanel] = useState(null);
  const [showJourney, setShowJourney] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 700px)').matches);
  const [spark, setSpark] = useState(null);
  const triggerSpark = event => {
    if (event.button !== undefined && event.button !== 0) return;
    setSpark({ x: event.clientX, y: event.clientY, id: performance.now() });
  };
  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const update = () => setIsMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
const [time, setTime] = useState(() => new Date());
const [musicPlaying, setMusicPlaying] = useState(false);
const bgmRef = useRef(null);
const effectRef = useRef(null);
const playInteractionSound = useCallback(() => {
  const sound = effectRef.current;
  if (!sound) return;
  sound.currentTime = 0;
  sound.volume = 0.28;
  sound.play().catch(() => {});
}, []);
const toggleMusic = async () => {
  if (!bgmRef.current) return;
  if (!bgmRef.current.paused) {
    bgmRef.current.pause();
  } else {
    bgmRef.current.volume = 0.36;
    try { await bgmRef.current.play(); }
    catch { setMusicPlaying(false); }
  }
};
const tiltPostcard = event => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  event.currentTarget.style.setProperty('--tilt-y', `${(x - .5) * 11}deg`);
  event.currentTarget.style.setProperty('--tilt-x', `${(.5 - y) * 11}deg`);
  event.currentTarget.style.setProperty('--shine-x', `${x * 100}%`);
  event.currentTarget.style.setProperty('--shine-y', `${y * 100}%`);
};
const resetPostcard = event => {
  event.currentTarget.style.setProperty('--tilt-y', '0deg');
  event.currentTarget.style.setProperty('--tilt-x', '0deg');
};
const [isDay, setIsDay] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [modelCenter, setModelCenter] = useState([2, -0.25, 0]);
  const [transition, setTransition] = useState({ type: 'load', progress: 0 });
  const loadProgress = useProgress(state => state.progress);
  const handleModelReady = useCallback((center) => {
    setModelCenter(center);
    setModelReady(true);
  }, []);

  useEffect(() => {
    if (!modelReady || transition?.type !== 'load') return;
    const reveal = window.setTimeout(() => setTransition(previous => previous?.type === 'load' ? { ...previous, complete: true } : previous), 320);
    const done = window.setTimeout(() => setTransition(null), 1320);
    return () => { window.clearTimeout(reveal); window.clearTimeout(done); };
  }, [modelReady, transition?.type]);

  useEffect(() => {
    if (transition?.type !== 'theme') return;
    let frame;
    let switched = false;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(100, Math.round((now - start) / 1300 * 100));
      if (progress >= 48 && !switched) {
        switched = true;
        setIsDay(value => !value);
      }
      setTransition(previous => ({ ...previous, progress }));
      if (progress < 100) frame = requestAnimationFrame(tick);
      else frame = window.setTimeout(() => setTransition(null), 300);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(frame);
    };
  }, [transition?.type]);

  // 新增：当前视角状态与导航栏展开状态
  const [currentView, setCurrentView] = useState('overview');
  const [navExpanded, setNavExpanded] = useState(true);
  const navTrackRef = useRef(null);
  const navThumbRef = useRef(null);
  const previousNavPosition = useRef(null);
  const [navThumb, setNavThumb] = useState({ left: 0, width: 0 });

  // 导航栏配置
  const navItems = [
    { label: 'Home', key: 'overview' },
    { label: 'Bar', key: 'thebar' },
    { label: 'Boat', key: 'boat' },
    { label: 'Stars', key: 'observatory' },
    { label: 'Beach', key: 'beach' },
    { label: 'Palm', key: 'greenery' }
  ];

  useLayoutEffect(() => {
    if (!navExpanded || !navTrackRef.current) return undefined;
    const updateThumb = () => {
      const selected = navTrackRef.current?.querySelector(`[data-nav-key="${currentView}"]`);
      if (!selected) return;
      const next = { left: selected.offsetLeft, width: selected.offsetWidth };
      const previous = previousNavPosition.current;
      setNavThumb(next);
      if (previous && previous.key !== currentView && navThumbRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const from = previous.metrics;
        const left = Math.min(from.left, next.left);
        const right = Math.max(from.left + from.width, next.left + next.width);
        const direction = Math.sign(next.left - from.left);
        navThumbRef.current.getAnimations().forEach(animation => animation.cancel());
        navThumbRef.current.animate([
          { left: `${from.left}px`, width: `${from.width}px`, offset: 0 },
          { left: `${left}px`, width: `${right - left}px`, offset: .48 },
          { left: `${next.left - direction * 4}px`, width: `${next.width + 4}px`, offset: .82 },
          { left: `${next.left}px`, width: `${next.width}px`, offset: 1 },
        ], { duration: 570, easing: 'cubic-bezier(.22,.8,.22,1)' });
      }
      previousNavPosition.current = { key: currentView, metrics: next };
    };
    updateThumb();
    const observer = new ResizeObserver(updateThumb);
    observer.observe(navTrackRef.current);
    return () => observer.disconnect();
  }, [currentView, navExpanded]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`app-container ${isDay ? 'theme-day' : 'theme-night'}`} onPointerDownCapture={triggerSpark}>
      <audio ref={bgmRef} src="/bgm.mp3" loop preload="metadata"
        onPlay={() => setMusicPlaying(true)} onPause={() => setMusicPlaying(false)} onEnded={() => setMusicPlaying(false)} />
      <audio ref={effectRef} src="/music1.mp3" preload="auto" />
      
      <div className="canvas-layer">
        <Canvas camera={{ position: [2, 5, 8], fov: 42 }}>
          <Suspense fallback={null}>
            {/* 
              注意：为了实现“点击场景物体切换视角”，
              你需要将 setCurrentView 作为 prop 传递给你的 ItemA 模型，
              并在 ItemA 内部对应的 <mesh> 上绑定 onClick 事件。
            */}
            {/* <ItemA scale={0.5} position={[2, -2, 0]} setCurrentView={setCurrentView} /> */}
            <ItemA 
              scale={0.5} position={MODEL_POSITION}
              rotation={[0, MODEL_ROTATION, 0]}
              currentView={currentView} 
              setCurrentView={setCurrentView}
              setShowPostcard={setShowPostcard} // 新增这行
              setShowStars={setShowStars}
              setShowJourney={setShowJourney}
              setShowResources={setShowResources}
              setDrinkPanel={setDrinkPanel}
              isDay={isDay}
              onReady={handleModelReady}
              onInteractionSound={playInteractionSound}
            />
            <SceneLighting isDay={isDay} />
          </Suspense>
          
          {/* 挂载独立的相机动画控制器 */}
          <CameraAnimator currentView={currentView} modelCenter={modelCenter} isMobile={isMobile} />

          <EffectComposer disableNormalPass>
            <HueSaturation saturation={isDay ? 0.12 : 0.21} hue={0} />
            <Bloom mipmapBlur intensity={isDay ? 0.45 : 0.72}
              luminanceThreshold={isDay ? 1.6 : 1.25} luminanceSmoothing={0.35} />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="ui-layer pointer-events-none">
        {/* 原有顶部 UI 保持不变 */}
        <div className="top-section pointer-events-auto">
          <div className="brand-block ui-element">
            <TechProfile />
            <div className="poem">
              <p>The sky bleeds honey, slowly spreading.</p>
              <p>The sun lingers, reluctant to sink,</p>
              <p>trying to squeeze the whole horizon</p>
              <p>into my chest.</p>
            </div>
          </div>
          <div className="info ui-element" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div className="header-controls">
              <button className="header-action" onClick={() => setTransition({ type: 'theme', target: isDay ? 'night' : 'day', progress: 0 })}
                disabled={Boolean(transition)}><span>{isDay ? '☾ NIGHT MODE' : '☀ DAY MODE'}</span></button>
              <button className={`header-action music-action ${musicPlaying ? 'is-playing' : ''}`} onClick={toggleMusic}
                aria-label={musicPlaying ? 'Pause background music' : 'Play background music'} aria-pressed={musicPlaying}>
                <span>{musicPlaying ? '♫ MUSIC ON' : '♪ MUSIC OFF'}</span>
              </button>
            </div>
            <p className="header-time">{time.toDateString()}</p>
            <p className="header-time">{time.toLocaleTimeString('en-US')}</p>
          </div>
        </div>
        
        {/* <h2 className="center-title ui-element">Profile</h2> */}
        
        <div className="site-copyright ui-element">© 2026 Kymber</div>

        {/* ========================================== */}
        {/* 新增：可收起的底部胶囊导航栏 */}
        {/* ========================================== */}
        <div className="site-navigation">
          {navExpanded && (
            <div className="nav-items" ref={navTrackRef} role="group" aria-label="场景导航">
              <span className="nav-rubber-thumb" ref={navThumbRef} style={{ left: navThumb.left, width: navThumb.width }} aria-hidden="true" />
              {navItems.map(item => (
                <button 
                  key={item.key}
                  data-nav-key={item.key}
                  className={currentView === item.key ? 'is-active' : ''}
                  aria-current={currentView === item.key ? 'page' : undefined}
                  onClick={() => setCurrentView(item.key)}
                >
                  {item.key === 'overview' && '◇ '}
                  {item.label}
                </button>
              ))}
            </div>
          )}
          
          <button 
            className="nav-toggle"
            type="button"
            aria-label={navExpanded ? '收起导航' : '展开导航'}
            aria-expanded={navExpanded}
            onClick={() => setNavExpanded(!navExpanded)}
          >
            {navExpanded ? '✕' : '◇'}
          </button>

        </div>
        
      </div>
      {showPostcard && (
        <div className="postcard-overlay" role="presentation" onClick={() => setShowPostcard(false)}>
          <article className="postcard-sheet" role="dialog" aria-modal="true" aria-label="A postcard from the coast"
            onClick={event => event.stopPropagation()} onPointerMove={tiltPostcard} onPointerLeave={resetPostcard}>
            <button type="button" className="postcard-close" aria-label="Close postcard"
              onClick={() => setShowPostcard(false)}>×</button>
            <div className="postcard-pattern" aria-hidden="true">〰  ✦  〰  ✦  〰</div>
            <div className="postcard-stamp" aria-hidden="true">COAST<br />& STARS</div>
            <div className="postcard-postmark" aria-hidden="true">COASTAL POST · 2026<span>━━━<br />━━━<br />━━━</span></div>
            <p className="postcard-kicker">A NOTE FROM THE SHORE</p>
            <h2>Where the tide remembers</h2>
            <FallingPoem />
            <div className="postcard-signature">From the coast, with love.</div>
          </article>
        </div>
      )}
      {showStars && <ConstellationSky onClose={() => setShowStars(false)} />}
      {drinkPanel && <BarStories panel={drinkPanel} onClose={() => setDrinkPanel(null)} />}
      {showJourney && <BoatJourney onClose={() => setShowJourney(false)} />}
      {showResources && <ResourcePortal onClose={() => setShowResources(false)} />}
      <ClickSpark spark={spark} onEnd={() => setSpark(null)} />
      {transition && (
        <div className={`scene-transition ${transition.type === 'theme' ? `scene-transition-theme scene-transition-${transition.target}` : 'scene-transition-day'} ${transition.complete ? 'scene-transition-complete' : ''} ${transition.type === 'theme' && transition.progress >= 83 ? 'scene-transition-finishing' : ''}`}
          role="status" aria-label={transition.type === 'load' ? 'Loading coastal scene' : 'Changing time of day'}>
          {transition.type === 'load' && <div className="transition-pixels" aria-hidden="true">
            {Array.from({ length: 96 }, (_, index) => <span key={index} className="transition-pixel"
              style={{ '--pixel-delay': `${((index * 37) % 13) * 11}ms` }} />)}
          </div>}
          <div className="transition-mark" aria-hidden="true">✦</div>
          <p className="transition-eyebrow">COAST & STARS</p>
          <h2>{transition.type === 'load' ? 'Ready to explore ?' : transition.target === 'night' ? 'When the sun sets' : 'When morning returns'}</h2>
          <div className="transition-rule" aria-hidden="true" />
          <p className="transition-caption">{transition.type === 'load' ? '欢迎参观' : 'Changing the light'}</p>
          <div className="transition-eyes" aria-hidden="true"><span className="transition-eye"><i /></span><span className="transition-eye"><i /></span></div>
          <div className="transition-progress" role="progressbar"
            aria-valuemin={0} aria-valuemax={100}
            aria-valuenow={transition.type === 'load' ? (modelReady ? 100 : Math.min(95, Math.round(loadProgress))) : transition.progress}>
            <div style={{ width: `${transition.type === 'load' ? (modelReady ? 100 : Math.min(95, Math.round(loadProgress))) : transition.progress}%` }} />
          </div>
          <span className="transition-percentage">{transition.type === 'load' ? (modelReady ? 100 : Math.min(95, Math.round(loadProgress))) : transition.progress}%</span>
          <div className="transition-wave" aria-hidden="true">〰</div>
        </div>
      )}
    </div>
  );
}

export default App;
