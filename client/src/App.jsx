import { useState, useEffect } from 'react'
import './App.css'
import MapView from './MapView'
import ResultsView from './ResultsView'
import ParseForm from './ParseForm'

function App() {
  const [output, setOutput] = useState('Loading...')
  const [coordinates, setCoordinates] = useState([])
  const [theme, setTheme] = useState('light')

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
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleTheme()
          }
        }}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        role="switch"
        aria-checked={theme === 'dark'}
      >
        {theme === 'light' ? '🌞' : '🌜'}
      </button>
      <h1>SWMM Output</h1>
      <pre className="output">{output}</pre>
      <ParseForm setCoordinates={setCoordinates} />
      <MapView coordinates={coordinates} />
      <ResultsView />
    </div>
  )
}

export default App
