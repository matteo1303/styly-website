import { router } from 'expo-router';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StylyIcon } from '@/components/styly-icon';
import { StylyColors as C } from '@/constants/styly-theme';
import { useAuth } from '@/state/auth-context';
import { useOutfits } from '@/state/outfits-context';
import { useProfile } from '@/state/profile-context';
import { useWardrobe } from '@/state/wardrobe-context';

const hero = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=88';

export default function HomeScreen() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { garments } = useWardrobe();
  const { outfits } = useOutfits();
  const laundryCount = garments.filter((item) => item.status === 'unavailable').length;
  const displayName = profile?.displayName || (typeof user?.user_metadata.display_name === 'string' ? user.user_metadata.display_name : user?.email ?? 'S');
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'S';
  return <SafeAreaView style={s.safe} edges={['top']}><ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
    <View style={s.top}><Text style={s.wordmark}>styly<Text style={s.dot}>.</Text></Text><Pressable accessibilityLabel="Apri profilo" style={s.avatar} onPress={() => router.push('/profile')}>{profile?.avatarUrl ? <Image source={{ uri: profile.avatarUrl }} style={s.avatarImage}/> : <Text style={s.avatarText}>{initials}</Text>}</Pressable></View>
    <View style={s.intro}><Text style={s.kicker}>Il tuo guardaroba personale</Text><Text style={s.title}>Wear what you own.{ '\n' }Better.</Text><Text style={s.subtitle}>Parti dai capi che vuoi indossare. Styly costruisce il resto con ciò che hai già.</Text></View>
    <ImageBackground source={{ uri: hero }} imageStyle={s.heroImage} style={s.hero}>
      <View style={s.heroShade}/><View style={s.heroTop}><Text style={s.heroLabel}>Styly</Text><Text style={s.heroIndex}>IL TUO ARMADIO</Text></View>
      <View style={s.heroBottom}><Text style={s.heroTitle}>Start with{ '\n' }your pieces.</Text><Text style={s.heroCopy}>Fotografa uno o più capi. Completiamo il look senza sostituire le tue scelte.</Text><Pressable style={s.primary} onPress={() => router.push('/style-this')}><Text style={s.primaryText}>Crea un look</Text></Pressable></View>
    </ImageBackground>
    <View style={s.sectionHead}><Text style={s.sectionTitle}>Da dove vuoi partire?</Text><Text style={s.sectionMeta}>Fino a 3 capi</Text></View>
    <View style={s.entryList}>
      <Pressable accessibilityRole="button" style={[s.entry,s.entryPrimary]} onPress={() => router.push('/style-this?mode=photo')}><View style={s.entryTop}><View style={[s.entryIcon,s.entryIconPrimary]}><StylyIcon name="camera" color={C.white} size={22}/></View><Text style={s.entryBadge}>Scelta rapida</Text></View><Text style={[s.entryTitle,s.entryTitlePrimary]}>Scatta o carica una foto</Text><Text style={[s.entryCopy,s.entryCopyPrimary]}>Inquadra da uno a tre capi che vuoi indossare.</Text><View style={s.entryAction}><Text style={s.entryActionPrimary}>Inizia con una foto</Text></View></Pressable>
      <Pressable accessibilityRole="button" style={s.entry} onPress={() => router.push('/style-this?mode=closet')}><View style={s.entryTop}><View style={s.entryIcon}><StylyIcon name="wardrobe" color={C.sage} size={23}/></View><Text style={s.entryBadgeSecondary}>Dal tuo catalogo</Text></View><Text style={s.entryTitle}>Scegli dall’armadio</Text><Text style={s.entryCopy}>Parti dai capi che hai già salvato in Styly.</Text><View style={s.entryAction}><Text style={s.entryActionSecondary}>Apri il guardaroba</Text></View></Pressable>
    </View>
    <Pressable style={s.occasion} onPress={() => router.push('/stylist')}><View><Text style={s.occasionTitle}>Hai già un’occasione in mente?</Text><Text style={s.occasionCopy}>Descrivila al tuo stylist personale.</Text></View><Text style={s.occasionLink}>Descrivi</Text></Pressable>
    <View style={s.sectionHead}><Text style={s.sectionTitle}>Il tuo armadio</Text><Pressable onPress={() => router.push('/wardrobe')}><Text style={s.link}>Apri</Text></Pressable></View>
    <View style={s.stats}><Pressable accessibilityRole="button" onPress={() => router.push('/wardrobe')} style={s.stat}><Text style={s.statNum}>{garments.length}</Text><Text style={s.statLabel}>{garments.length === 1 ? 'capo' : 'capi'}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.push('/outfits')} style={s.stat}><Text style={s.statNum}>{outfits.length}</Text><Text style={s.statLabel}>look salvati</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.push('/laundry')} style={s.stat}><Text style={s.statNum}>{laundryCount}</Text><Text style={s.statLabel}>da lavare</Text></Pressable></View>
  </ScrollView></SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, minHeight: 0, backgroundColor: C.canvas },
  page: { width: '100%', maxWidth: 700, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 118, gap: 28 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wordmark: { color: C.ink, fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -1.4 }, dot: { color: C.sage },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#393536', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, avatarImage: { width: 38, height: 38 }, avatarText: { color: C.ink, fontSize: 10, fontWeight: '700' },
  intro: { gap: 10, paddingTop: 8 }, kicker: { color: C.sage, fontSize: 12, fontWeight: '700' }, title: { color: C.ink, fontSize: 42, lineHeight: 44, fontWeight: '700', letterSpacing: -2.2 }, subtitle: { color: C.muted, fontSize: 14, lineHeight: 21, maxWidth: 430 },
  hero: { height: 420, overflow: 'hidden', padding: 20, justifyContent: 'space-between', backgroundColor: C.surface }, heroImage: { borderRadius: 10 }, heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5,5,7,.49)', borderRadius: 10 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between' }, heroLabel: { color: C.white, fontSize: 11, fontWeight: '700' }, heroIndex: { color: 'rgba(255,255,255,.78)', fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },
  heroBottom: { gap: 10 }, heroTitle: { color: C.white, fontSize: 40, lineHeight: 40, fontWeight: '700', letterSpacing: -2 }, heroCopy: { color: 'rgba(255,255,255,.82)', fontSize: 12.5, lineHeight: 19, maxWidth: 390 },
  primary: { minHeight: 54, marginTop: 8, paddingHorizontal: 18, borderRadius: 6, backgroundColor: C.sage, alignItems: 'center', justifyContent: 'center' }, primaryText: { color: C.white, fontSize: 13, fontWeight: '800' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }, sectionTitle: { color: C.ink, fontSize: 20, fontWeight: '700', letterSpacing: -.5 }, sectionMeta: { color: C.muted, fontSize: 11, fontWeight: '600' },
  entryList: { gap: 11 }, entry: { minHeight: 150, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#383435', backgroundColor: '#111111' }, entryPrimary: { backgroundColor: C.sage, borderColor: C.sage }, entryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }, entryIcon: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#3E393A', alignItems: 'center', justifyContent: 'center' }, entryIconPrimary: { borderColor: 'rgba(255,255,255,.35)', backgroundColor: 'rgba(0,0,0,.08)' }, entryBadge: { color: 'rgba(255,255,255,.88)', fontSize: 10.5, fontWeight: '700' }, entryBadgeSecondary: { color: C.muted, fontSize: 10.5, fontWeight: '600' }, entryTitle: { color: C.ink, fontSize: 17, fontWeight: '700', letterSpacing: -.25 }, entryTitlePrimary: { color: C.white }, entryCopy: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }, entryCopyPrimary: { color: 'rgba(255,255,255,.82)' }, entryAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#302C2D' }, entryActionPrimary: { color: C.white, fontSize: 11.5, fontWeight: '800' }, entryActionSecondary: { color: C.sage, fontSize: 11.5, fontWeight: '800' },
  occasion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line }, occasionTitle: { color: C.ink, fontSize: 13, fontWeight: '700' }, occasionCopy: { color: C.muted, fontSize: 11, marginTop: 4 }, occasionLink: { color: C.sage, fontSize: 11, fontWeight: '800' },
  link: { color: C.sage, fontSize: 11, fontWeight: '700' }, stats: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line, paddingVertical: 20 }, stat: { flex: 1 }, statNum: { color: C.ink, fontSize: 26, fontWeight: '700', letterSpacing: -1, fontVariant: ['tabular-nums'] }, statLabel: { color: C.muted, fontSize: 10.5, marginTop: 3 },
});
