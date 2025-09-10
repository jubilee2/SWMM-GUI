import { useEffect } from 'react';
import L from 'leaflet';
import proj4 from 'proj4';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

const EPSG3826 =
  "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
proj4.defs('EPSG:3826', EPSG3826);

function MapView({ coordinates = [] }) {
  useEffect(() => {
    const map = L.map('map').setView([23, 121], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markers = [];
    coordinates.forEach(([x, y]) => {
      console.log(x,y);
      const [lon, lat] = proj4('EPSG:3826', 'EPSG:4326', [x, y]);
      markers.push(L.marker([lat, lon]).addTo(map));
    });

    if (markers.length > 0) {
      map.setView(markers[0].getLatLng(), 13);
    }

    return () => {
      map.remove();
    };
  }, [coordinates]);

  return <div id="map" className="map-container" />;
}

export default MapView;
