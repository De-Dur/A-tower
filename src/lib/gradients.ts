import type { GradientEasing, Range } from '../store/useTowerStore'

const easingMap: Record<GradientEasing, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - Math.pow(1 - t, 2),
  easeInOut: (t) => {
    if (t < 0.5) {
      return 2 * t * t
    }
    return 1 - Math.pow(-2 * t + 2, 2) / 2
  },
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

export const interpolateRange = (
  range: Range,
  easing: GradientEasing,
  t: number,
) => {
  const eased = easingMap[easing](clamp01(t))
  return range.min + (range.max - range.min) * eased
}
