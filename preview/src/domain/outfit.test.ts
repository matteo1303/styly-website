import assert from 'node:assert/strict';
import test from 'node:test';

import { outfitUsesOnlyOwnedGarments, replaceGarment, type Garment, type Outfit } from './outfit.ts';

const trousers: Garment = { id: 'trousers-blue', name: 'Pantaloni blu', category: 'Pantaloni', color: 'Blu', colorHex: '#263B58', emoji: '👖' };
const shirt: Garment = { id: 'shirt-white', name: 'Camicia bianca', category: 'Camicia', color: 'Bianco', colorHex: '#EEECE5', emoji: '👔' };
const knit: Garment = { id: 'knit-cream', name: 'Maglia crema', category: 'Maglia', color: 'Crema', colorHex: '#D8CDB8', emoji: '🧶' };
const outfit: Outfit = { id: 'look-1', title: 'Smart casual', mood: 'Pulito', explanation: 'Test', items: { bottom: trousers, top: shirt, layer: undefined, shoes: undefined, accessory: undefined } };

test('swap preserves the anchor garment', () => {
  const updated = replaceGarment(outfit, 'top', knit, trousers.id);
  assert.equal(updated.items.bottom?.id, trousers.id);
  assert.equal(updated.items.top?.id, knit.id);
});

test('the anchor garment cannot be swapped', () => {
  assert.throws(() => replaceGarment(outfit, 'bottom', knit, trousers.id));
});

test('unowned garments are rejected', () => {
  assert.equal(outfitUsesOnlyOwnedGarments(outfit, new Set([trousers.id, shirt.id])), true);
  assert.equal(outfitUsesOnlyOwnedGarments(outfit, new Set([trousers.id])), false);
});
