import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleRegister = async () => {
    try {
      const response = await fetch('http://192.168.1.10:8000/api/cadastro/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, email: email, password: senha })
      });
      if (response.ok) {
        Alert.alert("Sucesso", "Usuário criado no Aiven!");
        navigation.goBack();
      } else {
        Alert.alert("Erro", "Falha ao cadastrar");
      }
    } catch (error) {
      Alert.alert("Erro", "Conexão falhou.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>
      <TextInput style={styles.input} placeholder="Usuário" placeholderTextColor="#666" value={user} onChangeText={setUser} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#666" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#666" secureTextEntry value={senha} onChangeText={setSenha} />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>CADASTRAR</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 25 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  input: { backgroundColor: '#1A1D21', color: '#fff', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#4facfe', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold' }
});