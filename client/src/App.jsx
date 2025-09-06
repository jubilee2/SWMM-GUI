import { useState, useEffect } from 'react'
import './App.css'
import MapView from './MapView'
import ResultsView from './ResultsView'
import PropertiesPane from './PropertiesPane'

function App() {
  const [output, setOutput] = useState('Loading...')
  const [parsed, setParsed] = useState(null)

  useEffect(() => {
    fetch('/api/output')
      .then((res) => res.text())
      .then((text) => setOutput(text))
      .catch((err) => setOutput(`Error: ${err.message}`))
  }, [])

  return (
    <div>
      <h1>SWMM Output</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const file = e.target.elements.inp.files[0]
          if (!file) return
          const formData = new FormData()
          formData.append('file', file)
          const res = await fetch('/api/parse', {
            method: 'POST',
            body: formData,
          })
          const json = await res.json()
          setParsed(json)
        }}
      >
        <input type="file" name="inp" accept=".inp" />
        <button type="submit">Upload</button>
      </form>
      <pre className="output">{output}</pre>
      <MapView data={parsed} />
      <PropertiesPane data={parsed} />
      <ResultsView />
    </div>
  )
}

export default App
