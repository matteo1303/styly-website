import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StylyColors as C } from '@/constants/styly-theme';
import type { Garment } from '@/domain/garment';
import { useWardrobe } from '@/state/wardrobe-context';

function garmentName(item: Garment) {
  return item.subcategory || item.category;
}

function garmentDetail(item: Garment) {
  return [item.primaryColor, item.material].filter(Boolean).join(' · ');
}

export default function LaundryScreen() {
  const { garments, loading, setGarmentStatus } = useWardrobe();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const pending = garments.filter((item) => item.status === 'unavailable');
  const available = garments.filter((item) => item.status === 'available');

  const changeStatus = async (item: Garment, status: Garment['status']) => {
    setBusyId(item.id);
    setMessage(null);
    try {
      await setGarmentStatus(item.id, status);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Non riesco ad aggiornare il capo.');
    } finally {
      setBusyId(null);
    }
  };

  return <SafeAreaView style={s.safe} edges={['top']}><ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
    <View style={s.top}><Text style={s.brand}>styly<Text style={s.brandMark}>.</Text></Text><Text style={s.sectionLabel}>Lavaggio</Text></View>
    <Text style={s.eyebrow}>CURA DEL GUARDAROBA</Text><Text style={s.title}>Laundry day.</Text><Text style={s.subtitle}>Tieni d’occhio solo i tuoi capi da lavare e rimettili in rotazione.</Text>
    <View style={s.summary}><View style={s.summaryIcon}><Text style={s.wash}>CURA</Text></View><View style={s.flex}><Text style={s.summaryTitle}>{pending.length ? `${pending.length} ${pending.length === 1 ? 'capo in attesa' : 'capi in attesa'}` : 'Tutto pulito'}</Text><Text style={s.summaryCopy}>{pending.length ? 'Questi capi non verranno usati per creare nuovi look.' : 'Il tuo guardaroba è pronto per nuovi look.'}</Text></View></View>
    {message && <Text style={s.error}>{message}</Text>}
    <View style={s.section}><Text style={s.sectionTitle}>Da lavare</Text><Text style={s.sectionCount}>{pending.length} {pending.length === 1 ? 'capo' : 'capi'}</Text></View>
    {loading && !garments.length ? <View style={s.empty}><ActivityIndicator color={C.sage}/><Text style={s.emptyCopy}>Carico il tuo guardaroba…</Text></View> : pending.length ? pending.map((item) => <View key={item.id} style={s.card}><Image source={{ uri: item.imageUrl }} style={s.thumb}/><View style={s.info}><Text style={s.name}>{garmentName(item)}</Text><Text style={s.detail}>{garmentDetail(item)}</Text><View style={s.status}><View style={s.statusDot}/><Text style={s.statusText}>DA LAVARE</Text></View></View><Pressable accessibilityRole="button" disabled={busyId === item.id} onPress={() => void changeStatus(item, 'available')} style={s.action}>{busyId === item.id ? <ActivityIndicator size="small" color={C.white}/> : <Text style={s.actionText}>Pulito</Text>}</Pressable></View>) : <View style={s.empty}><Text style={s.emptyTitle}>Nessun capo in attesa</Text><Text style={s.emptyCopy}>Quando un tuo capo è da lavare, aggiungilo da qui.</Text></View>}
    <View style={s.section}><Text style={s.sectionTitle}>Nel guardaroba</Text><Text style={s.sectionCount}>{available.length} {available.length === 1 ? 'disponibile' : 'disponibili'}</Text></View>
    {available.length ? available.map((item) => <View key={item.id} style={s.available}><Image source={{ uri: item.imageUrl }} style={s.miniThumb}/><View style={s.flex}><Text style={s.availableName}>{garmentName(item)}</Text><Text style={s.detail}>{garmentDetail(item)}</Text></View><Pressable accessibilityLabel={`Segna ${garmentName(item)} da lavare`} accessibilityRole="button" disabled={busyId === item.id} onPress={() => void changeStatus(item, 'unavailable')} style={s.addHit}>{busyId === item.id ? <ActivityIndicator size="small" color={C.sage}/> : <Text style={s.add}>Da lavare</Text>}</Pressable></View>) : !loading && <Text style={s.noAvailable}>Non ci sono altri capi disponibili.</Text>}
    <Text style={s.foot}>Lo stato di lavaggio viene salvato nel tuo account.</Text>
  </ScrollView></SafeAreaView>;
}

