import { useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

// Small normal-only waves keep the shoreline and the water volume joined.
export default function WaterMaterial() {
  const time = useMemo(() => ({ value: 0 }), [])
  useFrame((_, delta) => { time.value += Math.min(delta, 0.05) })

  const compile = useCallback((shader) => {
    shader.uniforms.uWaterTime = time
    shader.vertexShader = `
      varying vec2 vWaterPosition;
      varying vec3 vWaterAxisX;
      varying vec3 vWaterAxisZ;
    ` + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vWaterPosition = position.xz;
      vWaterAxisX = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
      vWaterAxisZ = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
    `)
    shader.fragmentShader = `
      uniform float uWaterTime;
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
      normal = normalize(normal - vWaterAxisX * slope.x - vWaterAxisZ * slope.y);
    `)
  }, [time])

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
      customProgramCacheKey={() => 'coastal-water-v1'}
    />
  )
}
