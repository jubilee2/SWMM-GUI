import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function MapView() {
  const mapRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) return
    const map = L.map(mapRef.current).setView([0, 0], 2)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)
  }, [])

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />
}

export default MapView
