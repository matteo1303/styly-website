export type GarmentRole = 'top' | 'bottom' | 'layer' | 'shoes' | 'accessory';
export type Garment = { id: string; name: string; category: string; color: string; colorHex: string; emoji: string };
export type Outfit = { id: string; title: string; mood: string; explanation: string; items: Record<GarmentRole, Garment | undefined> };

export function replaceGarment(outfit: Outfit, role: GarmentRole, replacement: Garment, anchorGarmentId: string): Outfit {
  const anchor = Object.values(outfit.items).find((item) => item?.id === anchorGarmentId);
  if (!anchor) throw new Error('Anchor garment is not part of this outfit');
  if (anchor.id === outfit.items[role]?.id) throw new Error('The anchor garment cannot be replaced');
  return { ...outfit, items: { ...outfit.items, [role]: replacement } };
}

export function outfitUsesOnlyOwnedGarments(outfit: Outfit, ownedIds: Set<string>): boolean {
  return Object.values(outfit.items).every((item) => !item || ownedIds.has(item.id));
}
