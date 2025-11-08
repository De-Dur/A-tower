import { useMemo, useState, type ChangeEvent } from 'react'
import chroma from 'chroma-js'
import { useTowerStore, type GradientEasing, type TowerParameters } from '../store/useTowerStore'
import { exportTowerToFbx, exportTowerToObj } from '../lib/exportTower'

const easingOptions: { label: string; value: GradientEasing }[] = [
  { label: 'Linear', value: 'linear' },
  { label: 'Ease In', value: 'easeIn' },
  { label: 'Ease Out', value: 'easeOut' },
  { label: 'Ease In/Out', value: 'easeInOut' },
]

const formatValue = (value: number) =>
  Number.isInteger(value) ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '')

const tabs = [
  { id: 'controls', label: 'Controls' },
  { id: 'export', label: 'Export' },
]

export function ControlsPanel() {
  const {
    floors,
    floorHeight,
    baseRadius,
    twistRange,
    scaleRange,
    twistEasing,
    scaleEasing,
    bottomColor,
    topColor,
    presets,
    activePresetId,
    setParams,
    updateRange,
    savePreset,
    loadPreset,
    deletePreset,
    resetDefaults,
  } = useTowerStore()
  const [presetName, setPresetName] = useState('')
  const [activeTab, setActiveTab] = useState<'controls' | 'export'>('controls')
  const [exportState, setExportState] = useState<'idle' | 'working'>('idle')
  const [exportMessage, setExportMessage] = useState<{ tone: 'info' | 'done' | 'error'; text: string } | null>(null)

  const gradientPreview = useMemo(() => {
    const scale = chroma.scale([bottomColor, topColor]).mode('lab')
    return `linear-gradient(90deg, ${scale(0).hex()}, ${scale(1).hex()})`
  }, [bottomColor, topColor])

  const presetValue = activePresetId ?? 'custom'
  const isSaveDisabled = presetName.trim().length === 0

  const handlePresetSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    if (value === 'custom') {
      return
    }
    loadPreset(value)
  }

  const handleSavePreset = () => {
    if (isSaveDisabled) {
      return
    }
    savePreset(presetName)
    setPresetName('')
  }

  const handleDeletePreset = () => {
    if (!activePresetId) {
      return
    }
    deletePreset(activePresetId)
  }

  const snapshotParams = (): TowerParameters => ({
    floors,
    floorHeight,
    baseRadius,
    twistRange: { ...twistRange },
    scaleRange: { ...scaleRange },
    twistEasing,
    scaleEasing,
    bottomColor,
    topColor,
  })

  const handleExport = async (format: 'fbx' | 'obj') => {
    try {
      setExportState('working')
      setExportMessage({ tone: 'info', text: `Preparing ${format.toUpperCase()}...` })
      if (format === 'fbx') {
        await exportTowerToFbx(snapshotParams())
      } else {
        await exportTowerToObj(snapshotParams())
      }
      setExportMessage({ tone: 'done', text: `${format.toUpperCase()} download started.` })
    } catch (error) {
      console.error('FBX export failed', error)
      setExportMessage({ tone: 'error', text: 'Export failed. Check console for details.' })
    } finally {
      setExportState('idle')
      setTimeout(() => setExportMessage(null), 3000)
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Parametric Suite</h2>
        <div className="tab-menu">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as 'controls' | 'export')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'controls' ? (
        <>
          <section>
            <h3>Presets</h3>
            <label className="control-block">
              <div className="control-header">
                <span>Saved presets</span>
                <span>{presets.length}</span>
              </div>
              <select value={presetValue} onChange={handlePresetSelect}>
                <option value="custom">Custom (unsaved)</option>
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="preset-form">
              <input
                type="text"
                placeholder="New preset name"
                value={presetName}
                onChange={(event) => setPresetName(event.target.value)}
              />
              <button type="button" className="btn primary" disabled={isSaveDisabled} onClick={handleSavePreset}>
                Save preset
              </button>
            </div>
            <div className="preset-actions">
              <button type="button" className="btn ghost" onClick={resetDefaults}>
                Reset to defaults
              </button>
              <button
                type="button"
                className="btn danger"
                onClick={handleDeletePreset}
                disabled={!activePresetId}
              >
                Delete active
              </button>
            </div>
          </section>

          <section>
            <h3>Tower Dimensions</h3>
            <Slider
              label="Floors"
              min={3}
              max={120}
              step={1}
              value={floors}
              onChange={(value) => setParams({ floors: value })}
            />
            <Slider
              label="Floor Height (m)"
              min={1}
              max={6}
              step={0.1}
              value={floorHeight}
              onChange={(value) => setParams({ floorHeight: value })}
            />
            <Slider
              label="Base Radius (m)"
              min={2}
              max={10}
              step={0.1}
              value={baseRadius}
              onChange={(value) => setParams({ baseRadius: value })}
            />
          </section>

          <section>
            <h3>Twist Gradient</h3>
            <DualInput
              min={-360}
              max={360}
              label="Angle range (°)"
              valueMin={twistRange.min}
              valueMax={twistRange.max}
              onChange={(partial) => updateRange('twistRange', partial)}
            />
            <Select
              label="Easing"
              value={twistEasing}
              options={easingOptions}
              onChange={(value) => setParams({ twistEasing: value })}
            />
          </section>

          <section>
            <h3>Scale Gradient</h3>
            <DualInput
              min={0.1}
              max={2}
              step={0.05}
              label="Scale range"
              valueMin={scaleRange.min}
              valueMax={scaleRange.max}
              onChange={(partial) => updateRange('scaleRange', partial)}
            />
            <Select
              label="Easing"
              value={scaleEasing}
              options={easingOptions}
              onChange={(value) => setParams({ scaleEasing: value })}
            />
          </section>

          <section>
            <h3>Gradient Colors</h3>
            <ColorInput
              label="Bottom"
              value={bottomColor}
              onChange={(value) => setParams({ bottomColor: value })}
            />
            <ColorInput
              label="Top"
              value={topColor}
              onChange={(value) => setParams({ topColor: value })}
            />
            <div className="gradient-preview" style={{ background: gradientPreview }} />
          </section>
        </>
      ) : (
        <section className="export-panel">
          <h3>Export Tower</h3>
          <p>Download the current tower, preserving per-vertex colors, for use in Blender or other DCC tools.</p>
          <div className="export-actions">
            <button
              type="button"
              className="btn primary"
              onClick={() => handleExport('fbx')}
              disabled={exportState === 'working'}
            >
              {exportState === 'working' ? 'Exporting…' : 'FBX'}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => handleExport('obj')}
              disabled={exportState === 'working'}
            >
              OBJ
            </button>
          </div>
          {exportMessage && <p className={`export-status ${exportMessage.tone}`}>{exportMessage.text}</p>}
        </section>
      )}
    </div>
  )
}

type SliderProps = {
  label: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
}

function Slider({ label, min, max, step = 1, value, onChange }: SliderProps) {
  return (
    <label className="control-block">
      <div className="control-header">
        <span>{label}</span>
        <span>{formatValue(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

type DualInputProps = {
  label: string
  valueMin: number
  valueMax: number
  min: number
  max: number
  step?: number
  onChange: (partial: { min?: number; max?: number }) => void
}

function DualInput({
  label,
  valueMin,
  valueMax,
  min,
  max,
  step = 1,
  onChange,
}: DualInputProps) {
  return (
    <div className="dual-input">
      <div className="control-header">
        <span>{label}</span>
        <span>
          {formatValue(valueMin)}
          {' -> '}
          {formatValue(valueMax)}
        </span>
      </div>
      <div className="dual-input__fields">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(event) => onChange({ min: Number(event.target.value) })}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(event) => onChange({ max: Number(event.target.value) })}
        />
      </div>
    </div>
  )
}

type SelectProps = {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (value: any) => void
}

function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <label className="control-block">
      <div className="control-header">
        <span>{label}</span>
      </div>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

type ColorInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <label className="color-input">
      <span>{label}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
