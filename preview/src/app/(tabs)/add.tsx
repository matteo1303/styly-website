import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StylyColors as C } from '@/constants/styly-theme';
import type { PickedGarmentImage } from '@/domain/garment';
import { useWardrobe } from '@/state/wardrobe-context';

const categories = ['Top', 'Pantaloni', 'Giacche', 'Scarpe', 'Abiti', 'Accessori'];
const formalityOptions = [
  { label: 'Casual', value: 2 },
  { label: 'Versatile', value: 3 },
  { label: 'Elegante', value: 4 },
];

export default function AddScreen() {
  const { addGarment } = useWardrobe();
  const [image, setImage] = useState<PickedGarmentImage | null>(null);
  const [category, setCategory] = useState('Top');
  const [subcategory, setSubcategory] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [pattern, setPattern] = useState('');
  const [formality, setFormality] = useState(3);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const choose = async (camera: boolean) => {
    setMessage(null);
    if (camera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) { setIsError(true); setMessage('Autorizza la fotocamera per scattare una foto del capo.'); return; }
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, quality: .85, base64: true };
    const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled) {
      const asset = result.assets[0];
      setImage({ uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType, fileName: asset.fileName });
    }
  };

  const save = async () => {
    if (!image || !color.trim()) { setIsError(true); setMessage('Aggiungi una foto e indica almeno il colore principale.'); return; }
    setBusy(true); setMessage(null);
    try {
      await addGarment({ category, subcategory, primaryColor: color, material, pattern, formality }, image);
      setImage(null); setSubcategory(''); setColor(''); setMaterial(''); setPattern(''); setIsError(false);
      setMessage('Capo salvato nel tuo guardaroba privato.');
    } catch (cause) { setIsError(true); setMessage(cause instanceof Error ? cause.message : 'Non è stato possibile salvare il capo.'); }
    finally { setBusy(false); }
  };

  return <SafeAreaView style={s.safe} edges={['top']}><ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View style={s.header}><Text style={s.context}>Il tuo capo reale</Text><Text style={s.title}>Aggiungi una foto</Text><Text style={s.subtitle}>Fotografa un capo alla volta. Controlla i dettagli prima di salvarlo: Styly userà solo ciò che confermi.</Text></View>
    {image ? <View style={s.previewWrap}><Image source={{ uri: image.uri }} style={s.preview}/><Pressable onPress={() => setImage(null)} style={s.remove}><Text style={s.removeText}>Rimuovi foto</Text></Pressable></View> : <View style={s.photoActions}><Pressable onPress={() => choose(true)} style={s.photoPrimary}><Text style={s.photoLabel}>FOTO</Text><Text style={s.photoTitle}>Scatta una foto</Text><Text style={s.photoCopy}>Usa uno sfondo semplice e luce naturale.</Text></Pressable><Pressable onPress={() => choose(false)} style={s.photoSecondary}><Text style={s.secondaryText}>Scegli dalla galleria</Text></Pressable></View>}
    <View style={s.form}><Text style={s.section}>Dettagli del capo</Text><Text style={s.helper}>Questi dati sono modificabili: non li trattiamo come verità generate dall’AI.</Text>
      <Text style={s.label}>CATEGORIA</Text><View style={s.chips}>{categories.map(item => <Pressable key={item} onPress={() => setCategory(item)} style={[s.chip, category === item && s.chipOn]}><Text style={[s.chipText, category === item && s.chipTextOn]}>{item}</Text></Pressable>)}</View>
      <Field label="TIPO DI CAPO" value={subcategory} onChangeText={setSubcategory} placeholder="Es. camicia Oxford" />
      <Field label="COLORE PRINCIPALE *" value={color} onChangeText={setColor} placeholder="Es. blu notte" />
      <Field label="MATERIALE" value={material} onChangeText={setMaterial} placeholder="Es. cotone" />
      <Field label="FANTASIA" value={pattern} onChangeText={setPattern} placeholder="Es. tinta unita" />
      <Text style={s.label}>USO PRINCIPALE</Text><View style={s.chips}>{formalityOptions.map(item => <Pressable key={item.value} onPress={() => setFormality(item.value)} style={[s.chip, formality === item.value && s.chipOn]}><Text style={[s.chipText, formality === item.value && s.chipTextOn]}>{item.label}</Text></Pressable>)}</View>
    </View>
    {message && <Text accessibilityRole="alert" style={[s.message, isError && s.error]}>{message}</Text>}
    <Pressable accessibilityRole="button" disabled={busy} onPress={save} style={[s.save, busy && s.disabled]}>{busy ? <ActivityIndicator color={C.white}/> : <Text style={s.saveText}>Salva nel mio guardaroba</Text>}</Pressable>
    <Text style={s.privacy}>La foto viene salvata in uno spazio privato legato al tuo account.</Text>
  </ScrollView></SafeAreaView>;
}

function Field({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) {
  return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#747177" style={s.input}/></View>;
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:C.canvas},page:{width:'100%',maxWidth:680,alignSelf:'center',paddingHorizontal:20,paddingTop:24,paddingBottom:122,gap:22},header:{gap:7},context:{color:C.sage,fontSize:12,fontWeight:'700'},title:{color:C.ink,fontSize:36,lineHeight:42,fontWeight:'700',letterSpacing:-1.7},subtitle:{color:C.muted,fontSize:13,lineHeight:20,maxWidth:480},photoActions:{gap:10},photoPrimary:{minHeight:220,borderWidth:1,borderStyle:'dashed',borderColor:'#534C4A',borderRadius:10,alignItems:'center',justifyContent:'center',padding:24,backgroundColor:'#111'},photoLabel:{color:C.sage,fontSize:11,fontWeight:'900',letterSpacing:1.2},photoTitle:{color:C.ink,fontSize:15,fontWeight:'800',marginTop:8},photoCopy:{color:C.muted,fontSize:11,lineHeight:17,textAlign:'center',marginTop:5},photoSecondary:{minHeight:48,borderWidth:1,borderColor:C.line,borderRadius:6,alignItems:'center',justifyContent:'center'},secondaryText:{color:C.ink,fontSize:12,fontWeight:'800'},previewWrap:{gap:10},preview:{width:'100%',height:330,borderRadius:8,backgroundColor:C.surface},remove:{alignSelf:'flex-end',minHeight:44,justifyContent:'center'},removeText:{color:'#FF8B78',fontSize:11,fontWeight:'800'},form:{gap:15},section:{color:C.ink,fontSize:19,fontWeight:'800'},helper:{color:C.muted,fontSize:11,lineHeight:17,marginTop:-8},field:{gap:7},label:{color:C.muted,fontSize:9,fontWeight:'900',letterSpacing:1.1},input:{minHeight:46,borderBottomWidth:1,borderBottomColor:'#4A4646',color:C.ink,fontSize:13},chips:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{minHeight:40,paddingHorizontal:12,borderWidth:1,borderColor:C.line,borderRadius:4,alignItems:'center',justifyContent:'center'},chipOn:{backgroundColor:C.sage,borderColor:C.sage},chipText:{color:C.muted,fontSize:11,fontWeight:'700'},chipTextOn:{color:C.white},message:{color:C.sage,fontSize:12,lineHeight:18},error:{color:'#FF8B78'},save:{minHeight:56,borderRadius:6,backgroundColor:C.sage,paddingHorizontal:17,alignItems:'center',justifyContent:'center'},saveText:{color:C.white,fontSize:13,fontWeight:'900'},disabled:{opacity:.6},privacy:{color:'#747177',fontSize:10.5,lineHeight:16},
});
