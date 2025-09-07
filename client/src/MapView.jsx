import { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

function MapView({ coordinates = [] }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapInstance.current = L.map(mapRef.current).setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance.current);
    return () => {
      mapInstance.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    markers.current.forEach((m) => m.remove());
    markers.current = coordinates.map(({ id, x, y }) => {
      const marker = L.marker([y, x]).addTo(mapInstance.current);
      marker.bindPopup(id);
      return marker;
    });
  }, [coordinates]);

  return <div ref={mapRef} className="map-container" />;
}

export default MapView;
