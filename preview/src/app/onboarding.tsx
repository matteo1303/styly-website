import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StylyColors as C } from '@/constants/styly-theme';
import type { PickedGarmentImage } from '@/domain/garment';
import { languageChoices, priorityChoices, styleChoices, type ProfilePreferences } from '@/services/profile';
import { useAuth } from '@/state/auth-context';
import { useProfile } from '@/state/profile-context';

const fits: { value: ProfilePreferences['fit']; label: string }[] = [
  { value: 'aderente', label: 'Aderente' },
  { value: 'regolare', label: 'Regolare' },
  { value: 'oversize', label: 'Oversize' },
  { value: 'misto', label: 'Dipende dal capo' },
];

function toggle(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export default function OnboardingScreen() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile?.displayName ?? '');
  const [styles, setStyles] = useState<string[]>(profile?.preferences.styles ?? []);
  const [priorities, setPriorities] = useState<string[]>(profile?.preferences.priorities ?? []);
  const [fit, setFit] = useState<ProfilePreferences['fit']>(profile?.preferences.fit ?? 'misto');
  const [languages, setLanguages] = useState<string[]>(profile?.preferences.languages ?? ['Italiano']);
  const [image, setImage] = useState<PickedGarmentImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const chooseImage = async () => {
    setMessage(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: .82,
      base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImage({ uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType, fileName: asset.fileName });
    }
  };

  const next = () => {
    setMessage(null);
    if (step === 0 && (!name.trim() || !styles.length)) {
      setMessage('Inserisci il nome e scegli almeno uno stile.');
      return;
    }
    if (step === 1 && !priorities.length) {
      setMessage('Scegli almeno una cosa importante per te.');
      return;
    }
    setStep((current) => Math.min(current + 1, 2));
  };

  const finish = async () => {
    if (!profile || !user || !languages.length) {
      setMessage('Scegli almeno una lingua.');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await updateProfile(name, {
        styles,
        priorities,
        fit,
        languages,
        onboardingCompleted: true,
        avatarPath: profile.preferences.avatarPath,
      }, image);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Non riesco a salvare il profilo.');
    } finally {
      setBusy(false);
    }
  };

  return <SafeAreaView style={s.safe} edges={['top', 'bottom']}><ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View style={s.brandRow}><Text style={s.brand}>styly<Text style={s.dot}>.</Text></Text><Text style={s.step}>PASSAGGIO {step + 1} DI 3</Text></View>
    <View style={s.progress}>{[0, 1, 2].map((item) => <View key={item} style={[s.progressPart, item <= step && s.progressOn]}/>)}</View>

    {step === 0 && <View style={s.section}><Text style={s.kicker}>CONOSCIAMOCI</Text><Text style={s.title}>Come ti piace vestirti?</Text><Text style={s.copy}>Puoi scegliere più risposte. Le useremo per ordinare meglio i look, mai per limitarti.</Text><Text style={s.label}>COME VUOI ESSERE CHIAMATO?</Text><TextInput value={name} onChangeText={setName} placeholder="Il tuo nome" placeholderTextColor="#706E74" style={s.input}/><Text style={s.label}>I TUOI STILI</Text><View style={s.chips}>{styleChoices.map((item) => <Choice key={item} label={item} selected={styles.includes(item)} onPress={() => setStyles((current) => toggle(current, item))}/>)}</View></View>}

    {step === 1 && <View style={s.section}><Text style={s.kicker}>LE TUE PREFERENZE</Text><Text style={s.title}>Cosa conta di più?</Text><Text style={s.copy}>Queste indicazioni aiutano Styly a distinguere un look bello da un look adatto a te.</Text><Text style={s.label}>PRIORITÀ</Text><View style={s.chips}>{priorityChoices.map((item) => <Choice key={item} label={item} selected={priorities.includes(item)} onPress={() => setPriorities((current) => toggle(current, item))}/>)}</View><Text style={s.label}>VESTIBILITÀ PREFERITA</Text><View style={s.chips}>{fits.map((item) => <Choice key={item.value} label={item.label} selected={fit === item.value} onPress={() => setFit(item.value)}/>)}</View></View>}

    {step === 2 && <View style={s.section}><Text style={s.kicker}>ULTIMI DETTAGLI</Text><Text style={s.title}>Lingua e profilo</Text><Text style={s.copy}>Scegli le lingue in cui vuoi usare Styly. La foto profilo è facoltativa e resta privata.</Text><Text style={s.label}>LINGUE</Text><View style={s.chips}>{languageChoices.map((item) => <Choice key={item} label={item} selected={languages.includes(item)} onPress={() => setLanguages((current) => toggle(current, item))}/>)}</View><Text style={s.label}>FOTO PROFILO · FACOLTATIVA</Text><View style={s.photoRow}>{image || profile?.avatarUrl ? <Image source={{ uri: image?.uri ?? profile?.avatarUrl ?? '' }} style={s.avatar}/> : <View style={s.avatarPlaceholder}><Text style={s.avatarInitial}>{(name || user?.email || 'S')[0].toUpperCase()}</Text></View>}<View style={s.photoCopy}><Pressable accessibilityRole="button" onPress={() => void chooseImage()} style={s.photoButton}><Text style={s.photoButtonText}>{image || profile?.avatarUrl ? 'Cambia foto' : 'Scegli una foto'}</Text></Pressable>{image && <Pressable accessibilityRole="button" onPress={() => setImage(null)} style={s.skipPhoto}><Text style={s.skipPhotoText}>Rimuovi la selezione</Text></Pressable>}</View></View></View>}

    {message && <Text accessibilityRole="alert" style={s.message}>{message}</Text>}
    <View style={s.actions}>{step > 0 && <Pressable accessibilityRole="button" disabled={busy} onPress={() => setStep((current) => current - 1)} style={s.back}><Text style={s.backText}>Indietro</Text></Pressable>}<Pressable accessibilityRole="button" disabled={busy} onPress={step < 2 ? next : () => void finish()} style={s.next}>{busy ? <ActivityIndicator color={C.white}/> : <Text style={s.nextText}>{step < 2 ? 'Continua' : 'Completa il profilo'}</Text>}</Pressable></View>
    <Text style={s.privacy}>Potrai cambiare queste preferenze dal profilo. Le foto non vengono condivise con altri utenti.</Text>
  </ScrollView></SafeAreaView>;
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[s.chip, selected && s.chipOn]}><Text style={[s.chipText, selected && s.chipTextOn]}>{label}</Text></Pressable>;
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:C.canvas},page:{width:'100%',maxWidth:620,alignSelf:'center',paddingHorizontal:24,paddingTop:18,paddingBottom:36,gap:24},brandRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},brand:{color:C.ink,fontSize:21,fontWeight:'900',letterSpacing:1},dot:{color:C.sage},step:{color:C.muted,fontSize:9,fontWeight:'900',letterSpacing:1.1},progress:{flexDirection:'row',gap:7},progressPart:{height:3,flex:1,borderRadius:2,backgroundColor:C.line},progressOn:{backgroundColor:C.sage},section:{gap:17,minHeight:410},kicker:{color:C.sage,fontSize:10,fontWeight:'900',letterSpacing:1.3,marginTop:10},title:{color:C.ink,fontSize:38,lineHeight:42,fontWeight:'700',letterSpacing:-1.8},copy:{color:C.muted,fontSize:13,lineHeight:20,maxWidth:470},label:{color:C.muted,fontSize:9,fontWeight:'900',letterSpacing:1.1,marginTop:5},input:{minHeight:50,borderBottomWidth:1,borderBottomColor:'#4A4646',color:C.ink,fontSize:14},chips:{flexDirection:'row',flexWrap:'wrap',gap:9},chip:{minHeight:44,paddingHorizontal:14,borderRadius:6,borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center',backgroundColor:C.surface},chipOn:{backgroundColor:C.sage,borderColor:C.sage},chipText:{color:C.muted,fontSize:11.5,fontWeight:'800'},chipTextOn:{color:C.white},photoRow:{flexDirection:'row',alignItems:'center',gap:15,paddingVertical:8},avatar:{width:88,height:88,borderRadius:44,backgroundColor:C.surface},avatarPlaceholder:{width:88,height:88,borderRadius:44,backgroundColor:C.sage,alignItems:'center',justifyContent:'center'},avatarInitial:{color:C.white,fontSize:28,fontWeight:'900'},photoCopy:{gap:4},photoButton:{minHeight:44,paddingHorizontal:15,borderRadius:5,borderWidth:1,borderColor:C.line,justifyContent:'center'},photoButtonText:{color:C.ink,fontSize:11,fontWeight:'900'},skipPhoto:{minHeight:38,justifyContent:'center'},skipPhotoText:{color:C.muted,fontSize:10.5},message:{color:'#FF8B78',fontSize:11.5,lineHeight:17},actions:{flexDirection:'row',gap:10},back:{minHeight:52,paddingHorizontal:17,borderRadius:6,borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center'},backText:{color:C.ink,fontSize:12,fontWeight:'900'},next:{flex:1,minHeight:52,borderRadius:6,backgroundColor:C.sage,alignItems:'center',justifyContent:'center'},nextText:{color:C.white,fontSize:12,fontWeight:'900'},privacy:{color:'#747177',fontSize:10,lineHeight:16},
});
