import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StylyColors as C } from '@/constants/styly-theme';
import type { Garment } from '@/domain/garment';
import { useOutfits } from '@/state/outfits-context';
import { useWardrobe } from '@/state/wardrobe-context';

export default function WardrobeScreen() {
  const { garments, loading, error, refresh, editGarment, removeGarment } = useWardrobe();
  const { refresh: refreshOutfits } = useOutfits();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tutti');
  const [editing, setEditing] = useState<Garment | null>(null);
  const [editColor, setEditColor] = useState('');
  const [editName, setEditName] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Garment | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const categories = useMemo(() => ['Tutti', ...Array.from(new Set(garments.map(item => item.category)))], [garments]);
  const shown = useMemo(() => garments.filter(item => (category === 'Tutti' || item.category === category) && `${item.category} ${item.subcategory ?? ''} ${item.primaryColor}`.toLowerCase().includes(query.trim().toLowerCase())), [category, garments, query]);
  const openEditor = (garment: Garment) => { setEditing(garment); setPendingDelete(null); setActionError(null); setEditColor(garment.primaryColor); setEditName(garment.subcategory ?? ''); };
  const saveEdit = async () => {
    if (!editing || !editColor.trim()) return;
    setBusy(true); setActionError(null);
    try {
      await editGarment(editing.id, { primaryColor: editColor, subcategory: editName });
      setEditing(null);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Modifica non riuscita.');
    } finally {
      setBusy(false);
    }
  };
  const performDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true); setActionError(null);
    try {
      await removeGarment(pendingDelete);
      await refreshOutfits();
      setEditing(null);
      setPendingDelete(null);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Eliminazione non riuscita.');
    } finally {
      setBusy(false);
    }
  };

  return <SafeAreaView style={s.safe} edges={['top']}><ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
    <View style={s.head}><View><Text style={s.context}>La tua collezione reale</Text><Text style={s.title}>Il guardaroba</Text></View><Pressable accessibilityLabel="Aggiungi un capo" onPress={() => router.push('/add')} style={s.add}><Text style={s.addText}>Aggiungi</Text></Pressable></View>
    <View style={s.controls}><Text style={s.count}>{garments.length} {garments.length === 1 ? 'capo' : 'capi'}</Text><Pressable onPress={() => void refresh()} style={s.refresh}><Text style={s.refreshText}>Aggiorna</Text></Pressable></View>
    <TextInput value={query} onChangeText={setQuery} placeholder="Cerca per capo, colore o categoria" placeholderTextColor="#77757B" style={s.search}/>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>{categories.map(item => <Pressable key={item} onPress={() => setCategory(item)} style={[s.filter, category === item && s.filterOn]}><Text style={[s.filterText, category === item && s.filterTextOn]}>{item}</Text></Pressable>)}</ScrollView>
    {loading && !garments.length ? <View style={s.state}><ActivityIndicator color={C.sage}/><Text style={s.stateText}>Carico il tuo guardaroba…</Text></View> : error ? <View style={s.state}><Text style={s.error}>{error}</Text><Pressable onPress={() => void refresh()} style={s.retry}><Text style={s.retryText}>Riprova</Text></Pressable></View> : !shown.length ? <View style={s.empty}><Text style={s.emptyTitle}>{garments.length ? 'Nessun risultato' : 'Il tuo armadio parte da una foto.'}</Text><Text style={s.emptyCopy}>{garments.length ? 'Prova un’altra ricerca o categoria.' : 'Aggiungi il primo capo: resterà privato e legato al tuo account.'}</Text>{!garments.length && <Pressable onPress={() => router.push('/add')} style={s.emptyButton}><Text style={s.emptyButtonText}>Aggiungi il primo capo</Text></Pressable>}</View> : <View style={s.grid}>{shown.map(item => <Pressable key={item.id} onPress={() => openEditor(item)} style={s.item}><ImageBackground source={{ uri: item.imageUrl }} style={s.photo} imageStyle={s.photoImage}><Text style={s.badge}>{item.category}</Text><Text style={s.more}>•••</Text></ImageBackground><Text style={s.name}>{item.subcategory || item.category}</Text><Text style={s.meta}>{item.primaryColor}</Text></Pressable>)}</View>}
    {editing && <View style={s.editor}><View style={s.editorHead}><Text style={s.editorTitle}>Modifica il capo</Text><Pressable onPress={() => { setEditing(null); setPendingDelete(null); setActionError(null); }}><Text style={s.close}>Chiudi</Text></Pressable></View><Text style={s.fieldLabel}>NOME / TIPO</Text><TextInput value={editName} onChangeText={setEditName} style={s.editorInput}/><Text style={s.fieldLabel}>COLORE PRINCIPALE</Text><TextInput value={editColor} onChangeText={setEditColor} style={s.editorInput}/>{actionError && <Text style={s.error}>{actionError}</Text>}<View style={s.editorActions}><Pressable disabled={busy} onPress={() => setPendingDelete(editing)} style={s.delete}><Text style={s.deleteText}>Elimina</Text></Pressable><Pressable disabled={busy} onPress={saveEdit} style={s.save}>{busy && !pendingDelete ? <ActivityIndicator color={C.white}/> : <Text style={s.saveText}>Salva</Text>}</Pressable></View>{pendingDelete && <View style={s.confirm}><Text style={s.confirmTitle}>Eliminare “{pendingDelete.subcategory || pendingDelete.category}”?</Text><Text style={s.confirmCopy}>La foto sarà rimossa. Se è il capo principale di un outfit salvato, verrà rimosso anche quell’outfit.</Text><View style={s.confirmActions}><Pressable disabled={busy} onPress={() => setPendingDelete(null)} style={s.cancel}><Text style={s.cancelText}>Annulla</Text></Pressable><Pressable disabled={busy} onPress={() => void performDelete()} style={s.deleteFinal}>{busy ? <ActivityIndicator color={C.white}/> : <Text style={s.deleteFinalText}>Elimina definitivamente</Text>}</Pressable></View></View>}</View>}
    <Text style={s.hint}>Tocca un capo per modificarlo o eliminarlo.</Text>
  </ScrollView></SafeAreaView>;
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:C.canvas},page:{width:'100%',maxWidth:680,alignSelf:'center',paddingHorizontal:20,paddingTop:24,paddingBottom:122,gap:20},head:{minHeight:72,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},context:{color:C.sage,fontWeight:'700',fontSize:12},title:{color:C.ink,fontSize:36,lineHeight:43,fontWeight:'700',letterSpacing:-1.8},add:{minWidth:72,height:44,paddingHorizontal:12,borderRadius:6,backgroundColor:C.sage,alignItems:'center',justifyContent:'center'},addText:{fontSize:10.5,fontWeight:'900',color:C.white},controls:{minHeight:38,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:C.line,paddingBottom:12},count:{fontSize:12,fontWeight:'700',color:C.ink},refresh:{minHeight:44,justifyContent:'center'},refreshText:{color:C.sage,fontSize:11,fontWeight:'800'},search:{height:48,borderBottomWidth:1,borderBottomColor:'#4A4546',fontSize:13,color:C.ink},filters:{gap:18,paddingVertical:4},filter:{paddingVertical:8,borderBottomWidth:1,borderBottomColor:'transparent'},filterOn:{borderBottomColor:C.sage},filterText:{fontSize:11.5,color:C.muted,fontWeight:'600'},filterTextOn:{color:C.ink},grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:25},item:{width:'48.4%'},photo:{height:225,overflow:'hidden',justifyContent:'space-between',alignItems:'flex-start',padding:10,backgroundColor:C.surface},photoImage:{borderRadius:6},badge:{backgroundColor:'rgba(9,9,9,.78)',paddingHorizontal:9,paddingVertical:6,borderRadius:3,color:C.ink,fontSize:9,fontWeight:'800'},more:{alignSelf:'flex-end',color:C.white,fontSize:13,letterSpacing:1},name:{fontSize:13,fontWeight:'700',color:C.ink,marginTop:9},meta:{fontSize:10.5,color:C.muted,marginTop:4},state:{minHeight:220,alignItems:'center',justifyContent:'center',gap:12},stateText:{color:C.muted,fontSize:12},error:{color:'#FF8B78',fontSize:12},retry:{minHeight:44,paddingHorizontal:20,justifyContent:'center'},retryText:{color:C.sage,fontWeight:'800'},empty:{minHeight:245,borderTopWidth:1,borderBottomWidth:1,borderColor:C.line,justifyContent:'center',alignItems:'flex-start',gap:9},emptyTitle:{color:C.ink,fontSize:20,fontWeight:'800'},emptyCopy:{color:C.muted,fontSize:12,lineHeight:19,maxWidth:410},emptyButton:{marginTop:10,minHeight:46,paddingHorizontal:16,borderRadius:5,backgroundColor:C.sage,justifyContent:'center'},emptyButtonText:{color:C.white,fontSize:12,fontWeight:'800'},editor:{padding:16,backgroundColor:C.surface,borderLeftWidth:2,borderLeftColor:C.sage,gap:10},editorHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},editorTitle:{color:C.ink,fontSize:16,fontWeight:'800'},close:{color:C.muted,fontSize:11,fontWeight:'700'},fieldLabel:{color:C.muted,fontSize:9,fontWeight:'900',letterSpacing:1},editorInput:{height:44,borderBottomWidth:1,borderBottomColor:'#4A4646',color:C.ink,fontSize:13},editorActions:{flexDirection:'row',gap:10,marginTop:6},delete:{minHeight:46,paddingHorizontal:16,borderWidth:1,borderColor:'#6B3830',borderRadius:5,alignItems:'center',justifyContent:'center'},deleteText:{color:'#FF8B78',fontSize:11,fontWeight:'800'},save:{flex:1,minHeight:46,borderRadius:5,backgroundColor:C.sage,alignItems:'center',justifyContent:'center'},saveText:{color:C.white,fontSize:12,fontWeight:'900'},hint:{color:'#747177',fontSize:10.5,lineHeight:16},confirm:{marginTop:6,padding:14,borderRadius:7,borderWidth:1,borderColor:'#6B3830',backgroundColor:'#1B1110',gap:8},confirmTitle:{color:C.ink,fontSize:13,fontWeight:'900'},confirmCopy:{color:C.muted,fontSize:10.5,lineHeight:16},confirmActions:{flexDirection:'row',gap:8,marginTop:4},cancel:{minHeight:44,paddingHorizontal:14,alignItems:'center',justifyContent:'center'},cancelText:{color:C.muted,fontSize:11,fontWeight:'800'},deleteFinal:{flex:1,minHeight:44,borderRadius:5,backgroundColor:'#8B3528',alignItems:'center',justifyContent:'center'},deleteFinalText:{color:C.white,fontSize:10.5,fontWeight:'900'},
});
