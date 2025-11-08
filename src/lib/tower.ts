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
