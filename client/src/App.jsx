import { useState, useEffect } from 'react'
import './App.css'
import MapView from './MapView'

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
    </div>
  )
}

export default App
