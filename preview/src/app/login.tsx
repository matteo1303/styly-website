import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StylyColors as C } from '@/constants/styly-theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/state/auth-context';

type Mode = 'login' | 'signup';

function humanizeAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login')) return 'Email o password non corretti.';
  if (lower.includes('already registered')) return 'Esiste già un account con questa email.';
  if (lower.includes('password')) return 'La password deve contenere almeno 8 caratteri.';
  return message;
}

export default function LoginScreen() {
  const { configured } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const submit = async () => {
    if (!supabase) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || password.length < 8 || (mode === 'signup' && !name.trim())) {
      setIsError(true);
      setMessage('Inserisci nome, email e una password di almeno 8 caratteri.');
      return;
    }
    setBusy(true);
    setMessage(null);
    setIsError(false);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { display_name: name.trim() },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage('Account creato. Ora puoi accedere con email e password.');
          setMode('login');
        }
      }
    } catch (cause) {
      setIsError(true);
      setMessage(humanizeAuthError(cause instanceof Error ? cause.message : 'Accesso non riuscito.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
          <View style={s.brandRow}><Text style={s.brand}>styly<Text style={s.dot}>.</Text></Text><Text style={s.private}>IL TUO ARMADIO PRIVATO</Text></View>
          <View style={s.hero}>
            <Text style={s.eyebrow}>{mode === 'login' ? 'BENTORNATO' : 'INIZIA DA QUI'}</Text>
            <Text style={s.title}>{mode === 'login' ? 'Il tuo stile,\nsolo tuo.' : 'Crea il tuo\narmadio.'}</Text>
            <Text style={s.copy}>{mode === 'login' ? 'Accedi per ritrovare foto, capi e look del tuo profilo.' : 'Le foto restano private e ogni capo è legato esclusivamente al tuo account.'}</Text>
          </View>

          {!configured ? (
            <View style={s.setup}>
              <Text style={s.setupTitle}>Collegamento backend necessario</Text>
              <Text style={s.setupCopy}>L’interfaccia è pronta, ma manca ancora il progetto Supabase di Styly. Configura URL e chiave pubblicabile nel file .env per attivare account e foto.</Text>
            </View>
          ) : (
            <View style={s.form}>
              {mode === 'signup' && <View style={s.field}><Text style={s.label}>NOME</Text><TextInput value={name} onChangeText={setName} autoComplete="name" placeholder="Come vuoi essere chiamato?" placeholderTextColor="#706E74" style={s.input}/></View>}
              <View style={s.field}><Text style={s.label}>EMAIL</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" placeholder="nome@email.com" placeholderTextColor="#706E74" style={s.input}/></View>
              <View style={s.field}><Text style={s.label}>PASSWORD</Text><TextInput value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Almeno 8 caratteri" placeholderTextColor="#706E74" style={s.input}/></View>
              {message && <Text accessibilityRole="alert" style={[s.message, isError && s.error]}>{message}</Text>}
              <Pressable accessibilityRole="button" disabled={busy} onPress={submit} style={[s.submit, busy && s.disabled]}>{busy ? <ActivityIndicator color={C.white}/> : <Text style={s.submitText}>{mode === 'login' ? 'Accedi al mio armadio' : 'Crea il mio account'}</Text>}</Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null); }} style={s.switch}><Text style={s.switchText}>{mode === 'login' ? 'Non hai un account? ' : 'Hai già un account? '}<Text style={s.switchAccent}>{mode === 'login' ? 'Registrati' : 'Accedi'}</Text></Text></Pressable>
            </View>
          )}
          <Text style={s.foot}>Nessuna foto viene usata per addestrare modelli senza un consenso specifico.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:C.canvas},flex:{flex:1},page:{width:'100%',maxWidth:540,alignSelf:'center',paddingHorizontal:24,paddingTop:18,paddingBottom:36,gap:34},brandRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},brand:{color:C.ink,fontSize:21,fontWeight:'900',letterSpacing:1},dot:{color:C.sage},private:{color:C.muted,fontSize:9,fontWeight:'800',letterSpacing:1.2},hero:{gap:10,marginTop:22},eyebrow:{color:C.sage,fontSize:10,fontWeight:'900',letterSpacing:1.4},title:{color:C.ink,fontSize:46,lineHeight:48,fontWeight:'700',letterSpacing:-2.4},copy:{color:C.muted,fontSize:13,lineHeight:20,maxWidth:420},form:{gap:18},field:{gap:8},label:{color:C.muted,fontSize:9,fontWeight:'900',letterSpacing:1.2},input:{minHeight:50,borderBottomWidth:1,borderBottomColor:'#4A4646',color:C.ink,fontSize:14,paddingHorizontal:0},message:{color:C.sage,fontSize:12,lineHeight:18},error:{color:'#FF8B78'},submit:{minHeight:56,borderRadius:6,backgroundColor:C.sage,paddingHorizontal:17,alignItems:'center',justifyContent:'center'},disabled:{opacity:.6},submitText:{color:C.white,fontSize:13,fontWeight:'900'},switch:{minHeight:44,alignItems:'center',justifyContent:'center'},switchText:{color:C.muted,fontSize:12},switchAccent:{color:C.ink,fontWeight:'800'},setup:{borderTopWidth:1,borderBottomWidth:1,borderColor:C.line,paddingVertical:22,gap:8},setupTitle:{color:C.ink,fontSize:16,fontWeight:'800'},setupCopy:{color:C.muted,fontSize:12,lineHeight:19},foot:{color:'#747177',fontSize:10,lineHeight:16,marginTop:'auto'},
});
