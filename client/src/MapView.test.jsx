import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mapInstance = {
  setView: vi.fn().mockReturnThis(),
  remove: vi.fn(),
};
const tileLayerInstance = { addTo: vi.fn() };
const layerGroupInstance = {
  addTo: vi.fn(() => layerGroupInstance),
  clearLayers: vi.fn(),
};
const markerInstance = { addTo: vi.fn() };
const polylineInstance = { addTo: vi.fn() };

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn((el) => {
      el.classList.add('leaflet-container');
      return mapInstance;
    }),
    tileLayer: vi.fn(() => tileLayerInstance),
    layerGroup: vi.fn(() => layerGroupInstance),
    marker: vi.fn(() => markerInstance),
    polyline: vi.fn(() => polylineInstance),
  },
}));

import MapView from './MapView';

describe('MapView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a map container and cleans up on unmount', () => {
    const { container, unmount } = render(<MapView />);
    expect(container.querySelector('.leaflet-container')).toBeInTheDocument();
    unmount();
    expect(mapInstance.remove).toHaveBeenCalled();
  });

  it('adds markers and polylines for data', () => {
    render(
      <MapView
        nodes={[
          { id: 'N1', x: 0, y: 0 },
          { id: 'N2', x: 1, y: 1 },
        ]}
        links={[{ id: 'L1', from: 'N1', to: 'N2' }]}
      />,
    );
    expect(markerInstance.addTo).toHaveBeenCalled();
    expect(polylineInstance.addTo).toHaveBeenCalled();
  });
});
