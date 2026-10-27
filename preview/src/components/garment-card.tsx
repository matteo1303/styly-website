import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StylyColors, StylyRadii, StylySpacing } from '@/constants/styly-theme';
import type { Garment } from '@/domain/outfit';

export function GarmentCard({ garment, compact = false, selected = false, onPress }: { garment: Garment; compact?: boolean; selected?: boolean; onPress?: () => void }) {
  return <Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={[styles.card, compact && styles.compactCard, selected && styles.selected]}><View style={[styles.image, compact && styles.compactImage, { backgroundColor: garment.colorHex }]}><Text style={[styles.emoji, compact && styles.compactEmoji]}>{garment.emoji}</Text></View><View style={styles.copy}><Text numberOfLines={1} style={styles.name}>{garment.name}</Text><Text style={styles.meta}>{garment.color}</Text></View></Pressable>;
}

const styles = StyleSheet.create({
  card: { width: '47.5%', backgroundColor: StylyColors.surface, borderWidth: 1, borderColor: StylyColors.line, borderRadius: StylyRadii.md, overflow: 'hidden' }, compactCard: { width: 116 }, selected: { borderColor: StylyColors.sage, borderWidth: 2 },
  image: { height: 158, alignItems: 'center', justifyContent: 'center' }, compactImage: { height: 92 }, emoji: { fontSize: 58 }, compactEmoji: { fontSize: 38 }, copy: { padding: StylySpacing.md, gap: 3 }, name: { color: StylyColors.ink, fontSize: 13, fontWeight: '800' }, meta: { color: StylyColors.muted, fontSize: 11 },
});
