import { useState } from 'react';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (email.trim() === '' || password === '') {
      setError('Escribe correo y contraseña');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    // Si sale bien, el cambio de sesión cambia las rutas protegidas solo.
    const message = await signIn(email.trim(), password);
    setIsSubmitting(false);
    if (message) setError(message);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Tienda</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        onPress={handleLogin}
        disabled={isSubmitting}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, (pressed || isSubmitting) && styles.pressed]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ingresar</Text>
        )}
      </Pressable>

      <Link href="/registro" style={styles.link}>
        ¿No tienes cuenta? Regístrate
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  error: { color: '#b91c1c', textAlign: 'center' },
  button: { backgroundColor: '#0f766e', borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.7 },
  link: { color: '#0f766e', textAlign: 'center', marginTop: 8, fontSize: 15 },
});
