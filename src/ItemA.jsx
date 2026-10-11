import React, { useEffect, useRef, useMemo } from 'react'
import { useGLTF, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Box3, Vector3 } from 'three'
import WaterMaterial from './WaterMaterial'

const MODEL_URL = '/midnight_coast_v3.glb'
const noRaycast = () => {}

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
function ModelNode({ node, currentView, onInteract, isDay, lampMaterial, inheritedInteraction = null, inheritedWater = null }) {
  // Keep lighting owned by App's existing day/night setup.
  if (node.isLight || node.isCamera) return null

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
          onInteract={onInteract} isDay={isDay} lampMaterial={lampMaterial}
          inheritedInteraction={interaction} inheritedWater={water} />
      ))}
      {node.name === 'Postcard' && currentView === 'beach' && (
        <Html position={[0, 0.15, 0]} center>
          <div className="glowing-indicator" />
        </Html>
      )}
    </Component>
  )
}

export function Model({ currentView, setCurrentView, setShowPostcard, isDay, onReady, ...props }) {
  const { scene } = useGLTF(MODEL_URL)
  const group = useRef()
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
  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.position.y = -2 + Math.sin(clock.elapsedTime * 0.85) * 0.045
  })

  const handleInteraction = (interaction) => {
    if (interaction === 'postcard') {
      if (currentView === 'beach') setShowPostcard?.(true)
      else setCurrentView?.('beach')
    } else {
      setCurrentView?.(interaction)
    }
  }

  return (
    <group ref={group} {...props} dispose={null}>
      <ModelNode node={scene} currentView={currentView} onInteract={handleInteraction}
        isDay={isDay} lampMaterial={lampMaterial} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
