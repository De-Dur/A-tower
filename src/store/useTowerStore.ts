import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GradientEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'

export interface Range {
  min: number
  max: number
}

export interface TowerParameters {
  floors: number
  floorHeight: number
  baseRadius: number
  sphereRadius: number
  spheresPerFloor: number
  twistRange: Range
  scaleRange: Range
  twistEasing: GradientEasing
  scaleEasing: GradientEasing
  bottomColor: string
  topColor: string
}

export interface Preset {
  id: string
  name: string
  params: TowerParameters
}

export interface TowerState extends TowerParameters {
  presets: Preset[]
  activePresetId: string | null
  setParams: (partial: Partial<TowerParameters>) => void
  updateRange: (key: 'twistRange' | 'scaleRange', patch: Partial<Range>) => void
  savePreset: (name: string) => void
  loadPreset: (id: string) => void
  deletePreset: (id: string) => void
  resetDefaults: () => void
}

const baseParameters: TowerParameters = {
  floors: 36,
  floorHeight: 3.2,
  baseRadius: 5,
  sphereRadius: 1.2,
  spheresPerFloor: 1,
  twistRange: { min: 0, max: 220 },
  scaleRange: { min: 1, max: 0.35 },
  twistEasing: 'easeInOut',
  scaleEasing: 'easeOut',
  bottomColor: '#0f172a',
  topColor: '#36c2ff',
}

const presetSeeds: Preset[] = [
  { id: 'ribbon', name: 'Ribbon Twist', params: cloneParameters(baseParameters) },
  {
    id: 'spire',
    name: 'Spiral Needle',
    params: sanitizeParameters({
      ...baseParameters,
      floors: 48,
      floorHeight: 3.8,
      twistRange: { min: 0, max: 420 },
      scaleRange: { min: 0.9, max: 0.15 },
      topColor: '#f97316',
    }),
  },
  {
    id: 'waist',
    name: 'Pinched Waist',
    params: sanitizeParameters({
      ...baseParameters,
      floors: 32,
      baseRadius: 6,
      twistRange: { min: -90, max: 120 },
      scaleRange: { min: 1.4, max: 0.6 },
      bottomColor: '#0f172a',
      topColor: '#a855f7',
      scaleEasing: 'easeInOut',
    }),
  },
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function sanitizeRange(range: Range, bounds: Range): Range {
  const min = clamp(range.min, bounds.min, bounds.max)
  const max = clamp(range.max, bounds.min, bounds.max)
  return { min, max }
}

function cloneParameters(params: TowerParameters): TowerParameters {
  return {
    floors: params.floors,
    floorHeight: params.floorHeight,
    baseRadius: params.baseRadius,
    sphereRadius: params.sphereRadius,
    spheresPerFloor: params.spheresPerFloor,
    twistRange: { ...params.twistRange },
    scaleRange: { ...params.scaleRange },
    twistEasing: params.twistEasing,
    scaleEasing: params.scaleEasing,
    bottomColor: params.bottomColor,
    topColor: params.topColor,
  }
}

function sanitizeParameters(input: TowerParameters): TowerParameters {
  return {
    floors: clamp(Math.round(input.floors || baseParameters.floors), 1, 200),
    floorHeight: clamp(input.floorHeight || baseParameters.floorHeight, 1, 10),
    baseRadius: clamp(input.baseRadius || baseParameters.baseRadius, 1, 15),
    sphereRadius: clamp(input.sphereRadius || baseParameters.sphereRadius, 0.2, 5),
    spheresPerFloor: clamp(Math.round(input.spheresPerFloor || baseParameters.spheresPerFloor), 1, 12),
    twistRange: sanitizeRange(input.twistRange || baseParameters.twistRange, {
      min: -720,
      max: 720,
    }),
    scaleRange: sanitizeRange(input.scaleRange || baseParameters.scaleRange, {
      min: 0.1,
      max: 3,
    }),
    twistEasing: input.twistEasing || baseParameters.twistEasing,
    scaleEasing: input.scaleEasing || baseParameters.scaleEasing,
    bottomColor: input.bottomColor || baseParameters.bottomColor,
    topColor: input.topColor || baseParameters.topColor,
  }
}

const createPresetId = () => {
  const globalCrypto = globalThis.crypto as Crypto | undefined
  if (globalCrypto?.randomUUID) {
    return `preset-${globalCrypto.randomUUID()}`
  }
  return `preset-${Math.random().toString(36).slice(2, 10)}`
}

export const useTowerStore = create<TowerState>()(
  persist(
    (set, get) => ({
      ...cloneParameters(baseParameters),
      presets: presetSeeds,
      activePresetId: presetSeeds[0]?.id ?? null,
      setParams: (partial) =>
        set((state) => {
          const merged = sanitizeParameters({
            ...cloneParameters(state),
            ...partial,
          })
          return {
            ...state,
            ...merged,
            activePresetId: null,
          }
        }),
      updateRange: (key, patch) =>
        set((state) => {
          const bounds =
            key === 'twistRange' ? ({ min: -720, max: 720 } as Range) : ({ min: 0.1, max: 3 } as Range)
          const nextRange = sanitizeRange(
            { ...state[key], ...patch } as Range,
            bounds,
          )
          return {
            ...state,
            [key]: nextRange,
            activePresetId: null,
          }
        }),
      savePreset: (name) => {
        const trimmed = name.trim()
        if (!trimmed) {
          return
        }
        const params = sanitizeParameters(cloneParameters(get()))
        const id = createPresetId()
        set((state) => ({
          ...state,
          ...params,
          activePresetId: id,
          presets: [...state.presets, { id, name: trimmed, params }],
        }))
      },
      loadPreset: (id) =>
        set((state) => {
          const preset = state.presets.find((item) => item.id === id)
          if (!preset) {
            return state
          }
          return {
            ...state,
            ...cloneParameters(preset.params),
            activePresetId: id,
          }
        }),
      deletePreset: (id) =>
        set((state) => {
          const filtered = state.presets.filter((preset) => preset.id !== id)
          const wasActive = state.activePresetId === id
          return {
            ...state,
            presets: filtered,
            activePresetId: wasActive ? null : state.activePresetId,
          }
        }),
      resetDefaults: () =>
        set((state) => ({
          ...state,
          ...cloneParameters(baseParameters),
          activePresetId: null,
        })),
    }),
    {
      name: 'a-tower-store',
      partialize: (state) => ({
        ...cloneParameters(state),
        presets: state.presets,
        activePresetId: state.activePresetId,
      }),
    },
  ),
)
