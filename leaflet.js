import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';

const MapScreen = forwardRef(({ hospitais, userPos, onMessage }, ref) => {  const webviewRef = useRef(null);

  // Sincroniza os marcadores sempre que a lista mudar
  useEffect(() => {
    if (webviewRef.current) {
      const script = `window.updateMarkers(${JSON.stringify(hospitais)});`;
      webviewRef.current.injectJavaScript(script);
    }
  }, [hospitais]);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; background: #000; }
        #map { height: 100vh; width: 100vw; }
        /* Filtros para as cores dos pingos */
        .pingo-verde { filter: hue-rotate(120deg) brightness(1.2); }
        .pingo-amarelo { filter: hue-rotate(50deg) brightness(1.2); }
        .pingo-laranja { filter: hue-rotate(20deg) brightness(1.2); }
        .pingo-vermelho { filter: hue-rotate(0deg) brightness(1.2); }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${userPos.lat}, ${userPos.lng}], 14);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

        // Marcador do usuário
        L.circleMarker([${userPos.lat}, ${userPos.lng}], {
          radius: 7, fillColor: "#4facfe", color: "#fff", weight: 2, fillOpacity: 1
        }).addTo(map);

        var group = L.layerGroup().addTo(map);
        var routeLayer;

        window.updateMarkers = function(data) {
          group.clearLayers();
          data.forEach(function(h) {
            var corLower = h.status.toLowerCase();
            var icon = L.icon({
              iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
              iconShadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              iconSize: [25, 41], iconAnchor: [12, 41],
              className: 'pingo-' + corLower
            });
            L.marker([h.lat, h.lng], { icon: icon }).addTo(group).on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ tipo: 'CLICK_MARKER', data: h }));
            });
          });
        };

        window.tracarRotaGlobal = function(dLat, dLng, modo) {
          var profile = modo === 'walk' ? 'walking' : 'driving';
          var url = "https://router.project-osrm.org/route/v1/" + profile + "/" + ${userPos.lng} + "," + ${userPos.lat} + ";" + dLng + "," + dLat + "?overview=full&geometries=geojson";
          
          fetch(url)
          .then(function(r) { return r.json(); })
          .then(function(d) {
            if (!d.routes || d.routes.length === 0) return;
            if(routeLayer) map.removeLayer(routeLayer);

            var coords = d.routes[0].geometry.coordinates.map(function(c) {
              return [c[1], c[0]];
            });

            routeLayer = L.polyline(coords, {
              color: '#4facfe', weight: 7, opacity: 1
            }).addTo(map);

            map.fitBounds(routeLayer.getBounds(), {padding: [50, 50]});
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              tipo: 'ROTA_INFO',
              distancia: (d.routes[0].distance / 1000).toFixed(1),
              duracao: Math.round(d.routes[0].duration / 60)
            }));
          });
        };

        // Inicializa os pingos
        updateMarkers(${JSON.stringify(hospitais)});
      </script>
    </body>
    </html>
  `;

  useImperativeHandle(ref, () => ({
    desenharRota(lat, lng, modo) {
      if (webviewRef.current) {
        webviewRef.current.injectJavaScript(`window.tracarRotaGlobal(${lat}, ${lng}, '${modo}');`);
      }
    }
  }));

  return (
    <WebView 
      ref={webviewRef} 
      source={{ html: mapHtml }} 
onMessage={(e) => onMessage(JSON.parse(e.nativeEvent.data))}      style={{ flex: 1 }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
});

export default MapScreen;