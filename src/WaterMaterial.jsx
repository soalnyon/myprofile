import { useCallback, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector2 } from 'three'

// Small normal-only waves keep the shoreline and the water volume joined.
export default function WaterMaterial({ ripple }) {
  const time = useRef({ value: 0 })
  const rippleAge = useRef({ value: 100 })
  const rippleOrigin = useRef({ value: new Vector2(999, 999) })
  useEffect(() => {
    if (!ripple) return
    rippleOrigin.current.value.set(ripple.x, ripple.z)
    rippleAge.current.value = 0
  }, [ripple])
  useFrame((_, delta) => {
    time.current.value += Math.min(delta, 0.05)
    rippleAge.current.value += Math.min(delta, 0.05)
  })

  const compile = useCallback((shader) => {
    shader.uniforms.uWaterTime = time.current
    shader.uniforms.uRippleAge = rippleAge.current
    shader.uniforms.uRippleOrigin = rippleOrigin.current
    shader.vertexShader = `
      uniform float uWaterTime;
      varying vec2 vWaterPosition;
      varying vec3 vWaterAxisX;
      varying vec3 vWaterAxisZ;
    ` + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      transformed.y += 0.012 * sin(position.x * 9.0 + uWaterTime * 0.8)
        + 0.009 * cos(position.z * 12.0 - uWaterTime * 0.65);
      vWaterPosition = position.xz;
      vWaterAxisX = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
      vWaterAxisZ = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
    `)
    shader.fragmentShader = `
      uniform float uWaterTime;
      uniform float uRippleAge;
      uniform vec2 uRippleOrigin;
      varying vec2 vWaterPosition;
      varying vec3 vWaterAxisX;
      varying vec3 vWaterAxisZ;
    ` + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `
      #include <normal_fragment_maps>
      vec2 p = vWaterPosition;
      vec2 slope = vec2(0.0);
      slope += vec2(0.92, 0.39) * 0.045 * cos(dot(p, vec2(0.92, 0.39)) * 9.0 - uWaterTime * 0.75);
      slope += vec2(-0.45, 0.89) * 0.028 * cos(dot(p, vec2(-0.45, 0.89)) * 15.0 + uWaterTime * 0.55);
      slope += vec2(0.68, -0.73) * 0.012 * cos(dot(p, vec2(0.68, -0.73)) * 27.0 - uWaterTime * 1.1);
      vec2 fromRipple = p - uRippleOrigin;
      float rippleDistance = length(fromRipple);
      float rippleFade = exp(-uRippleAge * 1.45) * exp(-rippleDistance * 1.8);
      slope += normalize(fromRipple + vec2(0.0001)) * 0.13 * rippleFade
        * cos(rippleDistance * 26.0 - uRippleAge * 18.0);
      normal = normalize(normal - vWaterAxisX * slope.x - vWaterAxisZ * slope.y);
    `)
  }, [])

  return (
    <meshPhysicalMaterial
      color="#b6ddd8"
      metalness={0}
      roughness={0.16}
      transmission={0.88}
      thickness={0.18}
      ior={1.333}
      attenuationColor="#409b94"
      attenuationDistance={2.5}
      envMapIntensity={0.8}
      onBeforeCompile={compile}
      customProgramCacheKey={() => 'coastal-water-v2'}
    />
  )
}
