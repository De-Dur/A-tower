import * as THREE from 'three'
import chroma from 'chroma-js'
import type { TowerParameters } from '../store/useTowerStore'
import { interpolateRange } from './gradients'

export type FloorSlice = {
  y: number
  rotation: number
  scale: number
  color: string
}

export const buildFloorsData = (params: TowerParameters): FloorSlice[] => {
  const chromaScale = chroma.scale([params.bottomColor, params.topColor]).mode('lab')
  const count = Math.max(1, Math.floor(params.floors))
  const slices: FloorSlice[] = []
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : i / (count - 1)
    slices.push({
      y: i * params.floorHeight,
      rotation: THREE.MathUtils.degToRad(
        interpolateRange(params.twistRange, params.twistEasing, t),
      ),
      scale: interpolateRange(params.scaleRange, params.scaleEasing, t),
      color: chromaScale(t).hex(),
    })
  }
  return slices
}

export type SphereInstance = {
  position: [number, number, number]
  radius: number
  color: string
}

export const buildSphereInstances = (params: TowerParameters): SphereInstance[] => {
  const slices = buildFloorsData(params)
  const instances: SphereInstance[] = []
  const perFloor = Math.max(1, Math.round(params.spheresPerFloor))
  const twoPi = Math.PI * 2

  slices.forEach((slice) => {
    const baseY = slice.y + params.floorHeight * 0.5
    const radius = params.sphereRadius * slice.scale
    const layoutRadius = params.baseRadius * slice.scale
    for (let i = 0; i < perFloor; i += 1) {
      let x = 0
      let z = 0
      if (perFloor > 1) {
        const angle = (i / perFloor) * twoPi
        x = Math.cos(angle) * layoutRadius
        z = Math.sin(angle) * layoutRadius
      }
      const cosRot = Math.cos(slice.rotation)
      const sinRot = Math.sin(slice.rotation)
      const rotatedX = x * cosRot - z * sinRot
      const rotatedZ = x * sinRot + z * cosRot
      instances.push({
        position: [rotatedX, baseY, rotatedZ],
        radius: radius,
        color: slice.color,
      })
    }
  })

  return instances
}
