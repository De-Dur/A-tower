import './App.css'
import { ControlsPanel } from './components/ControlsPanel'
import { TowerScene } from './components/TowerScene'

function App() {
  return (
    <div className="app-shell">
      <header>
        <div>
          <p className="eyebrow">Procedural study</p>
          <h1>A-tower generator</h1>
        </div>
        <p className="subtitle">
          Adjust slabs, twists, and gradient colors in real time to explore sculptural tower massing
          ideas directly in your browser.
        </p>
      </header>

      <main className="workspace">
        <section className="viewport">
          <TowerScene />
        </section>
        <aside className="controls">
          <ControlsPanel />
        </aside>
      </main>
    </div>
  )
}

export default App
