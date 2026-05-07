import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Colors from './src/styles/colors';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Cabeçalho */}
     <View style={styles.header}>
  <View style={styles.headerRow}>
    <View>
      <Text style={styles.headerTitle}>Saúde em Paz</Text>
      <Text style={styles.headerSubtitle}>Encontre atendimento perto de você</Text>
    </View>
    <Text style={styles.watermark}>guerreiros{'\n'}do código</Text>
  </View>
</View>

      {/* Barra de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar hospital, UPA, clínica..."
          placeholderTextColor={Colors.white.ghost}
        />
      </View>

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        <TouchableOpacity style={[styles.filterBtn, styles.filterActive]}>
          <Text style={styles.filterTextActive}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Hospital</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>UPA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Clínica</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Farmácia</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Área do mapa (placeholder até integrar react-native-maps) */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>🗺️ Mapa será carregado aqui</Text>
        <Text style={styles.mapPlaceholderSub}>react-native-maps</Text>
      </View>

      {/* Lista de locais próximos */}
      <ScrollView style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Próximos de você</Text>

        {/* Card — livre */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardName}>Hospital Regional</Text>
            <Text style={styles.cardType}>Hospital • 1,2 km</Text>
            <Text style={styles.cardWait}>Atendimento rápido</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: Colors.status.free }]}>
            <Text style={styles.statusText}>32%</Text>
          </View>
        </TouchableOpacity>

        {/* Card — moderado */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardName}>UPA Norte</Text>
            <Text style={styles.cardType}>UPA • 2,5 km</Text>
            <Text style={styles.cardWait}>Espera moderada</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: Colors.status.moderate }]}>
            <Text style={styles.statusText}>58%</Text>
          </View>
        </TouchableOpacity>

        {/* Card — lotado */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardName}>Pronto-Socorro Central</Text>
            <Text style={styles.cardType}>Hospital • 3,8 km</Text>
            <Text style={styles.cardWait}>Alta lotação</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: Colors.status.busy }]}>
            <Text style={styles.statusText}>89%</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  // Layout base
  container: {
    flex: 1,
    backgroundColor: Colors.black.pure,
  },

  // Cabeçalho
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.black.rich,
    borderBottomWidth: 1,
    borderBottomColor: Colors.black.surface,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.blue.medium,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.white.ghost,
    marginTop: 2,
  },

  // Busca
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.black.rich,
  },
  searchInput: {
    backgroundColor: Colors.black.muted,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.white.pure,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.black.surface,
  },

  // Filtros
  filtersRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.black.rich,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.black.surface,
    marginRight: 8,
  },
  filterActive: {
    backgroundColor: Colors.blue.primary,
    borderColor: Colors.blue.primary,
  },
  filterText: {
    color: Colors.white.muted,
    fontSize: 13,
  },
  filterTextActive: {
    color: Colors.white.pure,
    fontSize: 13,
    fontWeight: '500',
  },

  // Mapa placeholder
  mapPlaceholder: {
    height: 200,
    backgroundColor: Colors.black.soft,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.black.surface,
  },
  mapPlaceholderText: {
    color: Colors.white.muted,
    fontSize: 16,
  },
  mapPlaceholderSub: {
    color: Colors.white.ghost,
    fontSize: 12,
    marginTop: 4,
  },

  // Lista
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white.soft,
    marginBottom: 12,
  },

  // Cards
  card: {
    backgroundColor: Colors.black.rich,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.black.surface,
  },
  cardLeft: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white.pure,
  },
  cardType: {
    fontSize: 12,
    color: Colors.white.ghost,
    marginTop: 3,
  },
  cardWait: {
    fontSize: 12,
    color: Colors.blue.pale,
    marginTop: 4,
  },

  // Badge de lotação
  statusBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  statusText: {
    color: Colors.white.pure,
    fontSize: 13,
    fontWeight: 'bold',
  },

});