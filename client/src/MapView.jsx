import { useRef, useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

function MapView({ data }) {
  const mapDivRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return
    const map = L.map(mapDivRef.current).setView([51.505, -0.09], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (layerRef.current) {
      layerRef.current.remove()
    }
    layerRef.current = L.layerGroup().addTo(map)
    if (!data) return
    Object.entries(data.coordinates || {}).forEach(([id, c]) => {
      L.marker([c.y, c.x]).addTo(layerRef.current).bindPopup(id)
    })
    Object.entries(data.vertices || {}).forEach(([id, pts]) => {
      const latlngs = pts.map((p) => [p.y, p.x])
      L.polyline(latlngs, { color: 'blue' })
        .addTo(layerRef.current)
        .bindPopup(id)
    })
  }, [data])

  return <div ref={mapDivRef} className="map-container" />
}

export default MapView
