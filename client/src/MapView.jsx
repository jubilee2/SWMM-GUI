import { useEffect, useRef } from 'react'
import L from 'leaflet'
import proj4 from 'proj4'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

const EPSG3826 =
  "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
proj4.defs('EPSG:3826', EPSG3826)

function MapView({ coordinates = [] }) {
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([23, 121], 9)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current)
      layerRef.current = L.layerGroup().addTo(mapRef.current)
    }

    layerRef.current.clearLayers()
    const latlngs = []
    coordinates.forEach(([id, x, y]) => {
      try {
        const [lon, lat] = proj4('EPSG:3826', 'EPSG:4326', [x, y])
        if (isFinite(lat) && isFinite(lon)) {
          L.marker([lat, lon]).addTo(layerRef.current)
          latlngs.push([lat, lon])
        } else {
          console.error('Invalid projected coordinates:', lat, lon)
        }
      } catch (error) {
        console.error('Error projecting coordinates:', error)
      }
    })

    if (latlngs.length > 0) {
      try {
        mapRef.current.fitBounds(latlngs)
      } catch (error) {
        console.error('Error fitting bounds:', error)
      }
    } else {
      mapRef.current.setView([23, 121], 9)
    }
  }, [coordinates])

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        layerRef.current = null
      }
    }
  }, [])

  return <div id="map" className="map-container" />
}

export default MapView
