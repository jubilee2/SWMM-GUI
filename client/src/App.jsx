import { useState, useEffect } from 'react'
import './App.css'
import MapView from './MapView'
import ResultsView from './ResultsView'

function App() {
  const [output, setOutput] = useState('Loading...')

  useEffect(() => {
    fetch('/api/output')
      .then((res) => res.text())
      .then((text) => setOutput(text))
      .catch((err) => setOutput(`Error: ${err.message}`))
  }, [])

  return (
    <div>
      <h1>SWMM Output</h1>
      <pre className="output">{output}</pre>
      <MapView />
      <ResultsView />
    </div>
  )
}

export default App
