import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const mapInstance = {
  setView: vi.fn().mockReturnThis(),
  fitBounds: vi.fn().mockReturnThis(),
  remove: vi.fn(),
};
const tileLayerInstance = { addTo: vi.fn() };
const markerInstance = { addTo: vi.fn().mockReturnThis() };
const layerGroupInstance = { addTo: vi.fn().mockReturnThis(), clearLayers: vi.fn() };

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn((id) => {
      const el = typeof id === 'string' ? document.getElementById(id) : id;
      if (el) el.classList.add('leaflet-container');
      return mapInstance;
    }),
    tileLayer: vi.fn(() => tileLayerInstance),
    marker: vi.fn(() => markerInstance),
    layerGroup: vi.fn(() => layerGroupInstance),
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
  it('creates markers for coordinates and cleans up on unmount', async () => {
    const coords = [['foo', 250000, 0]];
    const { container, unmount } = render(<MapView coordinates={coords} />);
    expect(container.querySelector('.leaflet-container')).toBeInTheDocument();
    await waitFor(() =>
      expect(proj4).toHaveBeenCalledWith('EPSG:3826', 'EPSG:4326', [250000, 0])
    );
    expect(L.marker).toHaveBeenCalledWith([24, 121], {'title': 'foo'});
    unmount();
    expect(mapInstance.remove).toHaveBeenCalled();
  });
});
