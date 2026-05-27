import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [user, setUser] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.1.10:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: senha })
      });
      const data = await response.json();
      if (response.ok) {
        navigation.replace('Home');
      } else {
        Alert.alert("Erro", "Usuário ou senha incorretos");
      }
    } catch (error) {
      Alert.alert("Erro", "Servidor offline. Verifique o Django.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>SAÚDE EM PAZ</Text>
      <TextInput style={styles.input} placeholder="Usuário" placeholderTextColor="#666" value={user} onChangeText={setUser} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#666" secureTextEntry value={senha} onChangeText={setSenha} />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>ENTRAR</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Criar conta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 25 },
  logo: { color: '#4facfe', fontSize: 35, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#1A1D21', color: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#4facfe', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold' },
  link: { color: '#666', textAlign: 'center', marginTop: 20 }
});