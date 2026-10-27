import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { errorMessage, syncProducts } from '@/services/sync';
import { formatPesos } from '@/lib/productValidation';
import { isPending } from '@/db/repositories/products';
import type { Product } from '@/db/schema';

export default function InventarioScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const userId = session?.user.id ?? '';
  const { products, pendingCount, totalUnits, totalValue, remove } = useProducts();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  async function handleSync() {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const result = await syncProducts(userId);
      setSyncMessage(`${result.uploaded} subidos, ${result.downloaded} bajados`);
    } catch (e) {
      setSyncMessage(`No se pudo sincronizar: ${errorMessage(e)}`);
    } finally {
      setIsSyncing(false);
    }
  }

  function confirmDelete(product: Product) {
    Alert.alert('Eliminar producto', `¿Eliminar "${product.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => void remove(product.id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Unidades: {totalUnits}</Text>
        <Text style={styles.summaryText}>Valor: {formatPesos(totalValue)}</Text>
        <Text style={styles.summaryText}>Pendientes de subir: {pendingCount}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleSync}
          disabled={isSyncing}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.syncButton, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/producto')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.addButton, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Agregar</Text>
        </Pressable>
        <Pressable
          onPress={() => void signOut()}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.logoutButton, pressed && styles.pressed]}
        >
          <Text style={styles.buttonTextDark}>Cerrar sesión</Text>
        </Pressable>
      </View>

      {syncMessage && <Text style={styles.syncMessage}>{syncMessage}</Text>}

      <FlatList
        data={products}
        keyExtractor={(item) => item.clientId}
        contentContainerStyle={products.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={<Text style={styles.empty}>Aún no tienes productos. Toca Agregar.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/producto', params: { id: String(item.id) } })}
            onLongPress={() => confirmDelete(item)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.rowInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDetail}>
                {item.quantity} unidades · {formatPesos(item.price)}
              </Text>
            </View>
            <Text style={[styles.badge, isPending(item) ? styles.badgePending : styles.badgeSynced]}>
              {isPending(item) ? 'Pendiente' : 'En la nube'}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#f8fafc' },
  summary: { backgroundColor: '#fff', borderRadius: 8, padding: 12, gap: 4 },
  summaryText: { fontSize: 15, color: '#0f172a' },
  actions: { flexDirection: 'row', gap: 8 },
  button: { flex: 1, borderRadius: 8, padding: 12, alignItems: 'center' },
  syncButton: { backgroundColor: '#0f766e' },
  addButton: { backgroundColor: '#2563eb' },
  logoutButton: { backgroundColor: '#e2e8f0' },
  buttonText: { color: '#fff', fontWeight: '600' },
  buttonTextDark: { color: '#0f172a', fontWeight: '600' },
  pressed: { opacity: 0.7 },
  syncMessage: { color: '#0f172a', textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  rowInfo: { flex: 1, gap: 2 },
  productName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  productDetail: { fontSize: 14, color: '#475569' },
  badge: { fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  badgePending: { backgroundColor: '#fef3c7', color: '#92400e' },
  badgeSynced: { backgroundColor: '#dcfce7', color: '#166534' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 32 },
  emptyContainer: { flexGrow: 1 },
});
