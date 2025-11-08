import { create } from 'zustand'

export type GradientEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'

export interface Range {
  min: number
  max: number
}

export interface TowerState {
  floors: number
  floorHeight: number
  baseRadius: number
  twistRange: Range
  scaleRange: Range
  twistEasing: GradientEasing
  scaleEasing: GradientEasing
  bottomColor: string
  topColor: string
  setParams: (partial: Partial<TowerState>) => void
  updateRange: (key: 'twistRange' | 'scaleRange', patch: Partial<Range>) => void
}

export const useTowerStore = create<TowerState>((set) => ({
  floors: 36,
  floorHeight: 3.2,
  baseRadius: 5,
  twistRange: { min: 0, max: 220 },
  scaleRange: { min: 1, max: 0.35 },
  twistEasing: 'easeInOut',
  scaleEasing: 'easeOut',
  bottomColor: '#0f172a',
  topColor: '#36c2ff',
  setParams: (partial) =>
    set((state) => ({
      ...state,
      ...partial,
    })),
  updateRange: (key, patch) =>
    set((state) => ({
      ...state,
      [key]: { ...state[key], ...patch },
    })),
}))
