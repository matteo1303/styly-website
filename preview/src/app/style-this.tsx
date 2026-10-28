import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StylyColors as C } from '@/constants/styly-theme';
import type { Garment } from '@/domain/garment';
import { buildVerifiedLooks, garmentRole, wardrobeGaps } from '@/domain/style-this';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/state/auth-context';
import { useOutfits } from '@/state/outfits-context';
import { useWardrobe } from '@/state/wardrobe-context';

export default function StyleThisScreen() {
  const params = useLocalSearchParams<{ mode?: string; occasion?: string; request?: string }>();
  const dressMode = params.mode === 'dress';
  const occasion = typeof params.occasion === 'string' ? params.occasion : '';
  const initialRequest = typeof params.request === 'string' ? params.request : '';
  const { user } = useAuth();
  const { garments, loading } = useWardrobe();
  const { refresh: refreshOutfits } = useOutfits();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [note, setNote] = useState(initialRequest || occasion);
  const [generated, setGenerated] = useState(false);
  const [active, setActive] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selected = useMemo(() => selectedIds.map(id => garments.find(item => item.id === id)).filter((item): item is Garment => Boolean(item)), [garments, selectedIds]);
  const looks = useMemo(() => buildVerifiedLooks(garments, selectedIds, 3, `${occasion} ${note}`), [garments, note, occasion, selectedIds]);
  const gaps = useMemo(() => wardrobeGaps(garments), [garments]);
  const showResults = (generated || dressMode) && !loading && garments.length > 0;

  const toggle = (id: string) => { setGenerated(false); setMessage(null); setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current); };
  const generate = () => {
    if (dressMode || selected.length) {
      setActive(0);
      setGenerated(true);
      setMessage(!dressMode && garments.length === selected.length ? 'Per completare il look aggiungi altri capi al guardaroba.' : null);
    }
  };

  const saveOutfit = async () => {
    if (!supabase || !user || !looks[active]?.length) return;
    const items = looks[active];
    setSaving(true); setMessage(null);
    const { data: outfit, error } = await supabase.from('outfits').insert({ user_id: user.id, mode: dressMode ? 'dress_me' : 'style_this', occasion: `${occasion} ${note}`.trim() || null, title: occasion ? `${occasion} · Look ${active + 1}` : `Look ${active + 1}`, explanation: 'Combinazione costruita esclusivamente con capi verificati e disponibili del tuo guardaroba.', anchor_garment_id: dressMode ? null : selected[0]?.id ?? null }).select('id').single();
    if (error) { setMessage(error.message); setSaving(false); return; }
    const { error: itemsError } = await supabase.from('outfit_items').insert(items.map((item, index) => ({ outfit_id: outfit.id, user_id: user.id, garment_id: item.id, role: garmentRole(item), position: index, locked: selectedIds.includes(item.id) })));
    if (itemsError) { await supabase.from('outfits').delete().eq('id', outfit.id).eq('user_id', user.id); setMessage(itemsError.message); }
    else {
      await refreshOutfits();
      setMessage('Look salvato. Lo trovi in “Outfit salvati”.');
    }
    setSaving(false);
  };

  return <SafeAreaView style={s.safe} edges={['top']}><ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
    <View style={s.top}><Pressable onPress={() => router.back()} style={s.backHit}><Text style={s.back}>Indietro</Text></Pressable><Text style={s.brand}>styly<Text style={s.dot}>.</Text></Text><Text style={s.real}>CAPI REALI</Text></View>
    <View style={s.intro}><Text style={s.kicker}>{dressMode ? 'DRESS ME' : 'STYLE THIS'}</Text><Text style={s.title}>{dressMode ? `Tre idee per ${occasion.toLowerCase() || 'la tua giornata'}` : 'Da cosa vuoi partire?'}</Text><Text style={s.copy}>{dressMode ? 'Le proposte considerano occasione e formalità, usando soltanto capi disponibili del tuo account.' : 'Scegli fino a tre capi. Restano bloccati in tutte le proposte e ogni aggiunta proviene dal tuo account.'}</Text></View>
    {loading ? <View style={s.state}><ActivityIndicator color={C.sage}/></View> : !garments.length ? <View style={s.empty}><Text style={s.emptyTitle}>Prima aggiungi un capo reale.</Text><Text style={s.emptyCopy}>Style This non inventerà vestiti posseduti. Fotografa il primo capo e torna qui.</Text><Pressable onPress={() => router.replace('/add')} style={s.cta}><Text style={s.ctaText}>Aggiungi una foto</Text></Pressable></View> : <>
      {!dressMode && <><View style={s.sectionHead}><Text style={s.sectionTitle}>Il tuo guardaroba</Text><Text style={s.counter}>{selected.length} / 3 bloccati</Text></View><View style={s.grid}>{garments.filter((item) => item.status === 'available').map(item => { const on = selectedIds.includes(item.id); return <Pressable key={item.id} accessibilityState={{ selected: on }} onPress={() => toggle(item.id)} style={[s.card, on && s.cardOn]}><Image source={{ uri: item.imageUrl }} style={s.image}/><View style={[s.check, on && s.checkOn]}><Text style={s.checkText}>{on ? 'Scelto' : 'Scegli'}</Text></View><Text style={s.name}>{item.subcategory || item.category}</Text><Text style={s.meta}>{item.primaryColor}</Text>{on && <Text style={s.locked}>BLOCCATO</Text>}</Pressable>; })}</View></>}
      <View style={s.note}><Text style={s.label}>{dressMode ? 'RICHIESTA' : 'OCCASIONE O RICHIESTA · FACOLTATIVO'}</Text><TextInput value={note} onChangeText={setNote} placeholder="Es. cena, elegante ma non troppo" placeholderTextColor="#77757B" style={s.input}/></View>
      {!dressMode && <Pressable disabled={!selected.length} onPress={generate} style={[s.generate, !selected.length && s.generateOff]}><View><Text style={s.generateSmall}>LOGICA LOCALE VERIFICATA</Text><Text style={s.generateText}>{selected.length ? 'Crea 3 combinazioni' : 'Seleziona almeno un capo'}</Text></View></Pressable>}
    </>}
    {showResults && <View style={s.results}><Text style={s.resultTitle}>Tre proposte dal tuo armadio.</Text><Text style={s.resultCopy}>L’occasione modifica l’ordine in base alla formalità. È una logica locale verificata, non ancora un modello AI generativo.</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.lookRow}>{looks.map((items, index) => <Pressable key={index} onPress={() => setActive(index)} style={[s.look, active === index && s.lookOn]}><View style={s.lookTop}><Text style={s.lookNumber}>0{index + 1}</Text><Text style={s.lookStatus}>{active === index ? 'SELEZIONATO' : 'SCEGLI'}</Text></View><View style={s.flatLay}>{items.map(item => <View key={item.id} style={s.piece}><Image source={{ uri: item.imageUrl }} style={s.pieceImage}/>{selectedIds.includes(item.id) && <Text style={s.anchorLabel}>PARTENZA</Text>}</View>)}</View><Text style={s.lookLabel}>{items.length} capi verificati</Text></Pressable>)}</ScrollView>{gaps.length > 0 && <View style={s.gaps}><Text style={s.gapsTitle}>Possibili capi mancanti</Text>{gaps.map((item) => <Text key={item} style={s.gapText}>Non possiedi ancora {item}.</Text>)}<Text style={s.gapNotice}>Sono suggerimenti generici, non capi presenti nel tuo armadio né prodotti sponsorizzati.</Text></View>}<Text style={s.explanation}>{dressMode ? 'Ogni proposta usa soltanto capi disponibili del tuo account.' : 'Il capo di partenza resta bloccato; il database rifiuta identificativi che non appartengono al tuo account.'}</Text>{message && <Text style={s.message}>{message}</Text>}<Pressable disabled={saving || !looks[active]?.length} onPress={saveOutfit} style={s.save}>{saving ? <ActivityIndicator color={C.white}/> : <Text style={s.saveText}>Salva questo look</Text>}</Pressable></View>}
  </ScrollView></SafeAreaView>;
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:C.canvas},page:{width:'100%',maxWidth:760,alignSelf:'center',padding:18,paddingTop:12,paddingBottom:122,gap:20},top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},backHit:{minHeight:44,justifyContent:'center'},back:{color:C.muted,fontSize:11,fontWeight:'800'},brand:{color:C.ink,fontSize:16,fontWeight:'900'},dot:{color:C.sage},real:{color:C.sage,fontSize:9,fontWeight:'900',letterSpacing:1},intro:{gap:7},kicker:{color:C.sage,fontSize:10,fontWeight:'900',letterSpacing:1.3},title:{color:C.ink,fontSize:36,lineHeight:39,fontWeight:'700',letterSpacing:-1.6},copy:{color:C.muted,fontSize:12,lineHeight:18,maxWidth:500},state:{minHeight:220,alignItems:'center',justifyContent:'center'},empty:{minHeight:260,borderTopWidth:1,borderBottomWidth:1,borderColor:C.line,justifyContent:'center',gap:9},emptyTitle:{color:C.ink,fontSize:21,fontWeight:'800'},emptyCopy:{color:C.muted,fontSize:12,lineHeight:19,maxWidth:440},cta:{marginTop:9,minHeight:46,alignSelf:'flex-start',paddingHorizontal:16,borderRadius:5,backgroundColor:C.sage,justifyContent:'center'},ctaText:{color:C.white,fontSize:12,fontWeight:'900'},sectionHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},sectionTitle:{color:C.ink,fontSize:18,fontWeight:'800'},counter:{color:C.muted,fontSize:10,fontWeight:'800'},grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:16},card:{width:'31.8%',padding:5,paddingBottom:10,borderWidth:1,borderColor:C.line,borderRadius:10,backgroundColor:C.surface},cardOn:{borderColor:C.sage},image:{width:'100%',height:112,borderRadius:7,backgroundColor:'#222'},check:{position:'absolute',right:8,top:8,minHeight:24,borderRadius:12,paddingHorizontal:7,backgroundColor:'rgba(0,0,0,.72)',alignItems:'center',justifyContent:'center'},checkOn:{backgroundColor:C.sage},checkText:{color:C.white,fontSize:7.5,fontWeight:'900'},name:{color:C.ink,fontSize:10.5,fontWeight:'800',marginTop:8,paddingHorizontal:2},meta:{color:C.muted,fontSize:9.5,marginTop:3,paddingHorizontal:2},locked:{color:C.sage,fontSize:8,fontWeight:'900',letterSpacing:.8,marginTop:6,paddingHorizontal:2},note:{gap:8},label:{color:C.muted,fontSize:9,fontWeight:'900',letterSpacing:1},input:{minHeight:48,borderBottomWidth:1,borderBottomColor:'#4A4646',color:C.ink,fontSize:12},generate:{minHeight:60,borderRadius:7,backgroundColor:C.sage,paddingHorizontal:17,justifyContent:'center'},generateOff:{backgroundColor:'#242424'},generateSmall:{color:'rgba(255,255,255,.7)',fontSize:8,fontWeight:'900',letterSpacing:.8},generateText:{color:C.white,fontSize:13,fontWeight:'900',marginTop:3},results:{gap:13,borderTopWidth:1,borderTopColor:C.line,paddingTop:20},resultTitle:{color:C.ink,fontSize:23,fontWeight:'800'},resultCopy:{color:C.muted,fontSize:11,lineHeight:17},lookRow:{gap:11,paddingRight:18},look:{width:270,padding:10,borderWidth:1,borderColor:C.line,borderRadius:12,backgroundColor:C.surface,gap:9},lookOn:{borderColor:C.sage},lookTop:{flexDirection:'row',justifyContent:'space-between'},lookNumber:{color:C.ink,fontSize:12,fontWeight:'900'},lookStatus:{color:C.sage,fontSize:8,fontWeight:'900',letterSpacing:.8},flatLay:{height:230,flexDirection:'row',flexWrap:'wrap',gap:5,alignContent:'center'},piece:{width:'48%',height:105},pieceImage:{width:'100%',height:'100%',borderRadius:6,backgroundColor:'#222'},anchorLabel:{position:'absolute',right:4,top:4,color:C.white,backgroundColor:'rgba(0,0,0,.72)',paddingHorizontal:4,paddingVertical:3,borderRadius:3,fontSize:6.5,fontWeight:'900'},lookLabel:{color:C.muted,fontSize:10,fontWeight:'700'},explanation:{color:C.muted,fontSize:10.5,lineHeight:16},message:{color:C.sage,fontSize:11,lineHeight:17},save:{minHeight:50,borderRadius:6,backgroundColor:C.sage,alignItems:'center',justifyContent:'center'},saveText:{color:C.white,fontSize:12,fontWeight:'900'},gaps:{padding:13,borderRadius:7,borderWidth:1,borderColor:'#5A2717',backgroundColor:C.sageSoft,gap:5},gapsTitle:{color:C.ink,fontSize:11,fontWeight:'900'},gapText:{color:C.muted,fontSize:10.5,lineHeight:16},gapNotice:{color:'#817C7A',fontSize:9.5,lineHeight:15,marginTop:3},
});
