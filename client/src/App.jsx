import { useState, useEffect } from 'react'
import './App.css'
import MapView from './MapView'
import ResultsView from './ResultsView'

function App() {
  const [output, setOutput] = useState('Loading...')
  const [model, setModel] = useState(null)

  useEffect(() => {
    fetch('/api/output')
      .then((res) => res.text())
      .then((text) => setOutput(text))
      .catch((err) => setOutput(`Error: ${err.message}`))
  }, [])

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    fetch('/api/parse', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((json) => setModel(json))
      .catch((err) => console.error(err))
  }

  const updateNode = (index, field, value) => {
    setModel((prev) => {
      const nodes = [...prev.nodes]
      nodes[index] = { ...nodes[index], [field]: value }
      return { ...prev, nodes }
    })
  }

  return (
    <div>
      <h1>SWMM Output</h1>
      <pre className="output">{output}</pre>
      <input type="file" accept=".inp" onChange={handleFile} />
      <MapView nodes={model?.nodes || []} links={model?.links || []} />
      {model && (
        <div>
          <h2>Edit Nodes</h2>
          {model.nodes.map((n, i) => (
            <div key={n.id}>
              <input
                value={n.id}
                onChange={(e) => updateNode(i, 'id', e.target.value)}
              />
              <input
                type="number"
                value={n.x ?? ''}
                placeholder="x"
                onChange={(e) => updateNode(i, 'x', parseFloat(e.target.value))}
              />
              <input
                type="number"
                value={n.y ?? ''}
                placeholder="y"
                onChange={(e) => updateNode(i, 'y', parseFloat(e.target.value))}
              />
            </div>
          ))}
        </div>
      )}
      <ResultsView />
    </div>
  )
}

export default App
