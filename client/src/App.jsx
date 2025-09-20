import { useState, useEffect } from 'react'
import './App.css'
import MapView from './MapView'
import ResultsView from './ResultsView'
import ParseForm from './ParseForm'
import InpFilesModal from './InpFilesModal'

function App() {
  const [output, setOutput] = useState('Loading...')
  const [coordinates, setCoordinates] = useState([])
  const [theme, setTheme] = useState('light')
  const [showInpFilesModal, setShowInpFilesModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    fetch('/api/output')
      .then((res) => res.text())
      .then((text) => setOutput(text))
      .catch((err) => setOutput(`Error: ${err.message}`))
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <div>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        role="switch"
        aria-checked={theme === 'dark'}
      >
        {theme === 'light' ? '🌞' : '🌜'}
      </button>
      <button
        className="action-button"
        type="button"
        onClick={() => setShowInpFilesModal(true)}
      >
        View Stored INP Files
      </button>
      <h1>SWMM Output</h1>
      <pre className="output">{output}</pre>
      <MapView coordinates={coordinates} />
      <ResultsView />
      {showUploadModal && (
        <ParseForm
          setCoordinates={setCoordinates}
          onClose={() => setShowUploadModal(false)}
        />
      )}
      {showInpFilesModal && (
        <InpFilesModal
          onClose={() => setShowInpFilesModal(false)}
          onUploadClick={() => {
            setShowUploadModal(true)
            setShowInpFilesModal(false)
          }}
        />
      )}
    </div>
  )
}

export default App
