import { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

function MapView({ nodes = [], links = [] }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = L.map(containerRef.current).setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapRef.current);
    layerRef.current = L.layerGroup().addTo(mapRef.current);
    return () => {
      mapRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const layer = layerRef.current;
    layer.clearLayers();
    nodes.forEach((n) => {
      if (typeof n.x === 'number' && typeof n.y === 'number') {
        L.marker([n.y, n.x]).addTo(layer);
      }
    });
    links.forEach((l) => {
      const from = nodes.find((n) => n.id === l.from);
      const to = nodes.find((n) => n.id === l.to);
      if (from && to && from.x !== undefined && to.x !== undefined) {
        L.polyline(
          [
            [from.y, from.x],
            [to.y, to.x],
          ],
        ).addTo(layer);
      }
    });
  }, [nodes, links]);

  return <div ref={containerRef} className="map-container" />;
}

export default MapView;
