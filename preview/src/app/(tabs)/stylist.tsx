import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StylyColors as C } from '@/constants/styly-theme';

const occasions = ['Università', 'Lavoro', 'Cena', 'Weekend'];
export default function StylistScreen() {
  const [selected, setSelected] = useState('Università');
  const [request, setRequest] = useState('');
  return <SafeAreaView style={s.safe} edges={['top']}><ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
    <View style={s.top}><Pressable onPress={() => router.back()}><Text style={s.back}>← Indietro</Text></Pressable><Text style={s.demo}>Stylist personale</Text></View>
    <Text style={s.spark}>✳</Text><Text style={s.title}>Dove ti porta{ '\n' }la giornata?</Text><Text style={s.copy}>Scegli l’occasione e aggiungi un dettaglio. Cercheremo nel tuo armadio.</Text>
    <Text style={s.label}>L’OCCASIONE</Text><View style={s.chips}>{occasions.map((item) => <Pressable key={item} onPress={() => setSelected(item)} style={[s.chip, selected === item && s.chipOn]}><Text style={[s.chipText, selected === item && s.chipTextOn]}>{item}</Text></Pressable>)}</View>
    <Text style={s.label}>UN’INDICAZIONE IN PIÙ <Text style={s.optional}>FACOLTATIVO</Text></Text><TextInput value={request} onChangeText={setRequest} multiline placeholder="Es. Vorrei usare i pantaloni blu e stare comodo…" placeholderTextColor="#989B91" style={s.input} />
    <View style={s.note}><Text style={s.noteIcon}>✦</Text><Text style={s.noteText}>Per questa demo riceverai tre idee di outfit dimostrative basate sul tuo armadio.</Text></View>
    <Pressable style={s.button} onPress={() => router.push('/style-this')}><Text style={s.buttonText}>Crea tre proposte  ↗</Text></Pressable>
  </ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({ safe: { flex: 1, minHeight: 0, backgroundColor: C.canvas }, page: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 20, paddingTop: 12, paddingBottom: 118, gap: 14 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }, back: { fontSize: 12, fontWeight: '800', color: C.ink }, demo: { fontSize: 10, fontWeight: '900', letterSpacing: 1, color: C.muted }, spark: { fontSize: 28, color: C.sage }, title: { fontFamily: 'Space Grotesk', fontSize: 36, fontWeight: '700', letterSpacing: -1.4, lineHeight: 39, color: C.ink }, copy: { color: C.muted, fontSize: 13, lineHeight: 20, maxWidth: 400, marginBottom: 17 }, label: { color: C.ink, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 5 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }, chip: { borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 99 }, chipOn: { backgroundColor: C.sage, borderColor: C.sage }, chipText: { color: C.muted, fontSize: 11, fontWeight: '800' }, chipTextOn: { color: C.white }, optional: { color: C.muted, fontSize: 10 }, input: { minHeight: 120, borderWidth: 1, borderColor: C.line, borderRadius: 17, backgroundColor: C.surface, color: C.ink, fontSize: 13, lineHeight: 20, padding: 15, textAlignVertical: 'top' }, note: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: C.sageSoft, borderWidth: 1, borderColor: '#5A2717', borderRadius: 15, padding: 13, marginTop: 7 }, noteIcon: { color: C.sage, fontSize: 16 }, noteText: { flex: 1, color: C.muted, fontSize: 11, lineHeight: 16 }, button: { minHeight: 53, backgroundColor: C.sage, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 6 }, buttonText: { color: C.white, fontSize: 13, fontWeight: '900' } });
