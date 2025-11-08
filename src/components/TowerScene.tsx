import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import { useTowerStore } from '../store/useTowerStore'
import { buildFloorsData, buildSphereInstances, type FloorSlice, type SphereInstance } from '../lib/tower'

export function TowerScene() {
  const params = useTowerStore()

  const floorsData = useMemo<FloorSlice[]>(() => buildFloorsData(params), [params])

  const spheres = useMemo(() => {
    return buildSphereInstances(params)
  }, [params])

  const totalHeight = useMemo(
    () => (floorsData.at(-1)?.y ?? 0) + params.floorHeight,
    [floorsData, params.floorHeight],
  )

  return (
    <Canvas
      shadows
      camera={{ position: [18, totalHeight * 0.6, 22], fov: 40, near: 0.1, far: 500 }}
    >
      <color attach="background" args={['#030712']} />
      <fog attach="fog" args={['#030712', 40, 220]} />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[30, 60, 20]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Suspense fallback={null}>
        <Tower
          spheres={spheres}
          baseRadius={params.baseRadius}
          floorHeight={params.floorHeight}
          floorsCount={floorsData.length}
        />
        <Ground planeSize={params.baseRadius * 12} />
      </Suspense>
      <Stats showPanel={0} className="stats-overlay" />
      <OrbitControls
        enableDamping
        dampingFactor={0.15}
        maxPolarAngle={Math.PI * 0.5}
        minDistance={10}
        maxDistance={80}
      />
    </Canvas>
  )
}

type TowerProps = {
  spheres: SphereInstance[]
  baseRadius: number
  floorHeight: number
  floorsCount: number
}

function Tower({ spheres, baseRadius, floorHeight, floorsCount }: TowerProps) {
  return (
    <group>
      {spheres.map((sphere, index) => (
        <mesh
          key={`sphere-${index}`}
          position={sphere.position}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[sphere.radius, 32, 24]} />
          <meshStandardMaterial color={sphere.color} roughness={0.4} metalness={0.15} />
        </mesh>
      ))}
      <mesh position={[0, floorsCount * floorHeight * 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[baseRadius * 0.2, baseRadius * 0.2, floorsCount * floorHeight * 0.98, 24]}
        />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

type GroundProps = {
  planeSize: number
}

function Ground({ planeSize }: GroundProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[planeSize, planeSize]} />
      <meshStandardMaterial color="#0f172a" roughness={0.9} />
    </mesh>
  )
}
