import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { latLngBounds } = vi.hoisted(() => ({ latLngBounds: vi.fn() }));

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
    latLngBounds,
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
  beforeEach(() => {
    vi.clearAllMocks();
    latLngBounds.mockImplementation(() => ({ isValid: () => true }));
  });

  it('creates markers for coordinates and cleans up on unmount', async () => {
    const coords = [{ id: 'foo', x: 250000, y: 0 }];
    const { container, unmount } = render(<MapView coordinates={coords} />);
    expect(container.querySelector('.leaflet-container')).toBeInTheDocument();
    await waitFor(() =>
      expect(proj4).toHaveBeenCalledWith('EPSG:3826', 'EPSG:4326', [250000, 0])
    );
    expect(L.marker).toHaveBeenCalledWith([24, 121], { title: 'foo' });
    unmount();
    expect(mapInstance.remove).toHaveBeenCalled();
  });

  it('fits bounds when coordinates update', async () => {
    const invalidBounds = { isValid: () => false };
    const validBounds = { isValid: () => true };
    latLngBounds
      .mockImplementationOnce(() => invalidBounds)
      .mockImplementationOnce(() => validBounds);

    const { rerender } = render(<MapView coordinates={[]} />);
    rerender(<MapView coordinates={[{ id: 'foo', x: 250000, y: 0 }]} />);

    await waitFor(() =>
      expect(mapInstance.fitBounds).toHaveBeenCalledWith(validBounds)
    );
  });
});
