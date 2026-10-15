import React, { useEffect, useLayoutEffect, useRef, useMemo, useState, useCallback } from 'react'
import { useGLTF, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Box3, Vector3 } from 'three'
import WaterMaterial from './WaterMaterial'

const MODEL_URL = '/midnight_coast_v3.glb'
const noRaycast = () => {}
const DRINK_NAMES = new Set(['Drink_Citrus', 'Drink_Coconut', 'Drink_Mint', 'Drink_Pink'])
const DRINK_BY_PANEL = { profile: 'Drink_Coconut', highlights: 'Drink_Pink', posters: 'Drink_Mint', about: 'Drink_Citrus' }

function AssemblyPiece({ node, index, register, children }) {
  const group = useRef()

  useLayoutEffect(() => {
    const angle = index * 2.399963229728653
    const radius = 2.1 + ((index * 17) % 9) * .37
    const offset = [Math.cos(angle) * radius, 1.1 + ((index * 11) % 10) * .28, Math.sin(angle) * radius * .78]
    const turn = [Math.sin(angle) * .15, Math.cos(angle) * .42, Math.sin(angle * 1.7) * .2]
    const foundation = /^(DisplayPlinth|BeachSand|WaterSurface|WaterVolume)/.test(node.name)
    const structure = /^(Building|ExteriorStaircase|PalmTrunk|Pier|CoastalShelter)/.test(node.name)
    const delay = foundation ? (index % 4) * .1 : structure ? .32 + (index % 5) * .12 : .72 + ((index * 7) % 19) * .075
    const part = group.current
    part.position.set(...offset)
    part.rotation.set(...turn)
    part.scale.setScalar(.78)
    register(index, { part, offset, turn, delay, duration: 1.8 + (index % 5) * .12 })
    return () => register(index, null)
  }, [index, node.name, register])

  return <group ref={group}>{children}</group>
}

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

function AnimatedFeatureNode({ node, currentView, onInteract, motion, interactionProps }) {
  const moving = useRef()
  const started = useRef(-100)
  const lastToken = useRef(0)
  const isDrink = DRINK_NAMES.has(node.name)
  const active = motion.name === node.name

  useFrame(({ clock }) => {
    if (!moving.current) return
    if (active && motion.token !== lastToken.current) {
      lastToken.current = motion.token
      started.current = clock.elapsedTime
    }
    const progress = Math.min(1, Math.max(0, (clock.elapsedTime - started.current) / (isDrink ? .9 : .85)))
    const arc = progress < 1 ? Math.sin(Math.PI * progress) : 0
    if (isDrink) {
      moving.current.position.y = .38 * arc + .035 * Math.sin(progress * Math.PI * 5) * arc
      moving.current.rotation.z = -.17 * arc
      moving.current.scale.setScalar(1 + .08 * arc)
    } else {
      moving.current.rotation.y = .27 * arc
      moving.current.rotation.x = -.13 * arc
    }
  })

  const panel = isDrink ? Object.keys(DRINK_BY_PANEL).find(key => DRINK_BY_PANEL[key] === node.name) : null
  const interaction = isDrink ? (currentView === 'thebar' ? panel : 'thebar')
    : (currentView === 'observatory' ? 'stars' : 'observatory')
  return <group name={node.name} position={node.position} quaternion={node.quaternion} scale={node.scale}>
    <group ref={moving}>
      {node.isMesh && <mesh geometry={node.geometry} material={node.material}
        morphTargetDictionary={node.morphTargetDictionary} morphTargetInfluences={node.morphTargetInfluences}
        onClick={event => { event.stopPropagation(); onInteract(interaction) }}
        onPointerOver={event => { event.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }} />}
      {node.children.map(child => <ModelNode key={child.uuid} node={child} currentView={currentView}
        onInteract={onInteract} {...interactionProps} inheritedInteraction={interaction} />)}
      {isDrink && currentView === 'thebar' && <InteractionHint
        label={{ profile: 'View profile', highlights: 'View highlights', posters: 'View posters', about: 'View self evaluation' }[panel]}
        position={[0, -0.14, 0.12]} onClick={() => onInteract(panel)} subtle />}
      {!isDrink && currentView === 'observatory' && <InteractionHint label="Explore the constellations"
        position={[0.5, 1.35, 0]} onClick={() => onInteract('stars')} />}
      {isDrink && active && <Html key={motion.token} position={[0, .35, 0]} center distanceFactor={2.2}
        style={{ pointerEvents: 'none' }}><span className="drink-magic" aria-hidden="true">✦ <i>✧</i> ✦</span></Html>}
    </group>
  </group>
}

