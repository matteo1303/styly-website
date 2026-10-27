import type { Garment, Outfit } from '@/domain/outfit';

export const garments: Garment[] = [
  { id: 'trousers-blue', name: 'Pantaloni sartoriali', category: 'Pantaloni', color: 'Blu notte', colorHex: '#263B58', emoji: '👖' },
  { id: 'shirt-white', name: 'Camicia Oxford', category: 'Camicia', color: 'Bianco', colorHex: '#EEECE5', emoji: '👔' },
  { id: 'shirt-blue', name: 'Camicia popeline', category: 'Camicia', color: 'Azzurro', colorHex: '#AFC5D5', emoji: '👔' },
  { id: 'knit-cream', name: 'Maglia girocollo', category: 'Maglia', color: 'Crema', colorHex: '#D8CDB8', emoji: '🧶' },
  { id: 'jacket-brown', name: 'Giacca destrutturata', category: 'Giacca', color: 'Tabacco', colorHex: '#765B48', emoji: '🧥' },
  { id: 'shoes-brown', name: 'Derby in pelle', category: 'Scarpe', color: 'Marrone', colorHex: '#5A4032', emoji: '👞' },
  { id: 'sneakers-white', name: 'Sneaker essenziali', category: 'Scarpe', color: 'Bianco', colorHex: '#E9E7E0', emoji: '👟' },
  { id: 'watch-steel', name: 'Orologio acciaio', category: 'Accessorio', color: 'Argento', colorHex: '#A8AAAC', emoji: '⌚' },
];

const byId = (id: string) => garments.find((garment) => garment.id === id)!;
export const anchorGarment = byId('trousers-blue');
export const shirtAlternatives = [byId('shirt-white'), byId('shirt-blue'), byId('knit-cream')];

export const mockOutfits: Outfit[] = [
  { id: 'look-smart', title: 'Smart casual', mood: 'Università · riunione', explanation: 'La camicia chiara alleggerisce il blu, mentre pelle e acciaio mantengono il look ordinato.', items: { bottom: anchorGarment, top: byId('shirt-white'), layer: byId('jacket-brown'), shoes: byId('shoes-brown'), accessory: byId('watch-steel') } },
  { id: 'look-clean', title: 'Essenziale', mood: 'Giornata informale', explanation: 'Toni freddi e sneaker pulite creano un abbinamento semplice, comodo e facile da indossare.', items: { bottom: anchorGarment, top: byId('shirt-blue'), layer: undefined, shoes: byId('sneakers-white'), accessory: byId('watch-steel') } },
  { id: 'look-evening', title: 'Sera rilassata', mood: 'Cena · aperitivo', explanation: 'La maglia crema dà contrasto morbido al pantalone e la derby aggiunge struttura senza irrigidire.', items: { bottom: anchorGarment, top: byId('knit-cream'), layer: byId('jacket-brown'), shoes: byId('shoes-brown'), accessory: byId('watch-steel') } },
];
