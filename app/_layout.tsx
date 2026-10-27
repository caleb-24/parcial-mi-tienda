import { Stack } from 'expo-router';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import migrations from '../drizzle/migrations';
import { db } from '@/db/client';
import { AuthProvider, useAuth } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) void SplashScreen.hideAsync();
  }, [isLoading]);

  // Mientras se lee la sesión guardada, el splash sigue visible.
  if (isLoading) return null;

  // Sin sesión: solo Login y Registro. Con sesión: solo Inventario y Producto.
  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="index" options={{ title: 'Inventario' }} />
        <Stack.Screen name="producto" options={{ title: 'Producto' }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ title: 'Registro' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  // Primero las migraciones locales: sin tablas, ningún repositorio puede consultar.
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (error) void SplashScreen.hideAsync();
  }, [error]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se pudo preparar la base de datos: {error.message}</Text>
      </View>
    );
  }

  if (!success) return null;

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { color: '#b91c1c', fontSize: 16, textAlign: 'center' },
});
