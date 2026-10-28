import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StylyColors as C } from '@/constants/styly-theme';
import { useAuth } from '@/state/auth-context';
import { useOutfits } from '@/state/outfits-context';
import { useProfile } from '@/state/profile-context';
import { useWardrobe } from '@/state/wardrobe-context';

const styleOptions = ['Casual', 'Smart casual', 'Minimal', 'Streetwear', 'Elegante'];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { garments } = useWardrobe();
  const { outfits } = useOutfits();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [style, setStyle] = useState(profile?.preferences.styles[0] ?? 'Smart casual');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    if (!user || !profile || !name.trim()) return;
    setSaving(true); setMessage(null);
    try {
      await updateProfile(name.trim(), { ...profile.preferences, styles: [style], onboardingCompleted: true });
      setMessage('Profilo aggiornato.');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Profilo non aggiornato.');
    }
    setSaving(false);
  };

  if (loading) return <SafeAreaView style={s.safe}><View style={s.loading}><ActivityIndicator color={C.sage}/></View></SafeAreaView>;

  return <SafeAreaView style={s.safe} edges={['top']}><ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
    <View style={s.header}><Text style={s.context}>Account personale</Text><Text style={s.title}>Il tuo profilo</Text><Text style={s.subtitle}>Qui trovi i dati del tuo account e le preferenze che guideranno i consigli.</Text></View>
    <View style={s.identity}>{profile?.avatarUrl ? <Image source={{ uri: profile.avatarUrl }} style={s.avatarImage}/> : <View style={s.avatar}><Text style={s.initial}>{(name || user?.email || 'S').slice(0, 1).toUpperCase()}</Text></View>}<View style={s.identityCopy}><Text style={s.name}>{name || 'Il tuo profilo'}</Text><Text style={s.mail}>{user?.email}</Text><Text style={s.languages}>{profile?.preferences.languages.join(' · ')}</Text></View></View>
    <View style={s.stats}><View style={s.stat}><Text style={s.number}>{garments.length}</Text><Text style={s.statLabel}>capi reali</Text></View><View style={s.stat}><Text style={s.number}>{new Set(garments.map(item => item.category)).size}</Text><Text style={s.statLabel}>categorie</Text></View><View style={s.stat}><Text style={s.number}>100%</Text><Text style={s.statLabel}>privato</Text></View></View>
    <Pressable accessibilityRole="button" onPress={() => router.push('/outfits')} style={s.outfits}><View><Text style={s.outfitsTitle}>Outfit salvati</Text><Text style={s.outfitsCopy}>{outfits.length} {outfits.length === 1 ? 'combinazione nel tuo archivio' : 'combinazioni nel tuo archivio'}</Text></View><Text style={s.outfitsLink}>Apri</Text></Pressable>
    <View style={s.form}><Text style={s.section}>Dati e preferenze</Text><Text style={s.label}>NOME VISUALIZZATO</Text><TextInput value={name} onChangeText={setName} autoComplete="name" style={s.input}/><Text style={s.label}>STILE PRINCIPALE</Text><View style={s.chips}>{styleOptions.map(item => <Pressable key={item} onPress={() => setStyle(item)} style={[s.chip, style === item && s.chipOn]}><Text style={[s.chipText, style === item && s.chipTextOn]}>{item}</Text></Pressable>)}</View>{message && <Text style={s.message}>{message}</Text>}<Pressable disabled={saving} onPress={save} style={s.save}>{saving ? <ActivityIndicator color={C.white}/> : <Text style={s.saveText}>Salva modifiche</Text>}</Pressable></View>
    <View style={s.privacy}><Text style={s.privacyTitle}>Le tue foto restano tue.</Text><Text style={s.privacyCopy}>Il database e lo spazio immagini applicano regole per utente: un account non può leggere o modificare i capi di un altro.</Text></View>
    <Pressable onPress={() => void signOut()} style={s.signOut}><Text style={s.signOutText}>Esci dall’account</Text></Pressable>
  </ScrollView></SafeAreaView>;
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:C.canvas},loading:{flex:1,alignItems:'center',justifyContent:'center'},page:{width:'100%',maxWidth:680,alignSelf:'center',paddingHorizontal:20,paddingTop:24,paddingBottom:122,gap:22},header:{gap:7},context:{color:C.sage,fontSize:12,fontWeight:'700'},title:{fontSize:36,lineHeight:42,fontWeight:'700',letterSpacing:-1.7,color:C.ink},subtitle:{fontSize:13,lineHeight:20,color:C.muted,maxWidth:440},identity:{flexDirection:'row',alignItems:'center',gap:13,paddingVertical:17,borderTopWidth:1,borderBottomWidth:1,borderColor:C.line},avatar:{width:48,height:48,borderRadius:24,backgroundColor:C.sage,alignItems:'center',justifyContent:'center'},avatarImage:{width:48,height:48,borderRadius:24,backgroundColor:C.surface},initial:{fontSize:19,fontWeight:'800',color:C.white},identityCopy:{flex:1},name:{color:C.ink,fontSize:15,fontWeight:'700'},mail:{color:C.muted,fontSize:11,marginTop:3},languages:{color:C.sage,fontSize:9.5,marginTop:5},stats:{flexDirection:'row',paddingVertical:18,borderBottomWidth:1,borderBottomColor:C.line},stat:{flex:1},number:{color:C.ink,fontSize:24,fontWeight:'700'},statLabel:{color:C.muted,fontSize:10.5,marginTop:3},form:{gap:14},section:{color:C.ink,fontSize:18,fontWeight:'700'},label:{color:C.muted,fontSize:9,fontWeight:'900',letterSpacing:1.1},input:{minHeight:46,borderBottomWidth:1,borderBottomColor:'#4A4646',color:C.ink,fontSize:13},chips:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{minHeight:40,paddingHorizontal:12,borderRadius:4,borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center'},chipOn:{backgroundColor:C.sage,borderColor:C.sage},chipText:{fontSize:10.5,color:C.muted,fontWeight:'700'},chipTextOn:{color:C.white},message:{color:C.sage,fontSize:11},save:{minHeight:48,borderRadius:5,backgroundColor:C.sage,alignItems:'center',justifyContent:'center'},saveText:{color:C.white,fontSize:12,fontWeight:'900'},privacy:{paddingVertical:17,borderTopWidth:1,borderBottomWidth:1,borderColor:C.line,gap:5},privacyTitle:{color:C.ink,fontSize:13,fontWeight:'800'},privacyCopy:{color:C.muted,fontSize:11,lineHeight:17},signOut:{minHeight:48,borderWidth:1,borderColor:'#60342C',borderRadius:5,alignItems:'center',justifyContent:'center'},signOutText:{color:'#FF8B78',fontSize:12,fontWeight:'800'},outfits:{minHeight:68,flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:15,borderRadius:7,backgroundColor:C.surface,borderWidth:1,borderColor:C.line},outfitsTitle:{color:C.ink,fontSize:13,fontWeight:'900'},outfitsCopy:{color:C.muted,fontSize:10.5,marginTop:4},outfitsLink:{color:C.sage,fontSize:10.5,fontWeight:'900'},
});
