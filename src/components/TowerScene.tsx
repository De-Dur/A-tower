import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import * as THREE from 'three'
import chroma from 'chroma-js'
import { interpolateRange } from '../lib/gradients'
import { useTowerStore } from '../store/useTowerStore'

type Floor = {
  y: number
  rotation: number
  scale: number
  color: string
}

export function TowerScene() {
  const params = useTowerStore()

  const chromaScale = useMemo(
    () => chroma.scale([params.bottomColor, params.topColor]).mode('lab'),
    [params.bottomColor, params.topColor],
  )

  const floorsData: Floor[] = useMemo(() => {
    const count = Math.max(1, Math.floor(params.floors))
    const collection: Floor[] = []
    for (let i = 0; i < count; i += 1) {
      const t = count === 1 ? 0 : i / (count - 1)
      collection.push({
        y: i * params.floorHeight,
        rotation: THREE.MathUtils.degToRad(
          interpolateRange(params.twistRange, params.twistEasing, t),
        ),
        scale: interpolateRange(params.scaleRange, params.scaleEasing, t),
        color: chromaScale(t).hex(),
      })
    }
    return collection
  }, [params, chromaScale])

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
        <Tower floors={floorsData} baseRadius={params.baseRadius} floorHeight={params.floorHeight} />
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
  floors: Floor[]
  baseRadius: number
  floorHeight: number
}

function Tower({ floors, baseRadius, floorHeight }: TowerProps) {
  const slabHeight = floorHeight * 0.9

  return (
    <group position={[0, slabHeight / 2, 0]}>
      {floors.map((floor, index) => (
        <mesh
          key={`floor-${index}`}
          position={[0, floor.y, 0]}
          rotation={[0, floor.rotation, 0]}
          scale={[floor.scale, 1, floor.scale]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[baseRadius * 2, slabHeight, baseRadius * 2]} />
          <meshStandardMaterial color={floor.color} roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, floors.length * floorHeight * 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[baseRadius * 0.2, baseRadius * 0.2, floors.length * floorHeight * 0.98, 24]}
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
