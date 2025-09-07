import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const mapInstance = { remove: vi.fn() };

vi.mock('proj4leaflet', () => ({}));

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn((el) => {
      const element = typeof el === 'string' ? document.getElementById(el) : el;
      if (element) element.classList.add('leaflet-container');
      return mapInstance;
    }),
    Proj: { CRS: vi.fn() },
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
