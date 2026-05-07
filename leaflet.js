import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import * as Location from 'expo-location';
import MapScreen from './leaflet';

// --- CORES DO SISTEMA ---
const Colors = {
  black: { pure: '#000000', rich: '#111111', muted: '#1A1D21', surface: '#222222', soft: '#0B0D0F' },
  blue: { medium: '#4facfe', primary: '#007AFF', pale: '#A0C4FF' },
  white: { pure: '#FFFFFF', ghost: '#888888', soft: '#CCCCCC' },
  status: { free: '#34C759', moderate: '#FFCC00', busy: '#FF3B30' }
};

// --- CÁLCULO DE DISTÂNCIA ---
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

const DADOS_HOSPITAIS = [
  { id: '1', nome: 'UPA Morada do Ouro', tipo: 'UPA', status: 'Atendimento rápido', percent: 32, cor: Colors.status.free, lat: -15.5684, lng: -56.0594 },
  { id: '2', nome: 'Hospital São Mateus', tipo: 'Hospital', status: 'Espera moderada', percent: 58, cor: Colors.status.moderate, lat: -15.5869, lng: -56.0694 },
  { id: '3', nome: 'Clínica Sou Mais Saúde', tipo: 'Clínica', status: 'Alta lotação', percent: 89, cor: Colors.status.busy, lat: -15.5925, lng: -56.0841 },
];

export default function App() {
  const mapRef = useRef(null);
  const [busca, setBusca] = useState('');
  const [minhaPosicao, setMinhaPosicao] = useState({ lat: -15.5989, lng: -56.0949 });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setMinhaPosicao({ lat: location.coords.latitude, lng: location.coords.longitude });
      }
    })();
  }, []);

  const listaProcessada = DADOS_HOSPITAIS
    .filter(it => it.nome.toLowerCase().includes(busca.toLowerCase()))
    .map(it => ({ ...it, distanciaNum: calcularDistancia(minhaPosicao.lat, minhaPosicao.lng, it.lat, it.lng) }))
    .sort((a, b) => a.percent - b.percent);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saúde em Paz</Text>
        <Text style={styles.headerSubtitle}>Cuiabá - Monitoramento Real</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar unidade..."
          placeholderTextColor="#888"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <View style={styles.mapContainer}>
        <MapScreen ref={mapRef} hospitaisFiltrados={listaProcessada} minhaPosicao={minhaPosicao} />
      </View>

      <ScrollView style={styles.listContainer}>
        {listaProcessada.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => mapRef.current?.tracarRotaNoMapa(item.lat, item.lng)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.nome}</Text>
              <Text style={styles.cardType}>{item.tipo} • {item.distanciaNum} km</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: item.cor }]}>
              <Text style={styles.badgeText}>{item.percent}%</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black.pure },
  header: { padding: 20, backgroundColor: Colors.black.rich, borderBottomWidth: 1, borderBottomColor: Colors.black.surface },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.blue.medium },
  headerSubtitle: { fontSize: 13, color: Colors.white.ghost },
  searchContainer: { padding: 15 },
  searchInput: { backgroundColor: Colors.black.muted, borderRadius: 10, padding: 12, color: '#fff', borderWidth: 1, borderColor: '#333' },
  mapContainer: { height: 350, width: '94%', alignSelf: 'center', borderRadius: 20, overflow: 'hidden', marginVertical: 10, backgroundColor: '#111' },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  card: { backgroundColor: Colors.black.rich, borderRadius: 15, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.black.surface },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  cardType: { fontSize: 12, color: '#aaa', marginTop: 4 },
  badge: { width: 45, height: 45, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});


leaflet.js
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const MapScreen = forwardRef(({ hospitaisFiltrados, minhaPosicao }, ref) => {
  const webViewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    tracarRotaNoMapa(destLat, destLng) {
      const script = `window.tracarRota([${minhaPosicao.lat}, ${minhaPosicao.lng}], [${destLat}, ${destLng}]);`;
      if (Platform.OS === 'web') {
        const iframe = document.getElementsByTagName('iframe')[0];
        if (iframe) {
          iframe.contentWindow.postMessage({ type: 'ROTA', dest: [destLat, destLng] }, '*');
        }
      } else {
        webViewRef.current?.injectJavaScript(script);
      }
    }
  }));

  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          #map { height: 100vh; width: 100vw; margin: 0; }
          body { margin: 0; background: #0B0D0F; }
          .leaflet-popup-content-wrapper { background: #1A1D21; color: white; border-radius: 8px; }
          .leaflet-popup-tip { background: #1A1D21; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${minhaPosicao.lat}, ${minhaPosicao.lng}], 14);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

          var iconPessoa = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
          });

          function getIcon(percent) {
            var cor = percent > 80 ? 'red' : (percent > 50 ? 'orange' : 'green');
            return L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + cor + '.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            });
          }

          L.marker([${minhaPosicao.lat}, ${minhaPosicao.lng}], {icon: iconPessoa}).addTo(map).bindPopup("Você está aqui");

          var locais = ${JSON.stringify(hospitaisFiltrados || [])};
          locais.forEach(loc => {
            L.marker([loc.lat, loc.lng], {icon: getIcon(loc.percent)})
             .addTo(map)
             .bindPopup("<b>" + loc.nome + "</b><br>Lotação: " + loc.percent + "%");
          });

          window.tracarRota = async function(inicio, fim) {
            var url = 'https://router.project-osrm.org/route/v1/driving/' + inicio[1] + ',' + inicio[0] + ';' + fim[1] + ',' + fim[0] + '?overview=full&geometries=geojson';
            const res = await fetch(url);
            const data = await res.json();
            var coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            
            if (window.currentRoute) map.removeLayer(window.currentRoute);
            window.currentRoute = L.polyline(coords, { color: '#4facfe', weight: 6, opacity: 0.9 }).addTo(map);
            map.fitBounds(window.currentRoute.getBounds(), { padding: [50, 50] });
          };

          window.addEventListener('message', function(event) {
            if (event.data.type === 'ROTA') {
              window.tracarRota([${minhaPosicao.lat}, ${minhaPosicao.lng}], event.data.dest);
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe srcDoc={mapHTML} style={styles.web} title="map" />
      ) : (
        <WebView ref={webViewRef} originWhitelist={['*']} source={{ html: mapHTML }} style={styles.map} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  web: { width: '100%', height: '100%', border: 'none' },
  map: { flex: 1 }
});