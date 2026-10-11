import React, { useEffect, useRef, useMemo, useState } from 'react'
import { useGLTF, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Box3, Vector3 } from 'three'
import WaterMaterial from './WaterMaterial'

const MODEL_URL = '/midnight_coast_v3.glb'
const noRaycast = () => {}
const DRINK_NAMES = new Set(['Drink_Citrus', 'Drink_Coconut', 'Drink_Mint', 'Drink_Pink'])

function InteractionHint({ label, onClick, subtle = false, position = [0, 0.18, 0] }) {
  return (
    <Html position={position} center distanceFactor={2.2}>
      {onClick ? (
        <button type="button" className={`glowing-indicator ${subtle ? 'glowing-indicator-small' : ''}`}
          aria-label={label} title={label} onPointerDown={event => event.stopPropagation()}
          onClick={event => { event.stopPropagation(); onClick() }} />
      ) : (
        <span className="glowing-indicator glowing-indicator-small" title={label} aria-label={label} />
      )}
    </Html>
  )
}

function BoatMotion({ node, currentView, onInteract, onBoatAction, boatToken, ...rest }) {
  const boat = useRef()
  const ripples = useRef([])
  const droplets = useRef([])
  const lastToken = useRef(boatToken)
  const started = useRef(-100)

  useFrame(({ clock }) => {
    if (boatToken !== lastToken.current) {
      lastToken.current = boatToken
      started.current = clock.elapsedTime
    }
    const elapsed = clock.elapsedTime - started.current
    const phase = Math.min(1, elapsed / 3.1)
    if (boat.current) boat.current.position.x = elapsed < 3.1 ? -0.78 * Math.sin(Math.PI * phase) : 0
    ripples.current.forEach((ring, index) => {
      if (!ring) return
      const wave = (elapsed - index * 0.28) / 1.45
      ring.visible = wave >= 0 && wave < 1
      if (ring.visible) {
        const size = 0.35 + wave * 1.45
        ring.scale.set(size, size, size)
        ring.material.opacity = (1 - wave) * 0.45
      }
    })
    droplets.current.forEach((drop, index) => {
      if (!drop) return
      const t = elapsed - index * 0.1
      drop.visible = t >= 0 && t < 1.1
      if (drop.visible) {
        drop.position.set(-0.3 + (index - 2) * 0.12,
          -0.93 + 0.35 * Math.sin(Math.PI * t / 1.1),
          0.15 + (index % 2 ? 0.22 : -0.18))
        drop.material.opacity = (1 - t / 1.1) * 0.85
      }
    })
  })

  return (
    <group name={node.name} position={node.position} quaternion={node.quaternion} scale={node.scale}>
      <group ref={boat}>
        {node.children.map(child => (
          <ModelNode key={child.uuid} node={child} currentView={currentView}
            onInteract={onInteract} onBoatAction={onBoatAction} {...rest} />
        ))}
      </group>
      {Array.from({ length: 3 }, (_, index) => (
        <mesh key={index} ref={element => { ripples.current[index] = element }}
          position={[-0.3, -0.93, 0.2]} rotation={[-Math.PI / 2, 0, 0]}
          visible={false} raycast={noRaycast}>
          <ringGeometry args={[0.75, 0.88, 48]} />
          <meshBasicMaterial color="#c5faff" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
      {Array.from({ length: 5 }, (_, index) => (
        <mesh key={`drop-${index}`} ref={element => { droplets.current[index] = element }}
          visible={false} raycast={noRaycast}>
          <sphereGeometry args={[index % 2 ? 0.037 : 0.027, 8, 8]} />
          <meshBasicMaterial color="#d9ffff" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
      {boatToken > 0 && (
        <Html key={boatToken} position={[-0.42, -0.91, 0.3]} center distanceFactor={2.2}
          style={{ pointerEvents: 'none' }}>
          <div className="water-splash" aria-hidden="true">
            <i /><i /><i />
            <b /><b /><b />
          </div>
        </Html>
      )}
    </group>
  )
}

function FallingCoconut({ node, currentView, onInteract, onCoconutAction, coconutToken, coconutRunning }) {
  const coconut = useRef()
  const lastToken = useRef(coconutToken)
  const started = useRef(-100)

  useFrame(({ clock }) => {
    if (coconutToken !== lastToken.current) {
      lastToken.current = coconutToken
      started.current = clock.elapsedTime
    }
    if (!coconut.current) return
    const elapsed = clock.elapsedTime - started.current
    if (elapsed < 1.05) {
      const fall = Math.min(1, elapsed / 1.05)
      coconut.current.position.set(-0.22 * fall, -5.28 * fall * fall, 0.08 * fall)
      coconut.current.rotation.z = fall * 0.8
      coconut.current.visible = true
    } else if (elapsed < 1.65) {
      coconut.current.visible = false
    } else {
      coconut.current.position.set(0, 0, 0)
      coconut.current.rotation.z = 0
      coconut.current.visible = true
    }
  })

  return (
    <group name={node.name} position={node.position} quaternion={node.quaternion} scale={node.scale}>
      <mesh ref={coconut} geometry={node.geometry} material={node.material}
        onClick={event => { event.stopPropagation(); onInteract('greenery') }}
        onPointerOver={event => { event.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }} />
      {currentView === 'greenery' && !coconutRunning && (
        <InteractionHint label="Drop the coconut" onClick={onCoconutAction} />
      )}
    </group>
  )
}

// Map both original and newly added objects to the existing navigation views.
function interactionFor(name) {
  if (/^Postcard/.test(name)) return 'postcard'
  if (/^(Astronomy|PartialTerrace|StarChart|Telescope|Terrace|Observatory|Orrery|Parchment|Quill|BookRibbon)/.test(name)) return 'observatory'
  if (/^(Boat|Pier|FishingRod|LandingNet|CoastalShelter|Shelter)/.test(name)) return 'boat'
  if (/^(Palm|Coconut|Garden|RearFlowerBed)/.test(name)) return 'greenery'
  if (/^(Beach(?!Sand)|Picnic|Seashell|Surfboard)/.test(name)) return 'beach'
  if (/^(BarStool|Building|Drink|Exterior|Interior|Pendant|Shop|StripedAwning|Aquarium|Counter|EntryPlanter|HangingNeon|IceCream|Juicer|SideFestoon)/.test(name)) return 'thebar'
  return null
}

// Render the GLB hierarchy directly so new geometry, materials and parent
// transforms survive future model revisions without hard-coded coordinates.
function ModelNode({ node, currentView, onInteract, isDay, lampMaterial,
  onBoatAction, boatToken, onCoconutAction, coconutToken, coconutRunning,
  inheritedInteraction = null, inheritedWater = null }) {
  // Keep lighting owned by App's existing day/night setup.
  if (node.isLight || node.isCamera) return null

  const interactionProps = { isDay, lampMaterial, onBoatAction, boatToken,
    onCoconutAction, coconutToken, coconutRunning }
  if (node.name === 'BoatMotionRoot') {
    return <BoatMotion node={node} currentView={currentView} onInteract={onInteract}
      {...interactionProps} />
  }
  if (node.name === 'Coconut_1') {
    return <FallingCoconut node={node} currentView={currentView} onInteract={onInteract}
      onCoconutAction={onCoconutAction} coconutToken={coconutToken} coconutRunning={coconutRunning} />
  }

  const interaction = inheritedInteraction || interactionFor(node.name)
  const water = node.name === 'WaterSurface' ? 'surface'
    : node.name === 'WaterVolume' ? 'volume' : inheritedWater
  const Component = node.isMesh ? 'mesh' : 'group'
  const geometryProps = node.isMesh ? {
    geometry: node.geometry,
    material: water ? undefined : (node.name === 'PendantBulb' && !isDay ? lampMaterial : node.material),
    morphTargetDictionary: node.morphTargetDictionary,
    morphTargetInfluences: node.morphTargetInfluences,
  } : {}

  return (
    <Component
      name={node.name}
      position={node.position}
      quaternion={node.quaternion}
      scale={node.scale}
      visible={node.visible}
      userData={node.userData}
      {...geometryProps}
      {...(water ? { raycast: noRaycast } : {})}
      onClick={interaction ? (event) => {
        event.stopPropagation()
        onInteract(interaction)
      } : undefined}
      onPointerOver={interaction ? (event) => {
        event.stopPropagation()
        document.body.style.cursor = 'pointer'
      } : undefined}
      onPointerOut={interaction ? () => { document.body.style.cursor = 'auto' } : undefined}
    >
      {node.isMesh && water === 'surface' && <WaterMaterial />}
      {node.isMesh && water === 'volume' && (
        <meshStandardMaterial color="#368c89" transparent opacity={0.18} depthWrite={false} roughness={0.8} />
      )}
      {node.children.map(child => (
        <ModelNode key={child.uuid} node={child} currentView={currentView}
          onInteract={onInteract} {...interactionProps}
          inheritedInteraction={interaction} inheritedWater={water} />
      ))}
      {node.name === 'Postcard' && currentView === 'beach' && (
        <InteractionHint label="Read the postcard" onClick={() => onInteract('postcard')} />
      )}
      {node.name === 'Boat' && currentView === 'boat' && (
        <InteractionHint label="Set the boat adrift" position={[0, -0.58, 0]} onClick={onBoatAction} />
      )}
      {node.name === 'Telescope' && currentView === 'observatory' && (
        <InteractionHint label="Explore the constellations" onClick={() => onInteract('stars')} />
      )}
      {DRINK_NAMES.has(node.name) && currentView === 'thebar' && (
        <InteractionHint label={`${node.name.replace('Drink_', '')} drink`} subtle />
      )}
    </Component>
  )
}

export function Model({ currentView, setCurrentView, setShowPostcard, setShowStars, isDay, onReady, ...props }) {
  const { scene } = useGLTF(MODEL_URL)
  const group = useRef()
  const [boatToken, setBoatToken] = useState(0)
  const [coconutToken, setCoconutToken] = useState(0)
  const [coconutRunning, setCoconutRunning] = useState(false)
  const center = useMemo(() => {
    const localCenter = new Box3().setFromObject(scene).getCenter(new Vector3())
    return localCenter.multiplyScalar(props.scale ?? 1).add(new Vector3(...props.position)).toArray()
  }, [scene, props.scale, props.position])
  const lampMaterial = useMemo(() => {
    const material = scene.getObjectByName('PendantBulb')?.material?.clone()
    if (material) material.emissiveIntensity = 5
    return material
  }, [scene])
  useEffect(() => () => { document.body.style.cursor = 'auto' }, [])
  useEffect(() => { onReady?.(center) }, [onReady, center])
  useEffect(() => {
    if (!coconutRunning) return
    const timer = window.setTimeout(() => setCoconutRunning(false), 1700)
    return () => window.clearTimeout(timer)
  }, [coconutRunning, coconutToken])
  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.position.y = -2 + Math.sin(clock.elapsedTime * 0.85) * 0.045
  })

  const handleInteraction = (interaction) => {
    if (interaction === 'stars') {
      setShowStars?.(true)
    } else if (interaction === 'postcard') {
      if (currentView === 'beach') setShowPostcard?.(true)
      else setCurrentView?.('beach')
    } else {
      setCurrentView?.(interaction)
    }
  }

  return (
    <group ref={group} {...props} dispose={null}>
      <ModelNode node={scene} currentView={currentView} onInteract={handleInteraction}
        isDay={isDay} lampMaterial={lampMaterial}
        onBoatAction={() => setBoatToken(value => value + 1)} boatToken={boatToken}
        onCoconutAction={() => { setCoconutRunning(true); setCoconutToken(value => value + 1) }}
        coconutToken={coconutToken} coconutRunning={coconutRunning} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
