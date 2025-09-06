import { useState, useEffect } from 'react'
import './App.css'
import Map from './Map'

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
      <Map />
    </div>
  )
}

export default App
