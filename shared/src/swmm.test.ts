import { Node } from './swmm';

test('Node interface', () => {
  const node: Node = { id: '1', name: 'Junction 1' };
  expect(node.name).toBe('Junction 1');
});
