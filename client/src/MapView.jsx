import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapView() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return; // prevent reinitialization
    const map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    mapRef.current = map;
  }, []);

  return <div id="map" style={{ height: '100vh', width: '100%' }}></div>;
}

export default MapView;
