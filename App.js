import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapScreen from './leaflet';

const Colors = {
  black: { rich: '#000', surface: '#111', input: '#1A1D21' },
  blue: { light: '#4facfe' },
  white: { pure: '#fff', ghost: '#888' }
};

export default function App() {
  const mapRef = useRef(null);
  const [busca, setBusca] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transporte, setTransporte] = useState('driving'); 
  const [selectedHospital, setSelectedHospital] = useState(null);

  const hospitaisBase = [
    { id: '1', nome: 'UPA Morada do Ouro', type: 'UPA', percent: 32, lat: -15.5684, lng: -56.0594 },
    { id: '2', nome: 'Hospital São Mateus', type: 'Hospital', percent: 58, lat: -15.5869, lng: -56.0694 },
    { id: '3', nome: 'Clínica Sou Mais Saúde', type: 'Clínica', percent: 89, lat: -15.5925, lng: -56.0841 },
    { id: '4', nome: 'HMC - Hospital Municipal', type: 'Hospital', percent: 95, lat: -15.6264, lng: -56.0741 },
  ];

  const hospitais = hospitaisBase.filter(h => h.nome.toLowerCase().includes(busca.toLowerCase()));

  // PEGAR LOCALIZAÇÃO REAL
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation({ lat: -15.5989, lng: -56.0949 }); // Cuiabá Centro
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      setLoading(false);
    })();
  }, []);

  // MUDAR TRANSPORTE E ATUALIZAR ROTA AUTOMATICAMENTE
  const mudarTransporte = (tipo) => {
    setTransporte(tipo);
    if (selectedHospital) {
      mapRef.current?.tracarRota(selectedHospital.lat, selectedHospital.lng, tipo);
    }
  };

  const selecionarHospital = (item) => {
    setSelectedHospital(item);
    mapRef.current?.tracarRota(item.lat, item.lng, transporte);
  };

  const getStatusColor = (p) => p >= 80 ? '#FF3B30' : (p >= 50 ? '#FFCC00' : '#34C759');

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.blue.light} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Radar da Saúde</Text>
              <Text style={styles.headerSubtitle}>Cuiabá - Rotas em tempo real</Text>
            </View>
            <Text style={styles.watermark}>guerreiros{'\n'}do código</Text>
          </View>
        </View>

        {/* Seleção de Transporte */}
        <View style={styles.transportRow}>
          {['driving', 'motorcycle', 'walking'].map((tipo) => (
            <TouchableOpacity 
              key={tipo}
              style={[styles.transBtn, transporte === tipo && styles.transActive]} 
              onPress={() => mudarTransporte(tipo)}
            >
              <Text style={styles.transText}>
                {tipo === 'driving' ? '🚗 Carro' : tipo === 'motorcycle' ? '🏍️ Moto' : '🚶 A pé'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar atendimento..."
            placeholderTextColor={Colors.white.ghost}
            onChangeText={setBusca}
          />
        </View>

        <View style={styles.mapViewContainer}>
          <MapScreen ref={mapRef} hospitais={hospitais} userPos={location} />
        </View>

        <ScrollView style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Unidades Próximas</Text>
          {hospitais.map((item) => {
            const color = getStatusColor(item.percent);
            const isSelected = selectedHospital?.id === item.id;
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.card, { borderLeftColor: color, borderLeftWidth: 5 }, isSelected && styles.cardSelected]}
                onPress={() => selecionarHospital(item)}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.cardName}>{item.nome}</Text>
                  <Text style={styles.cardType}>{item.type} • Toque para traçar</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
                  <Text style={[styles.statusText, { color: color }]}>{item.percent}%</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black.rich },
  header: { padding: 20, backgroundColor: Colors.black.surface },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.blue.light },
  headerSubtitle: { fontSize: 12, color: Colors.white.ghost },
  watermark: { fontSize: 10, color: '#333', textAlign: 'right' },
  transportRow: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, gap: 10 },
  transBtn: { padding: 8, borderRadius: 20, backgroundColor: Colors.black.surface, borderWidth: 1, borderColor: '#333' },
  transActive: { borderColor: Colors.blue.light, backgroundColor: '#1a2a3a' },
  transText: { color: '#fff', fontSize: 12 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 5 },
  searchInput: { backgroundColor: Colors.black.input, borderRadius: 10, padding: 12, color: '#fff' },
  mapViewContainer: { height: 260, width: '92%', alignSelf: 'center', borderRadius: 20, overflow: 'hidden', marginVertical: 10 },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  card: { backgroundColor: Colors.black.surface, borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  cardSelected: { borderColor: Colors.blue.light, borderWidth: 1 },
  cardLeft: { flex: 1 },
  cardName: { color: '#fff', fontWeight: 'bold' },
  cardType: { color: Colors.white.ghost, fontSize: 12, marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: 'bold' }
});