import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, ScrollView, Animated, TextInput, Modal, Alert } from 'react-native';
import MapScreen from '../leaflet'; // Certifique-se que o caminho está correto
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const API_URL = 'http://192.168.1.10:8000/api/hospitais/';

export default function HomeScreen() {
  const mapRef = useRef(null);
  const [busca, setBusca] = useState('');
  const [modo, setModo] = useState('car');
  const [detalhesRota, setDetalhesRota] = useState(null);
  const [unidadeAtiva, setUnidadeAtiva] = useState(null);
  const [hospitais, setHospitais] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const animatedHeight = useRef(new Animated.Value(140)).current;
  const [expandido, setExpandido] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [tempoRelogio, setTempoRelogio] = useState('');

  useEffect(() => { carregarHospitais(); }, []);

  const carregarHospitais = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setHospitais(data);
    } catch (error) { console.log("Erro Aiven:", error); }
  };

  const formatarParaRelogio = (totalMinutos) => {
    if (totalMinutos < 60) return `0:${totalMinutos < 10 ? '0' + totalMinutos : totalMinutos}`;
    const h = Math.floor(totalMinutos / 60);
    const m = totalMinutos % 60;
    return `${h}:${m < 10 ? '0' + m : m}`;
  };

  const converterParaMinutos = (stringRelogio) => {
    if (!stringRelogio.includes(':')) return parseInt(stringRelogio) || 0;
    const [horas, minutos] = stringRelogio.split(':').map(Number);
    return (horas * 60) + (minutos || 0);
  };

  const selecionarUnidade = (h) => {
    setUnidadeAtiva(h);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    mapRef.current.desenharRota(h.lat, h.lng, modo === 'walk' ? 'walking' : 'driving');
  };

  const salvarRelato = async () => {
    if (!unidadeAtiva || !tempoRelogio) return;
    const minutosTotais = converterParaMinutos(tempoRelogio);
    
    let novoStatus = "Verde";
    if (minutosTotais >= 90) novoStatus = "Vermelho";
    else if (minutosTotais >= 60) novoStatus = "Laranja";
    else if (minutosTotais >= 30) novoStatus = "Amarelo";

    try {
      await fetch(`${API_URL}${unidadeAtiva.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutos_espera: minutosTotais, status: novoStatus })
      });
      setModalVisible(false);
      setTempoRelogio('');
      carregarHospitais();
    } catch (e) { Alert.alert("Erro", "Não salvou no banco"); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapScreen ref={mapRef} hospitais={hospitais} userPos={{lat: -15.5989, lng: -56.0949}} onMessage={(msg) => {
        if (msg.tipo === 'CLICK_MARKER') selecionarUnidade(msg.data);
        if (msg.tipo === 'ROTA_INFO') setDetalhesRota({ km: msg.distancia, min: msg.duracao });
      }} />

      <Text style={styles.watermark}>GUERREIROS DOS CÓDIGOS</Text>

      <View style={styles.navbar}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color="#4facfe" style={{marginLeft: 15}} />
          <TextInput placeholder="Buscar unidade em Cuiabá..." placeholderTextColor="#666" style={styles.inputBusca} value={busca} onChangeText={setBusca} />
        </View>

        <Animated.View style={[styles.modosRow, { opacity: fadeAnim }]}>
          {['car', 'moto', 'walk'].map((m) => (
            <TouchableOpacity key={m} onPress={() => {setModo(m); if(unidadeAtiva) selecionarUnidade(unidadeAtiva);}} style={[styles.btnModo, modo === m && styles.btnModoAtivo]}>
              <Ionicons name={m === 'car' ? 'car' : m === 'moto' ? 'bicycle' : 'walk'} size={22} color={modo === m ? '#000' : '#fff'} />
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>

      <Animated.View style={[styles.bottomMenu, { height: animatedHeight }]}>
        <TouchableOpacity style={styles.dragArea} onPress={() => {
            const para = expandido ? 140 : SCREEN_HEIGHT * 0.6;
            Animated.spring(animatedHeight, { toValue: para, useNativeDriver: false }).start();
            setExpandido(!expandido);
        }}><View style={styles.handle} /></TouchableOpacity>

        {unidadeAtiva && (
          <TouchableOpacity style={styles.btnRelatar} onPress={() => setModalVisible(true)}>
            <Text style={styles.btnRelatarTexto}>RELATAR ESPERA ({formatarParaRelogio(unidadeAtiva.minutos_espera)})</Text>
          </TouchableOpacity>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {hospitais.filter(h => h.nome.toLowerCase().includes(busca.toLowerCase())).map((h, i) => (
            <TouchableOpacity key={i} style={[styles.card, unidadeAtiva?.id === h.id && styles.cardAtivo]} onPress={() => selecionarUnidade(h)}>
              <View style={styles.cardInfo}>
                <View style={[styles.dot, {backgroundColor: h.status === 'Verde' ? '#34C759' : h.status === 'Amarelo' ? '#FFCC00' : h.status === 'Laranja' ? '#FF9500' : '#FF3B30'}]} />
                <View>
                  <Text style={styles.uName}>{h.nome}</Text>
                  <Text style={styles.uWait}>{formatarParaRelogio(h.minutos_espera)} de espera</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* MODAL HH:MM IGUAL ONTEM */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Informe o tempo (H:MM)</Text>
            <TextInput style={styles.modalInput} keyboardType="numbers-and-punctuation" placeholder="1:20" placeholderTextColor="#333" value={tempoRelogio} onChangeText={setTempoRelogio} />
            <TouchableOpacity style={styles.btnSalvar} onPress={salvarRelato}><Text style={styles.btnSalvarTexto}>CONFIRMAR</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{marginTop: 20}}><Text style={{color: '#666'}}>Voltar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  watermark: { position: 'absolute', top: 35, alignSelf: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 10, fontWeight: 'bold', zIndex: 5 },
  navbar: { position: 'absolute', top: 60, width: '90%', alignSelf: 'center', zIndex: 20 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1D21', borderRadius: 20, height: 50, borderWidth: 1, borderColor: '#333' },
  inputBusca: { flex: 1, color: '#fff', paddingHorizontal: 15 },
  modosRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 15, gap: 15 },
  btnModo: { backgroundColor: '#1A1D21', padding: 12, borderRadius: 50, width: 55, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  btnModoAtivo: { backgroundColor: '#4facfe', borderColor: '#4facfe' },
  bottomMenu: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#121212', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  dragArea: { paddingBottom: 15, alignItems: 'center' },
  handle: { width: 40, height: 5, backgroundColor: '#333', borderRadius: 3 },
  btnRelatar: { backgroundColor: '#4facfe', padding: 15, borderRadius: 15, marginBottom: 15, alignItems: 'center' },
  btnRelatarTexto: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  card: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, backgroundColor: '#1A1D21', borderRadius: 20, marginBottom: 10, alignItems: 'center' },
  cardAtivo: { borderColor: '#4facfe', borderWidth: 1.5 },
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 15 },
  uName: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  uWait: { color: '#4facfe', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#1A1D21', padding: 30, borderRadius: 25, alignItems: 'center' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  modalInput: { width: '100%', backgroundColor: '#000', color: '#34C759', padding: 20, borderRadius: 15, textAlign: 'center', fontSize: 32, fontWeight: 'bold', marginBottom: 25 },
  btnSalvar: { backgroundColor: '#34C759', paddingVertical: 15, width: '100%', borderRadius: 15, alignItems: 'center' },
  btnSalvarTexto: { color: '#fff', fontWeight: 'bold' }
});