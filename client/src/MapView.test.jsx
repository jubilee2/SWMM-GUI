import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const mapInstance = {
  setView: vi.fn().mockReturnThis(),
  remove: vi.fn(),
};
const tileLayerInstance = { addTo: vi.fn() };

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn((el) => {
      el.classList.add('leaflet-container');
      return mapInstance;
    }),
    tileLayer: vi.fn(() => tileLayerInstance),
  },
}));

import MapView from './MapView';

describe('MapView', () => {
  it('creates a map container and cleans up on unmount', () => {
    const { container, unmount } = render(<MapView />);
    expect(container.querySelector('.leaflet-container')).toBeInTheDocument();
    unmount();
    expect(mapInstance.remove).toHaveBeenCalled();
  });
});
