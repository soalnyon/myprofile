import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, Environment, Lightformer, Sparkles, useProgress } from '@react-three/drei';
import { EffectComposer, HueSaturation, Bloom } from '@react-three/postprocessing';
import { Model as ItemA } from './ItemA'; 
import ConstellationSky from './ConstellationSky';
import './index.css';


// ==========================================
// 1. 定义不同场景的相机视角配置 (你需要根据实际模型微调这些坐标)
// ==========================================
const VIEW_CONFIG = {
  overview: { position: [2, 5, 8], target: [0, -2, 0] },
  thebar: { position: [3, 0, 3], target: [2, -1, 0] },
  boat: { position: [5.5, 1, 3], target: [3.9, -2.1, 1.15] },
  observatory: { position: [2, 2, 3], target: [2, 0, -1] },
  beach: { position: [1.1, -1, 3], target: [0, -1.5, 0] },
  greenery: { position: [-1, 3, 1.5], target: [0, 1, 0] }
};
const MODEL_POSITION = [2, -3, 0];



// ==========================================
// 2. 相机动画控制器组件
// ==========================================
function CameraAnimator({ currentView, modelCenter }) {
  const controlsRef = useRef();

  useEffect(() => {
    if (controlsRef.current && VIEW_CONFIG[currentView]) {
      const { position, target: viewTarget } = VIEW_CONFIG[currentView];
      const target = currentView === 'overview' ? modelCenter : viewTarget;
      // 开启平滑过渡 (true)
      controlsRef.current.setLookAt(
        position[0], position[1], position[2],
        target[0], target[1], target[2],
        true 
      );
    }
  }, [currentView, modelCenter]);

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
      {!isDay && (
        <>
          {/* Pendant bulb in the GLB is at [0.7, 2.82, -0.45], with model scale 0.5. */}
          <pointLight position={[2.35, -0.52, -0.22]} intensity={2.2}
            color="#ffe0a0" distance={2.7} decay={2} />
          <pointLight position={[1.3, 0.1, 1.1]} intensity={1.4}
            color="#ffc67a" distance={3.2} decay={2} />
          <pointLight position={[3.6, -0.55, 0.55]} intensity={1.2}
            color="#ffd19a" distance={3} decay={2} />
          <Sparkles count={85} scale={8} size={2.7} speed={0.3}
            opacity={0.78} color="#ffd48d" position={[0, 0.5, 0]} />
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
const [time, setTime] = useState(new Date());
const [isMuted, setIsMuted] = useState(true);
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
    const done = window.setTimeout(() => setTransition(null), 480);
    return () => window.clearTimeout(done);
  }, [modelReady, transition?.type]);

  useEffect(() => {
    if (transition?.type !== 'theme') return;
    let frame;
    let switched = false;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(100, Math.round((now - start) / 950 * 100));
      if (progress >= 48 && !switched) {
        switched = true;
        setIsDay(value => !value);
      }
      setTransition(previous => ({ ...previous, progress }));
      if (progress < 100) frame = requestAnimationFrame(tick);
      else frame = window.setTimeout(() => setTransition(null), 260);
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

  // 导航栏配置
  const navItems = [
    { label: 'Overview', key: 'overview' },
    { label: 'The Bar', key: 'thebar' },
    { label: 'Boat', key: 'boat' },
    { label: 'Observatory', key: 'observatory' },
    { label: 'Beach', key: 'beach' },
    { label: 'Greenery', key: 'greenery' }
  ];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`app-container ${isDay ? 'theme-day' : 'theme-night'}`}>
      
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
              currentView={currentView} 
              setCurrentView={setCurrentView}
              setShowPostcard={setShowPostcard} // 新增这行
              setShowStars={setShowStars}
              isDay={isDay}
              onReady={handleModelReady}
            />
            <SceneLighting isDay={isDay} />
          </Suspense>
          
          {/* 挂载独立的相机动画控制器 */}
          <CameraAnimator currentView={currentView} modelCenter={modelCenter} />

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
          <div className="poem ui-element">
            <p>The sky bleeds honey, slowly spreading.</p>
            <p>The sun lingers, reluctant to sink,</p>
            <p>trying to squeeze the whole horizon</p>
            <p>into my chest.</p>
          </div>
          <div className="info ui-element" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <button className="toggle-btn" onClick={() => setTransition({ type: 'theme', target: isDay ? 'night' : 'day', progress: 0 })}
              disabled={Boolean(transition)}>
              {isDay ? '☾ NIGHT MODE' : '☀ DAY MODE'}
            </button>
            <p>{time.toDateString()}</p>
            <p>{time.toLocaleTimeString('en-US')}</p>
            <p style={{ marginTop: '10px' }}>© {time.getFullYear()} Your Name</p>
          </div>
        </div>
        
        {/* <h2 className="center-title ui-element">Profile</h2> */}
        
        <div className="bottom-section pointer-events-auto" style={{ paddingRight: '50px' }}>
          <button className="ui-element" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? 'UNMUTE' : 'MUTE'}
          </button>
        </div>

        {/* ========================================== */}
        {/* 新增：可收起的底部胶囊导航栏 */}
        {/* ========================================== */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'auto'
        }}>
          {navExpanded && (
            <div style={{
              display: 'flex',
              background: 'rgba(25, 25, 30, 0.65)',
              backdropFilter: 'blur(10px)',
              padding: '6px 8px',
              borderRadius: '40px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {navItems.map(item => (
                <button 
                  key={item.key}
                  onClick={() => setCurrentView(item.key)}
                  style={{
                    background: currentView === item.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                    color: currentView === item.key ? '#fff' : '#a0a0a0',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.key === 'overview' && '◇ '}
                  {item.label}
                </button>
              ))}
            </div>
          )}
          
          <button 
            onClick={() => setNavExpanded(!navExpanded)}
            style={{
              background: 'rgba(25, 25, 30, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.3s'
            }}
          >
            {navExpanded ? '✕' : '◇'}
          </button>

        </div>
        
      </div>
      {showPostcard && (
        <div className="postcard-overlay" role="presentation" onClick={() => setShowPostcard(false)}>
          <article className="postcard-sheet" role="dialog" aria-modal="true" aria-label="A postcard from the coast"
            onClick={event => event.stopPropagation()}>
            <button type="button" className="postcard-close" aria-label="Close postcard"
              onClick={() => setShowPostcard(false)}>×</button>
            <div className="postcard-stamp" aria-hidden="true">COAST<br />& STARS</div>
            <p className="postcard-kicker">A NOTE FROM THE SHORE</p>
            <h2>Where the tide remembers</h2>
            <p className="postcard-poem">
              The sea folds gold into the sand,<br />
              A quiet light upon my hand.<br />
              The palms lean close, the blue waves roam,<br />
              And every little breeze says home.
            </p>
            <div className="postcard-signature">From the coast, with love.</div>
          </article>
        </div>
      )}
      {showStars && <ConstellationSky onClose={() => setShowStars(false)} />}
      {transition && (
        <div className={`scene-transition ${transition.type === 'theme' ? `scene-transition-${transition.target}` : 'scene-transition-day'}`}
          role="status" aria-label={transition.type === 'load' ? 'Loading coastal scene' : 'Changing time of day'}>
          <div className="transition-mark" aria-hidden="true">✦</div>
          <p className="transition-eyebrow">COAST & STARS</p>
          <h2>{transition.type === 'load' ? 'A shore to explore' : transition.target === 'night' ? 'When the sun sets' : 'When morning returns'}</h2>
          <div className="transition-rule" aria-hidden="true" />
          <p className="transition-caption">{transition.type === 'load' ? 'Finding the shoreline' : 'Changing the light'}</p>
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