function AnimatedPostcardNode({ node, currentView, onInteract, motion, interactionProps }) {
  const floating = useRef()
  const started = useRef(-100)
  const lastToken = useRef(0)

  useFrame(({ clock }) => {
    if (!floating.current) return
    if (motion.token !== lastToken.current) {
      lastToken.current = motion.token
      started.current = clock.elapsedTime
    }
    const progress = Math.min(1, Math.max(0, (clock.elapsedTime - started.current) / 1.3))
    const rise = progress < .67 ? Math.sin(progress / .67 * Math.PI / 2)
      : Math.cos((progress - .67) / .33 * Math.PI / 2)
    floating.current.position.y = .78 * rise
    floating.current.rotation.y = .2 * rise
    floating.current.rotation.z = -.13 * rise
    floating.current.scale.setScalar(1 + .33 * rise)
  })

  return <group name={node.name} position={node.position} scale={node.scale}>
    <group ref={floating}>
      <group quaternion={node.quaternion}>
        {node.isMesh && <mesh geometry={node.geometry} material={node.material}
          onClick={event => { event.stopPropagation(); onInteract('postcard') }}
          onPointerOver={event => { event.stopPropagation(); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { document.body.style.cursor = 'auto' }} />}
        {node.children.map(child => <ModelNode key={child.uuid} node={child} currentView={currentView}
          onInteract={onInteract} {...interactionProps} inheritedInteraction="postcard" />)}
        {currentView === 'beach' && <InteractionHint label="Read the postcard"
          onClick={() => onInteract('postcard')} />}
      </group>
    </group>
  </group>
}

function WaterClickRipple({ ripple }) {
  const rings = useRef([])
  const started = useRef(null)
  useFrame(({ clock }) => {
    if (started.current === null) started.current = clock.elapsedTime
    rings.current.forEach((ring, index) => {
      if (!ring) return
      const progress = (clock.elapsedTime - started.current - index * .2) / 1.5
      ring.visible = progress >= 0 && progress < 1
      if (ring.visible) {
        const size = .4 + progress * 4.5
        ring.scale.set(size, size, size)
        ring.material.opacity = (1 - progress) * .7
      }
    })
  })
  return <group position={[ripple.x, ripple.y + .025, ripple.z]}>
    {[0, 1, 2].map(index => <mesh key={index} ref={element => { rings.current[index] = element }}
      rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
      <ringGeometry args={[.16, .19, 48]} />
      <meshBasicMaterial color="#e7ffff" transparent opacity={0} depthWrite={false} />
    </mesh>)}
  </group>
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
    const phase = Math.min(1, Math.max(0, elapsed / 3.1))
    const travel = elapsed < 3.1 ? Math.sin(Math.PI * phase) : 0
    if (boat.current) {
      boat.current.position.set(-0.86 * travel, 0.045 * Math.sin(phase * Math.PI * 4) * travel, 0.36 * travel)
      boat.current.rotation.z = 0.07 * Math.sin(phase * Math.PI * 5) * travel
      boat.current.rotation.x = 0.045 * Math.sin(phase * Math.PI * 6) * travel
    }
    ripples.current.forEach((ring, index) => {
      if (!ring) return
      const wave = (elapsed - index * 0.28) / 1.45
      ring.visible = wave >= 0 && wave < 1
      if (ring.visible) {
        const size = 0.35 + wave * 1.45
        ring.position.x = -0.3 - 0.86 * travel
        ring.position.z = 0.2 + 0.36 * travel
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
  onWaterRipple, waterRipple, featureMotion, postcardMotion, registerAssemblyPiece,
  inheritedInteraction = null, inheritedWater = null }) {
  // Keep lighting owned by App's existing day/night setup.
  if (node.isLight || node.isCamera) return null

  const interactionProps = { isDay, lampMaterial, onBoatAction, boatToken,
    onCoconutAction, coconutToken, coconutRunning, onWaterRipple, waterRipple, featureMotion, postcardMotion, registerAssemblyPiece }
  if (node.name === 'BoatMotionRoot') {
    return <BoatMotion node={node} currentView={currentView} onInteract={onInteract}
      {...interactionProps} />
  }
  if (node.name === 'Coconut_1') {
    return <FallingCoconut node={node} currentView={currentView} onInteract={onInteract}
      onCoconutAction={onCoconutAction} coconutToken={coconutToken} coconutRunning={coconutRunning} />
  }
  if (DRINK_NAMES.has(node.name) || node.name === 'Telescope') {
    return <AnimatedFeatureNode node={node} currentView={currentView} onInteract={onInteract}
      motion={featureMotion} interactionProps={interactionProps} />
  }
  if (node.name === 'Postcard') {
    return <AnimatedPostcardNode node={node} currentView={currentView} onInteract={onInteract}
      motion={postcardMotion} interactionProps={interactionProps} />
  }

  const drinkPanel = currentView === 'thebar'
    ? node.name === 'Drink_Coconut' ? 'profile'
      : node.name === 'Drink_Pink' ? 'highlights'
        : node.name === 'Drink_Mint' ? 'posters'
          : node.name === 'Drink_Citrus' ? 'about' : null
    : null
  const interaction = drinkPanel || inheritedInteraction || interactionFor(node.name)
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
      {...(water === 'volume' ? { raycast: noRaycast } : {})}
      onClick={water === 'surface' ? (event) => {
        event.stopPropagation()
        onWaterRipple?.(event)
      } : interaction ? (event) => {
        event.stopPropagation()
        onInteract(interaction)
      } : undefined}
      onPointerOver={interaction ? (event) => {
        event.stopPropagation()
        document.body.style.cursor = 'pointer'
      } : undefined}
      onPointerOut={interaction ? () => { document.body.style.cursor = 'auto' } : undefined}
    >
      {node.isMesh && water === 'surface' && <WaterMaterial ripple={waterRipple} />}
      {node.isMesh && water === 'surface' && waterRipple && <WaterClickRipple key={waterRipple.token} ripple={waterRipple} />}
      {node.isMesh && water === 'volume' && (
        <meshStandardMaterial color="#368c89" transparent opacity={0.18} depthWrite={false} roughness={0.8} />
      )}
      {node.children.map((child, index) => {
        const content = <ModelNode node={child} currentView={currentView}
          onInteract={onInteract} {...interactionProps}
          inheritedInteraction={interaction} inheritedWater={water} />
        return node.name === 'SceneRoot' ? (
          <AssemblyPiece key={child.uuid} node={child} index={index} register={registerAssemblyPiece}>{content}</AssemblyPiece>
        ) : <React.Fragment key={child.uuid}>{content}</React.Fragment>
      })}
      {node.name === 'Boat' && currentView === 'boat' && (
        <InteractionHint label="Set the boat adrift" position={[0, -0.58, 0]} onClick={onBoatAction} />
      )}
      {node.name === 'Telescope' && currentView === 'observatory' && (
        <InteractionHint label="Explore the constellations" position={[0.5, 1.35, 0]} onClick={() => onInteract('stars')} />
      )}
      {DRINK_NAMES.has(node.name) && currentView === 'thebar' && (
        <InteractionHint label={drinkPanel === 'profile' ? 'View profile' : drinkPanel === 'highlights' ? 'View highlights' : drinkPanel === 'posters' ? 'View posters' : 'View self evaluation'}
          position={[0, -0.14, 0.12]} onClick={drinkPanel ? () => onInteract(drinkPanel) : undefined} subtle />
      )}
    </Component>
  )
}

export function Model({ currentView, setCurrentView, setShowPostcard, setShowStars, setShowJourney, setShowResources, setDrinkPanel, isDay, assemblyStarted, onReady, onInteractionSound, ...props }) {
  const { scene } = useGLTF(MODEL_URL)
  const group = useRef()
  const [boatToken, setBoatToken] = useState(0)
  const [coconutToken, setCoconutToken] = useState(0)
  const [coconutRunning, setCoconutRunning] = useState(false)
  const [waterRipple, setWaterRipple] = useState(null)
  const [featureMotion, setFeatureMotion] = useState({ name: null, token: 0 })
  const [postcardMotion, setPostcardMotion] = useState({ token: 0 })
  const journeyTimer = useRef(null)
  const resourcesTimer = useRef(null)
  const featureTimer = useRef(null)
  const assemblyPieces = useRef([])
  const assemblyStart = useRef(null)
  const assemblyComplete = useRef(false)
  const registerAssemblyPiece = useCallback((index, piece) => { assemblyPieces.current[index] = piece }, [])
  const center = useMemo(() => {
    const localCenter = new Box3().setFromObject(scene).getCenter(new Vector3())
    return localCenter.multiplyScalar(props.scale ?? 1).add(new Vector3(...props.position)).toArray()
  }, [scene, props.scale, props.position])
  const lampMaterial = useMemo(() => {
    const material = scene.getObjectByName('PendantBulb')?.material?.clone()
    if (material) material.emissiveIntensity = 5
    return material
  }, [scene])
  useEffect(() => () => {
    document.body.style.cursor = 'auto'
    window.clearTimeout(journeyTimer.current)
    window.clearTimeout(resourcesTimer.current)
    window.clearTimeout(featureTimer.current)
  }, [])
  useEffect(() => { onReady?.(center) }, [onReady, center])
  useEffect(() => {
    if (!coconutRunning) return
    const timer = window.setTimeout(() => setCoconutRunning(false), 1700)
    return () => window.clearTimeout(timer)
  }, [coconutRunning, coconutToken])
  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.position.y = -2 + Math.sin(clock.elapsedTime * 0.85) * 0.045
    if (!assemblyStarted || assemblyComplete.current) return
    if (assemblyStart.current === null) assemblyStart.current = clock.elapsedTime
    const elapsed = clock.elapsedTime - assemblyStart.current
    let allSettled = true
    assemblyPieces.current.forEach(piece => {
      if (!piece) return
      const t = Math.min(1, Math.max(0, (elapsed - piece.delay) / piece.duration))
      const remaining = 1 - t * t * (3 - 2 * t)
      piece.part.position.set(piece.offset[0] * remaining, piece.offset[1] * remaining, piece.offset[2] * remaining)
      piece.part.rotation.set(piece.turn[0] * remaining, piece.turn[1] * remaining, piece.turn[2] * remaining)
      piece.part.scale.setScalar(1 - .22 * remaining)
      if (t < 1) allSettled = false
    })
    if (allSettled) assemblyComplete.current = true
  })

  const handleInteraction = (interaction) => {
    onInteractionSound?.()
    if (interaction === 'stars') {
      setFeatureMotion(value => ({ name: 'Telescope', token: value.token + 1 }))
      window.clearTimeout(featureTimer.current)
      featureTimer.current = window.setTimeout(() => setShowStars?.(true), 850)
    } else if (['profile', 'highlights', 'posters', 'about'].includes(interaction)) {
      setFeatureMotion(value => ({ name: DRINK_BY_PANEL[interaction], token: value.token + 1 }))
      window.clearTimeout(featureTimer.current)
      featureTimer.current = window.setTimeout(() => setDrinkPanel?.(interaction), 900)
    } else if (interaction === 'postcard') {
      if (currentView === 'beach') {
        setPostcardMotion(value => ({ token: value.token + 1 }))
        window.clearTimeout(featureTimer.current)
        featureTimer.current = window.setTimeout(() => setShowPostcard?.(true), 820)
      }
      else setCurrentView?.('beach')
    } else {
      setCurrentView?.(interaction)
    }
  }

  return (
    <group ref={group} {...props} dispose={null}>
      <ModelNode node={scene} currentView={currentView} onInteract={handleInteraction}
        registerAssemblyPiece={registerAssemblyPiece}
        isDay={isDay} lampMaterial={lampMaterial} featureMotion={featureMotion} postcardMotion={postcardMotion}
        onBoatAction={() => {
          onInteractionSound?.()
          setBoatToken(value => value + 1)
          window.clearTimeout(journeyTimer.current)
          journeyTimer.current = window.setTimeout(() => setShowJourney?.(true), 2800)
        }} boatToken={boatToken}
        onWaterRipple={event => {
          onInteractionSound?.()
          const point = event.object.worldToLocal(event.point.clone())
          setWaterRipple({ x: point.x, y: point.y, z: point.z, token: Date.now() })
        }} waterRipple={waterRipple}
        onCoconutAction={() => {
          onInteractionSound?.()
          setCoconutRunning(true)
          setCoconutToken(value => value + 1)
          window.clearTimeout(resourcesTimer.current)
          resourcesTimer.current = window.setTimeout(() => setShowResources?.(true), 1350)
        }}
        coconutToken={coconutToken} coconutRunning={coconutRunning} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
