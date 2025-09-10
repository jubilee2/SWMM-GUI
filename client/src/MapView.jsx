import { useEffect } from 'react';
import L from 'leaflet';
import proj4 from 'proj4';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

const EPSG3826 =
  "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
proj4.defs('EPSG:3826', EPSG3826);

function MapView({ coordinates = [[173916.0, 2543866.0]] }) {
  useEffect(() => {
    const map = L.map('map').setView([23, 121], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markers = [];
    let latlngs = []; // Ensure latlngs is defined here

    coordinates.forEach((xy) => {
      try {
        const [lon, lat] = proj4('EPSG:3826', 'EPSG:4326', xy);
        if (isFinite(lat) && isFinite(lon)) {
          const marker = L.marker([lat, lon]).addTo(map);
          markers.push(marker);
          latlngs.push([lat, lon]); // This should now work without error
        } else {
          console.error('Invalid projected coordinates:', lat, lon);
        }
      } catch (error) {
        console.error('Error projecting coordinates:', error);
      }
    });

    if (latlngs.length > 0) {
      try {
        map.fitBounds(latlngs);
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    } else {
      map.setView([23, 121], 9); // Default view
    }

    return () => {
      map.remove();
    };
  }, [coordinates]);

  return <div id="map" className="map-container" />;
}

export default MapView;
