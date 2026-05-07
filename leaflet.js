import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const MapScreen = forwardRef(({ hospitais, userPos }, ref) => {
  const webRef = useRef(null);

  useImperativeHandle(ref, () => ({
    tracarRota(lat, lng, perfil) {
      const script = `window.runRoute([${lat}, ${lng}], '${perfil}'); true;`;
      if (Platform.OS === 'web') {
        const iframe = document.getElementById('map-iframe');
        iframe?.contentWindow.postMessage(JSON.stringify({type: 'ROUTE', dest: [lat, lng], perfil: perfil}), '*');
      } else {
        webRef.current?.injectJavaScript(script);
      }
    }
  }));

  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          #map { height: 100vh; width: 100vw; margin: 0; background: #0B0D0F; }
          body { margin: 0; padding: 0; overflow: hidden; }
          .leaflet-popup-content-wrapper { background: #1A1D21; color: white; border-radius: 12px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${userPos.lat}, ${userPos.lng}], 14);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

          var userMarker = L.circleMarker([${userPos.lat}, ${userPos.lng}], {
            radius: 8, color: '#fff', weight: 2, fillColor: '#4facfe', fillOpacity: 1
          }).addTo(map);

          var pts = ${JSON.stringify(hospitais)};
          pts.forEach(p => {
            var corMark = p.percent >= 80 ? 'red' : (p.percent >= 50 ? 'orange' : 'green');
            var icon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + corMark + '.png',
              iconSize: [25, 41], iconAnchor: [12, 41]
            });
            L.marker([p.lat, p.lng], {icon: icon}).addTo(map);
          });

          window.runRoute = async function(dest, perfil) {
            var osrmProfile = perfil === 'walking' ? 'foot' : 'driving';
            var url = 'https://router.project-osrm.org/route/v1/' + osrmProfile + '/${userPos.lng},${userPos.lat};' + dest[1] + ',' + dest[0] + '?overview=full&geometries=geojson';
            
            try {
              const res = await fetch(url);
              const data = await res.json();
              const route = data.routes[0];
              const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
              
              if (window.routeL) map.removeLayer(window.routeL);
              window.routeL = L.polyline(coords, { color: '#4facfe', weight: 6, opacity: 0.8 }).addTo(map);

              var tempo = Math.round(route.duration / 60);
              if (perfil === 'motorcycle') tempo = Math.round(tempo * 0.7);

              map.flyToBounds(window.routeL.getBounds(), { padding: [40, 40] });
              L.popup().setLatLng(dest).setContent("<b>" + tempo + " min</b> (" + (perfil === 'walking' ? 'A pé' : (perfil === 'motorcycle' ? 'Moto' : 'Carro')) + ")").openOn(map);
            } catch (e) { console.error(e); }
          };

          window.addEventListener('message', function(e) {
            var data = JSON.parse(e.data);
            if (data.type === 'ROUTE') window.runRoute(data.dest, data.perfil);
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe id="map-iframe" srcDoc={mapHTML} style={styles.iframe} />
      ) : (
        <WebView 
          ref={webRef}
          originWhitelist={['*']}
          source={{ html: mapHTML }}
          javaScriptEnabled={true}
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  iframe: { width: '100%', height: '100%', border: 'none' }
});

export default MapScreen;