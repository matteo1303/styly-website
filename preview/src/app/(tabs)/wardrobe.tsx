import { router } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StylyColors as C } from '@/constants/styly-theme';
import { useDemo } from '@/state/demo-context';

const cats = ['Tutti', 'Magliette', 'Top', 'Pantaloni', 'Abiti', 'Giacche', 'Scarpe', 'Orologi', 'Accessori'];
const pieces = [
  {name:'Camicia in lino',color:'Avorio · COS',cat:'Top',wear:12,img:'photo-1598554747436-c9293d6a588f'}, {name:'Jeans dritto',color:'Indigo · Levi’s',cat:'Pantaloni',wear:18,img:'photo-1542272604-787c3835535d'}, {name:'Trench oversize',color:'Sabbia · ARKET',cat:'Giacche',wear:4,img:'photo-1591047139829-d91aecb6caea'}, {name:'Sneaker pulite',color:'Bianco · Veja',cat:'Scarpe',wear:21,img:'photo-1542291026-7eec264c27ff'}, {name:'Maglia morbida',color:'Burro · Uniqlo',cat:'Top',wear:9,img:'photo-1576566588028-4147f3842f27'}, {name:'Borsa mini',color:'Cuoio · vintage',cat:'Accessori',wear:7,img:'photo-1584917865442-de89df76afd3'}, {name:'Abito midi',color:'Nero · & Other Stories',cat:'Abiti',wear:3,img:'photo-1539008835657-9e8e9680c956'}, {name:'Giacca morbida',color:'Carbone · Massimo Dutti',cat:'Giacche',wear:6,img:'photo-1591047139829-d91aecb6caea'}, {name:'T-shirt essenziale',color:'Bianco · Uniqlo',cat:'Magliette',wear:14,img:'photo-1521572163474-6864f9cf17ab'}, {name:'Orologio classico',color:'Acciaio · vintage',cat:'Orologi',wear:5,img:'photo-1523170335258-f5ed11844a49'},
];

export default function WardrobeScreen(){
  const [cat,setCat]=useState('Tutti'); const [query,setQuery]=useState(''); const [mostWorn,setMostWorn]=useState(true); const { wornItemCounts, demoItems }=useDemo();
  const allPieces=[...pieces,...demoItems.map((item)=>({name:item.name,color:'Appena aggiunto',cat:item.category,wear:0,img:'photo-1521572163474-6864f9cf17ab'}))];
  const shown=allPieces.filter(p=>(cat==='Tutti'||p.cat===cat)&&p.name.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>mostWorn?b.wear-a.wear:a.name.localeCompare(b.name));
  return <SafeAreaView style={s.safe} edges={['top']}><ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
    <View style={s.head}><View style={s.headCopy}><Text style={s.context}>La tua collezione</Text><Text style={s.title}>Il guardaroba</Text></View><Pressable accessibilityLabel="Aggiungi un capo" onPress={()=>router.push('/style-this?mode=photo')} style={s.add}><Text style={s.plus}>＋</Text></Pressable></View>
    <View style={s.controls}><Text style={s.count}>{48+demoItems.length} capi</Text><Pressable onPress={()=>setMostWorn(v=>!v)} style={s.sortControl}><Text style={s.sort}>{mostWorn?'Più indossati':'Nome'}</Text><Text style={s.chevron}>⌄</Text></Pressable></View>
    <TextInput value={query} onChangeText={setQuery} placeholder="Cerca per capo, colore o brand" placeholderTextColor="#77757B" style={s.search}/>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>{cats.map(c=><Pressable onPress={()=>setCat(c)} key={c} style={[s.filter,cat===c&&s.filterOn]}><Text style={[s.filterText,cat===c&&s.filterTextOn]}>{c}</Text></Pressable>)}</ScrollView>
    <View style={s.grid}>{shown.map((p,i)=><Pressable key={p.name} style={s.item}><ImageBackground source={{uri:`https://images.unsplash.com/${p.img}?auto=format&fit=crop&w=700&q=80`}} style={s.photo} imageStyle={s.photoImage}><View style={s.wearBadge}><Text style={s.wearText}>{p.wear+(wornItemCounts[p.name]??0)} volte</Text></View><Text style={s.more}>•••</Text></ImageBackground><Text style={s.name}>{p.name}</Text><Text style={s.meta}>{p.color}</Text></Pressable>)}</View>
    <View style={s.insight}><Text style={s.insightIndex}>01</Text><View style={{flex:1}}><Text style={s.insightTitle}>Il capo che scegli più spesso</Text><Text style={s.insightCopy}>Le sneaker bianche guidano la tua rotazione questo mese.</Text></View><Text style={s.insightArrow}>↗</Text></View>
  </ScrollView></SafeAreaView>;
}

const s=StyleSheet.create({
  safe:{flex:1,minHeight:0,backgroundColor:C.canvas},page:{width:'100%',maxWidth:680,alignSelf:'center',paddingHorizontal:20,paddingTop:24,paddingBottom:118,gap:20},
  head:{minHeight:72,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},headCopy:{gap:4},context:{color:C.sage,fontWeight:'700',fontSize:12},title:{color:C.ink,fontSize:36,lineHeight:43,fontWeight:'700',letterSpacing:-1.8},
  add:{width:44,height:44,borderRadius:6,backgroundColor:C.sage,alignItems:'center',justifyContent:'center'},plus:{height:30,lineHeight:28,fontSize:27,color:C.white,fontWeight:'400',textAlign:'center'},
  controls:{minHeight:38,flexDirection:'row',alignItems:'center',borderBottomWidth:1,borderBottomColor:C.line,paddingBottom:12},count:{fontSize:12,fontWeight:'700',color:C.ink,fontVariant:['tabular-nums']},sortControl:{marginLeft:28,flexDirection:'row',alignItems:'center',gap:7,paddingVertical:4},sort:{fontSize:12,color:C.ink,fontWeight:'600'},chevron:{fontSize:16,lineHeight:16,color:C.muted},
  search:{height:48,borderBottomWidth:1,borderBottomColor:'#4A4546',paddingHorizontal:0,fontSize:13,color:C.ink},filters:{gap:18,paddingVertical:4},filter:{paddingVertical:8,borderBottomWidth:1,borderBottomColor:'transparent'},filterOn:{borderBottomColor:C.sage},filterText:{fontSize:11.5,color:C.muted,fontWeight:'600'},filterTextOn:{color:C.ink},
  grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:25},item:{width:'48.4%'},photo:{height:225,overflow:'hidden',justifyContent:'space-between',alignItems:'flex-start',padding:10,backgroundColor:C.surface},photoImage:{borderRadius:6},wearBadge:{backgroundColor:'rgba(9,9,9,.78)',paddingHorizontal:9,paddingVertical:6,borderRadius:3},wearText:{fontSize:9.5,fontWeight:'700',color:C.ink,fontVariant:['tabular-nums']},more:{alignSelf:'flex-end',color:C.white,fontSize:13,letterSpacing:1},name:{fontSize:13,fontWeight:'700',color:C.ink,marginTop:9},meta:{fontSize:10.5,color:C.muted,marginTop:4},
  insight:{marginTop:8,paddingVertical:18,borderTopWidth:1,borderBottomWidth:1,borderColor:C.line,flexDirection:'row',alignItems:'center',gap:13},insightIndex:{fontSize:10,color:C.sage,fontWeight:'700'},insightTitle:{fontSize:13,fontWeight:'700',color:C.ink},insightCopy:{fontSize:11,lineHeight:16,color:C.muted,marginTop:3},insightArrow:{fontSize:17,color:C.sage},
});
