import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { TabList, TabSlot, Tabs, TabTrigger, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { StylyColors } from '@/constants/styly-theme';
import { StylyIcon, type StylyIconName } from '@/components/styly-icon';

type IconName = Exclude<StylyIconName, 'camera'>;
const webTabs = [
  ['home', '/', 'home', 'Oggi'], ['wardrobe', '/wardrobe', 'wardrobe', 'Armadio'], ['add', '/add', 'style', 'Styly'], ['laundry', '/laundry', 'laundry', 'Lavaggio'], ['profile', '/profile', 'profile', 'Profilo'],
] as const;
const nativeTabs = [
  ['index', 'Oggi', require('@/assets/images/tabIcons/home.png')], ['wardrobe', 'Armadio', require('@/assets/images/tabIcons/explore.png')], ['add', 'Styly', require('@/assets/images/tabIcons/explore.png')], ['laundry', 'Lavaggio', require('@/assets/images/tabIcons/explore.png')], ['profile', 'Profilo', require('@/assets/images/tabIcons/explore.png')],
] as const;

export default function AppTabs() {
  if (Platform.OS === 'web') return <Tabs><TabSlot style={styles.slot}/><TabList asChild><Nav>{webTabs.map(([name, href, icon, label]) => <TabTrigger key={name} name={name} href={href} asChild><Tab icon={icon}>{label}</Tab></TabTrigger>)}</Nav></TabList></Tabs>;
  return <NativeTabs backgroundColor={StylyColors.surface} indicatorColor={StylyColors.sage} tintColor={StylyColors.sage}>{nativeTabs.map(([name, label, icon]) => <NativeTabs.Trigger key={name} name={name}><NativeTabs.Trigger.Label>{label}</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon src={icon} renderingMode="template"/></NativeTabs.Trigger>)}</NativeTabs>;
}

function Tab({ children, icon, isFocused, ...props }: TabTriggerSlotProps & { icon: IconName }) {
  return <Pressable {...props} accessibilityRole="tab" style={styles.tab}>
    <View style={styles.indicator}>{isFocused ? <View style={styles.indicatorOn}/> : null}</View>
    <View style={styles.iconWrap}><StylyIcon name={icon} active={isFocused} color={isFocused ? StylyColors.sage : '#77757B'} size={22}/></View>
    <Text style={[styles.label, isFocused && styles.labelOn]}>{children}</Text>
  </Pressable>;
}
function Nav(props: TabListProps) { return <View {...props} style={styles.nav}><View style={styles.inner}>{props.children}</View></View>; }

const styles = StyleSheet.create({
  slot: { flex: 1, minHeight: 0 },
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', backgroundColor: 'rgba(9,9,9,.96)', borderTopWidth: 1, borderTopColor: '#282526' },
  inner: { width: '100%', maxWidth: 700, minHeight: 76, flexDirection: 'row', alignItems: 'stretch', paddingHorizontal: 10, paddingBottom: 4 },
  tab: { flex: 1, minHeight: 72, alignItems: 'center', justifyContent: 'center', gap: 3 },
  indicator: { position: 'absolute', top: 0, left: '26%', right: '26%', height: 2 },
  indicatorOn: { height: 2, backgroundColor: StylyColors.sage },
  iconWrap: { width: 34, height: 30, alignItems: 'center', justifyContent: 'center' },
  label: { color: '#77757B', fontSize: 10.5, lineHeight: 15, fontWeight: '600', letterSpacing: -0.15 },
  labelOn: { color: StylyColors.ink, fontWeight: '700' },
});
