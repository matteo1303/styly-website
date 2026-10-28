import assert from 'node:assert/strict';
import test from 'node:test';
import type { Garment } from './garment.ts';
import { buildVerifiedLooks, wardrobeGaps } from './style-this.ts';

const garment = (id: string, category: string): Garment => ({ id, category, userId: 'user-1', subcategory: null, primaryColor: 'nero', colors: ['nero'], pattern: null, material: null, formality: null, seasons: [], imagePath: `${id}.jpg`, imageUrl: `https://example.test/${id}`, status: 'available', createdAt: '2026-10-28T00:00:00Z' });

test('verified looks preserve selected anchors and only use owned garments', () => {
  const owned = [garment('anchor', 'Pantaloni'), garment('top', 'Top'), garment('shoes', 'Scarpe'), garment('layer', 'Giacche')];
  const looks = buildVerifiedLooks(owned, ['anchor']);
  const ownedIds = new Set(owned.map(item => item.id));
  assert.equal(looks.length, 3);
  for (const look of looks) {
    assert.ok(look.some(item => item.id === 'anchor'));
    assert.ok(look.every(item => ownedIds.has(item.id)));
  }
});

test('unknown selected identifiers are never materialized', () => {
  const owned = [garment('top', 'Top')];
  const looks = buildVerifiedLooks(owned, ['not-owned']);
  assert.ok(looks.every(look => look.every(item => item.id !== 'not-owned')));
});

test('unavailable garments are excluded from generated looks', () => {
  const unavailable = { ...garment('dirty', 'Top'), status: 'unavailable' as const };
  const looks = buildVerifiedLooks([garment('bottom', 'Pantaloni'), unavailable], ['bottom']);
  assert.ok(looks.every((look) => look.every((item) => item.id !== 'dirty')));
});

test('wardrobe gaps are clearly generic and never materialized as owned garments', () => {
  const gaps = wardrobeGaps([garment('bottom', 'Pantaloni')]);
  assert.ok(gaps.some((item) => item.includes('T-shirt')));
  assert.ok(gaps.some((item) => item.includes('scarpe')));
});
