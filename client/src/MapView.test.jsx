import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const mapInstance = {
  setView: vi.fn().mockReturnThis(),
  remove: vi.fn(),
};
const tileLayerInstance = { addTo: vi.fn() };
const markerInstance = { addTo: vi.fn().mockReturnThis(), getLatLng: vi.fn(() => ({ lat: 0, lng: 0 })) };

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn((id) => {
      const el = typeof id === 'string' ? document.getElementById(id) : id;
      if (el) el.classList.add('leaflet-container');
      return mapInstance;
    }),
    tileLayer: vi.fn(() => tileLayerInstance),
    marker: vi.fn(() => markerInstance),
  },
}));

vi.mock('proj4', () => {
  const mock = Object.assign(vi.fn(() => [121, 24]), { defs: vi.fn() });
  return { default: mock };
});

import MapView from './MapView';
import L from 'leaflet';
import proj4 from 'proj4';

describe('MapView', () => {
  it('creates markers for coordinates and cleans up on unmount', () => {
    const coords = [[250000, 0]];
    const { container, unmount } = render(<MapView coordinates={coords} />);
    expect(container.querySelector('.leaflet-container')).toBeInTheDocument();
    expect(proj4).toHaveBeenCalledWith('EPSG:3826', 'EPSG:4326', [250000, 0]);
    expect(L.marker).toHaveBeenCalledWith([24, 121]);
    unmount();
    expect(mapInstance.remove).toHaveBeenCalled();
  });
});
