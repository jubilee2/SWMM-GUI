import { useEffect, useState, useRef } from 'react'
import { Chart } from 'chart.js/auto'

function ResultsView() {
  const [results, setResults] = useState(null)
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    fetch('/data/sample-swmm-result.json')
      .then((res) => res.json())
      .then((json) => setResults(json))
      .catch((err) => console.error('Failed to load results', err))
  }, [])

  useEffect(() => {
    if (!results || !canvasRef.current) return

    const node = results.nodes[0]
    const chart = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: results.times,
        datasets: [
          {
            label: `${node.id} Depth`,
            data: node.depth,
            borderColor: 'rgb(75, 192, 192)',
          },
        ],
      },
    })

    chartRef.current = chart
    return () => chart.destroy()
  }, [results])

  if (!results) return <div>Loading results...</div>

  return (
    <div>
      <h2>Sample Results</h2>
      <canvas ref={canvasRef} />
      <table>
        <thead>
          <tr>
            <th>Time</th>
            {results.nodes.map((n) => (
              <th key={n.id}>{n.id} Depth</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.times.map((t, i) => (
            <tr key={t}>
              <td>{t}</td>
              {results.nodes.map((n) => (
                <td key={n.id}>{n.depth[i]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <a href="/data/sample-swmm-result.json" download>Download original file</a>
    </div>
  )
}

export default ResultsView