const s = StyleSheet.create({
  safe:{flex:1,minHeight:0,backgroundColor:C.canvas},page:{width:'100%',maxWidth:680,alignSelf:'center',padding:20,paddingTop:12,paddingBottom:118,gap:13},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8},brand:{fontFamily:'Inter',fontWeight:'900',fontSize:16,letterSpacing:1,color:C.ink},brandMark:{color:C.sage},sectionLabel:{fontSize:10,letterSpacing:1.1,fontWeight:'900',color:C.muted},eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1.3,color:C.sage},title:{fontFamily:'Space Grotesk',fontSize:34,fontWeight:'700',letterSpacing:-1.2,color:C.ink},subtitle:{fontSize:12,color:C.muted,marginTop:-9,lineHeight:18},summary:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:C.sageSoft,borderWidth:1,borderColor:'#5A2717',borderRadius:21,padding:15,marginTop:6},summaryIcon:{width:43,height:43,borderRadius:15,backgroundColor:C.surface,alignItems:'center',justifyContent:'center'},wash:{fontSize:8,fontWeight:'900',letterSpacing:.7,color:C.sage},summaryTitle:{color:C.ink,fontWeight:'900',fontSize:14},summaryCopy:{color:C.muted,fontSize:11,marginTop:3,lineHeight:16},flex:{flex:1},section:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:7},sectionTitle:{fontFamily:'Space Grotesk',fontSize:17,fontWeight:'700',color:C.ink},sectionCount:{color:C.muted,fontSize:10,fontWeight:'800',fontVariant:['tabular-nums']},card:{flexDirection:'row',alignItems:'center',gap:11,padding:10,backgroundColor:C.surface,borderRadius:19,borderWidth:1,borderColor:C.line},thumb:{width:57,height:64,borderRadius:15,backgroundColor:'#242424'},info:{flex:1,gap:3},name:{color:C.ink,fontWeight:'900',fontSize:12},detail:{color:C.muted,fontSize:10},status:{flexDirection:'row',alignItems:'center',gap:5,marginTop:3},statusDot:{width:6,height:6,borderRadius:3,backgroundColor:C.sage},statusText:{color:C.sage,fontWeight:'900',fontSize:9,letterSpacing:.8},action:{minWidth:58,minHeight:38,paddingHorizontal:11,borderRadius:12,backgroundColor:C.sage,alignItems:'center',justifyContent:'center'},actionText:{color:C.white,fontSize:10,fontWeight:'900'},empty:{alignItems:'center',justifyContent:'center',gap:5,padding:25,backgroundColor:C.surface,borderRadius:19,borderWidth:1,borderColor:C.line},emptyTitle:{fontWeight:'900',color:C.ink,fontSize:13},emptyCopy:{color:C.muted,fontSize:11},available:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:7},miniThumb:{width:37,height:37,borderRadius:12,backgroundColor:'#242424'},availableName:{color:C.ink,fontSize:11,fontWeight:'800'},addHit:{minWidth:70,minHeight:44,alignItems:'center',justifyContent:'center'},add:{fontSize:10,fontWeight:'900',color:C.sage},foot:{textAlign:'center',fontSize:10,color:C.muted,marginTop:8},error:{color:'#FF8B78',fontSize:11,lineHeight:16},noAvailable:{color:C.muted,fontSize:11,paddingVertical:8},
});
