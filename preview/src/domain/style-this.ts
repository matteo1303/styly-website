import type { Garment } from './garment.ts';

export function garmentRole(garment: Garment) {
  const value = `${garment.category} ${garment.subcategory ?? ''}`.toLowerCase();
  if (value.includes('pantal') || value.includes('jeans') || value.includes('gonna')) return 'bottom' as const;
  if (value.includes('scarp') || value.includes('sneaker')) return 'shoes' as const;
  if (value.includes('giacc') || value.includes('cappotto') || value.includes('trench')) return 'layer' as const;
  if (value.includes('access') || value.includes('orolog') || value.includes('borsa')) return 'accessory' as const;
  return 'top' as const;
}

function occasionFormality(occasion?: string) {
  const value = occasion?.toLowerCase() ?? '';
  if (value.includes('elegant') || value.includes('cerimon') || value.includes('matrimon')) return 5;
  if (value.includes('cena') || value.includes('lavor') || value.includes('ufficio')) return 4;
  if (value.includes('univers') || value.includes('weekend') || value.includes('casual')) return 2;
  return 3;
}

export function buildVerifiedLooks(owned: Garment[], selectedIds: string[], count = 3, occasion?: string): Garment[][] {
  const usable = owned.filter((item) => item.status === 'available');
  const selected = selectedIds.map(id => usable.find(item => item.id === id)).filter((item): item is Garment => Boolean(item));
  const target = occasionFormality(occasion);
  const available = usable
    .filter(item => !selectedIds.includes(item.id))
    .toSorted((a, b) => Math.abs((a.formality ?? 3) - target) - Math.abs((b.formality ?? 3) - target));
  return Array.from({ length: count }, (_, offset) => {
    const rotated = [...available.slice(offset), ...available.slice(0, offset)];
    const usedRoles = new Set(selected.map(garmentRole));
    const additions: Garment[] = [];
    for (const garment of rotated) {
      const role = garmentRole(garment);
      if (!usedRoles.has(role) && additions.length < 4) { additions.push(garment); usedRoles.add(role); }
    }
    return [...selected, ...additions];
  });
}

export function wardrobeGaps(owned: Garment[]) {
  const roles = new Set(owned.filter((item) => item.status === 'available').map(garmentRole));
  const suggestions: string[] = [];
  if (!roles.has('top')) suggestions.push('una T-shirt o camicia neutra, per esempio bianca');
  if (!roles.has('bottom')) suggestions.push('un pantalone versatile in un colore neutro');
  if (!roles.has('shoes')) suggestions.push('un paio di scarpe adatte ai look che usi più spesso');
  return suggestions;
}
