import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type PressableProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StylyColors, StylyFonts, StylyRadii, StylySpacing } from '@/constants/styly-theme';

export function Screen({ children, contentStyle }: PropsWithChildren<{ contentStyle?: ViewStyle }>) {
  return <SafeAreaView style={styles.safeArea} edges={['top']}><ScrollView contentContainerStyle={[styles.screen, contentStyle]} showsVerticalScrollIndicator={false}>{children}</ScrollView></SafeAreaView>;
}
export function Eyebrow({ children }: PropsWithChildren) { return <Text style={styles.eyebrow}>{children}</Text>; }
export function Title({ children }: PropsWithChildren) { return <Text style={styles.title}>{children}</Text>; }
export function Body({ children, muted = false }: PropsWithChildren<{ muted?: boolean }>) { return <Text style={[styles.body, muted && styles.muted]}>{children}</Text>; }
export function DemoPill() { return <View style={styles.demoPill}><Text style={styles.demoText}>DATI DEMO</Text></View>; }
export function SectionHeader({ title, action }: { title: string; action?: string }) { return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{action ? <Text style={styles.sectionAction}>{action}</Text> : null}</View>; }
export function PrimaryButton({ label, icon, ...props }: PressableProps & { label: string; icon?: string }) { return <Pressable accessibilityRole="button" {...props} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>{icon ? `${icon}  ` : ''}{label}</Text></Pressable>; }
export function SecondaryButton({ label, ...props }: PressableProps & { label: string }) { return <Pressable accessibilityRole="button" {...props} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>{label}</Text></Pressable>; }
export function ActionCard({ title, copy, icon, accent, onPress }: { title: string; copy: string; icon: string; accent?: boolean; onPress?: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.actionCard, accent && styles.actionCardAccent, pressed && styles.pressed]}><Text style={styles.actionIcon}>{icon}</Text><View style={styles.actionCopy}><Text style={[styles.actionTitle, accent && styles.actionTitleAccent]}>{title}</Text><Text style={[styles.actionDescription, accent && styles.actionDescriptionAccent]}>{copy}</Text></View><Text style={[styles.arrow, accent && styles.actionTitleAccent]}>→</Text></Pressable>; }
export function Stat({ value, label }: { value: string; label: string }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) { return <View style={[styles.card, style]}>{children}</View>; }
export function PageHeader({ eyebrow, title, accessory }: { eyebrow: string; title: string; accessory?: ReactNode }) { return <View style={styles.pageHeader}><View style={styles.pageHeaderCopy}><Eyebrow>{eyebrow}</Eyebrow><Title>{title}</Title></View>{accessory}</View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: StylyColors.canvas },
  screen: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: StylySpacing.xl, paddingTop: StylySpacing.lg, paddingBottom: 120, gap: StylySpacing.xl },
  eyebrow: { color: StylyColors.sage, fontSize: 11, fontWeight: '800', letterSpacing: 1.7 },
  title: { color: StylyColors.ink, fontFamily: StylyFonts.display, fontSize: 36, lineHeight: 42, fontWeight: '600' },
  body: { color: StylyColors.ink, fontFamily: StylyFonts.body, fontSize: 16, lineHeight: 24 }, muted: { color: StylyColors.muted },
  demoPill: { alignSelf: 'flex-start', backgroundColor: StylyColors.demo, borderRadius: StylyRadii.pill, paddingHorizontal: 10, paddingVertical: 6 }, demoText: { color: '#6C5326', fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }, sectionTitle: { color: StylyColors.ink, fontFamily: StylyFonts.display, fontSize: 22, fontWeight: '600' }, sectionAction: { color: StylyColors.sage, fontSize: 13, fontWeight: '700' },
  primaryButton: { minHeight: 52, borderRadius: StylyRadii.pill, backgroundColor: StylyColors.sage, alignItems: 'center', justifyContent: 'center', paddingHorizontal: StylySpacing.xl }, primaryButtonText: { color: StylyColors.white, fontSize: 15, fontWeight: '800' },
  secondaryButton: { minHeight: 48, borderRadius: StylyRadii.pill, borderWidth: 1, borderColor: StylyColors.line, backgroundColor: StylyColors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: StylySpacing.lg }, secondaryButtonText: { color: StylyColors.ink, fontSize: 14, fontWeight: '800' }, pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  actionCard: { flexDirection: 'row', alignItems: 'center', minHeight: 112, backgroundColor: StylyColors.surface, borderRadius: StylyRadii.lg, borderWidth: 1, borderColor: StylyColors.line, padding: StylySpacing.lg, gap: StylySpacing.lg }, actionCardAccent: { backgroundColor: StylyColors.sage, borderColor: StylyColors.sage }, actionIcon: { fontSize: 30 }, actionCopy: { flex: 1, gap: 5 }, actionTitle: { color: StylyColors.ink, fontFamily: StylyFonts.display, fontSize: 20, fontWeight: '700' }, actionTitleAccent: { color: StylyColors.white }, actionDescription: { color: StylyColors.muted, fontSize: 13, lineHeight: 19 }, actionDescriptionAccent: { color: '#DFE9E4' }, arrow: { color: StylyColors.ink, fontSize: 22 },
  stat: { flex: 1, gap: 3 }, statValue: { color: StylyColors.ink, fontFamily: StylyFonts.display, fontSize: 24, fontWeight: '700' }, statLabel: { color: StylyColors.muted, fontSize: 12 },
  card: { backgroundColor: StylyColors.surface, borderWidth: 1, borderColor: StylyColors.line, borderRadius: StylyRadii.lg, padding: StylySpacing.lg },
  pageHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: StylySpacing.lg }, pageHeaderCopy: { flex: 1, gap: StylySpacing.sm },
});
