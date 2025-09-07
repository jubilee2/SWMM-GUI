import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import proj4 from 'proj4';
import 'proj4leaflet';
import './MapView.css';

function MapView() {
  useEffect(() => {
    window.proj4 = proj4;
    const twd97 = new L.Proj.CRS(
      'EPSG:3826',
      '+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
    );

    const map = L.map('map', {
      crs: twd97,
      center: [23.5, 121],
      zoom: 7,
    });

    return () => {
      map.remove();
    };
  }, []);

  return <div id="map" className="map-container" />;
}

export default MapView;
