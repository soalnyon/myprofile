import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
// 移除了 OrbitControls，引入了 CameraControls
import { CameraControls, Environment, Lightformer, Sparkles } from '@react-three/drei';
import { EffectComposer, HueSaturation, Bloom } from '@react-three/postprocessing';
import { Model as ItemA } from './ItemA'; 
import './index.css';


// ==========================================
// 1. 定义不同场景的相机视角配置 (你需要根据实际模型微调这些坐标)
// ==========================================
const VIEW_CONFIG = {
  overview: { position: [2, 5, 8], target: [0, -2, 0] },
  thebar: { position: [3, 0, 3], target: [2, -1, 0] },
  boat: { position: [5, 0, 4], target: [2, -2, 0] },
  observatory: { position: [2, 2, 3], target: [2, 0, -1] },
  beach: { position: [1, -0.5, 3], target: [0, -1.5, 0] },
  greenery: { position: [-1, 1, 2], target: [2, 0, -1] }
};



// ==========================================
// 2. 相机动画控制器组件
// ==========================================
function CameraAnimator({ currentView }) {
  const controlsRef = useRef();

  useEffect(() => {
    if (controlsRef.current && VIEW_CONFIG[currentView]) {
      const { position, target } = VIEW_CONFIG[currentView];
      // 开启平滑过渡 (true)
      controlsRef.current.setLookAt(
        position[0], position[1], position[2],
        target[0], target[1], target[2],
        true 
      );
    }
  }, [currentView]);

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

// ==========================================
// 3. 主应用组件
// ==========================================
function App() {
  const [showPostcard, setShowPostcard] = useState(false);
const [time, setTime] = useState(new Date());
const [isMuted, setIsMuted] = useState(true);
const [isDay, setIsDay] = useState(true);


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
              scale={0.5} position={[2, -2, 0]} 
              currentView={currentView} 
              setCurrentView={setCurrentView}
              setShowPostcard={setShowPostcard} // 新增这行
            />

            {/* ====== 动态光影逻辑保留 ====== */}
            {isDay ? (
              <>
                <Environment resolution={128} frames={1}>
                  <Lightformer position={[0, 6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[10, 10, 1]} color="#e5efff" intensity={2} />
                  <Lightformer position={[-4, 3, 2]} rotation={[0, Math.PI / 2, 0]} scale={[5, 3, 1]} color="#ffd9aa" intensity={2.5} />
                  <Lightformer position={[0, 2, -5]} scale={[8, 2, 1]} color="#c2dedf" intensity={1} />
                </Environment>
                <directionalLight position={[5, 5, 2]} intensity={1.5} color="#fff8e7" />
              </>
            ) : (
              <>
                <Environment preset="night" />
                <ambientLight intensity={0.2} />
                <pointLight position={[1, 2, 1]} intensity={2} color="#f3b456" distance={5} />
                <pointLight position={[-2, 1.5, 0]} intensity={1.5} color="#fce37f" distance={4} />
                <Sparkles count={100} scale={8} size={3} speed={0.4} opacity={0.8} color="#ffcc66" position={[0, 0.5, 0]} />
              </>
            )}
          </Suspense>
          
          {/* 挂载独立的相机动画控制器 */}
          <CameraAnimator currentView={currentView} />

          <EffectComposer disableNormalPass>
            <HueSaturation saturation={isDay ? 0.3 : 0.4} hue={0} />
            <Bloom mipmapBlur intensity={1.5} luminanceThreshold={isDay ? 3 : 1} />
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
            <button className="toggle-btn" onClick={() => setIsDay(!isDay)}>
              {isDay ? '☾ NIGHT MODE' : '☀ DAY MODE'}
            </button>
            <p>{time.toDateString()}</p>
            <p>{time.toLocaleTimeString('en-US')}</p>
            <p style={{ marginTop: '10px' }}>© {time.getFullYear()} Your Name</p>
          </div>
        </div>
        
        <h1 className="center-title ui-element">Profile</h1>
        
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

          {showPostcard && (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', 
              justifyContent: 'center', alignItems: 'center', pointerEvents: 'auto',
              backdropFilter: 'blur(5px)'
            }} onClick={() => setShowPostcard(false)}>
              {/* 图片容器，阻止冒泡防止点击图片时也关闭弹窗 */}
              <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                {/* src 换成你之后准备好的图片路径 */}
                <img src="/postcard-image.png" alt="Postcard Detail" style={{ 
                  maxWidth: '80vw', maxHeight: '80vh', borderRadius: '8px', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)' 
                }} />
                <button onClick={() => setShowPostcard(false)} style={{
                  position: 'absolute', top: '-15px', right: '-15px',
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: 'none', background: '#fff', color: '#333',
                  cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
                }}>
                  ✕
                </button>
              </div>
            </div>
          )}




        </div>
        
      </div>
    </div>
  );
}

export default App;