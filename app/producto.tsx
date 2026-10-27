import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useProductForm } from '@/hooks/useProductForm';
import { toProductInput, validateProduct, type ProductFormValues } from '@/lib/productValidation';
import type { Product } from '@/db/schema';

export default function ProductoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const productId = id ? Number(id) : null;
  const { product, save } = useProductForm(productId);

  // Mientras carga el producto a editar, no se muestra el formulario:
  // así los campos empiezan con los valores guardados.
  if (product === undefined) return null;

  return <ProductoForm key={productId ?? 'nuevo'} initial={product} onSave={save} />;
}

interface ProductoFormProps {
  initial: Product | null;
  onSave: (input: ReturnType<typeof toProductInput>) => Promise<void>;
}

function ProductoForm({ initial, onSave }: ProductoFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({
    name: initial?.name ?? '',
    quantity: initial ? String(initial.quantity) : '',
    price: initial ? String(initial.price) : '',
  });
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof ProductFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    const message = validateProduct(values);
    if (message) {
      setError(message);
      return;
    }
    await onSave(toProductInput(values));
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={values.name} onChangeText={(v) => update('name', v)} />

      <Text style={styles.label}>Cantidad (unidades)</Text>
      <TextInput
        style={styles.input}
        value={values.quantity}
        onChangeText={(v) => update('quantity', v)}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Precio (pesos)</Text>
      <TextInput
        style={styles.input}
        value={values.price}
        onChangeText={(v) => update('price', v)}
        keyboardType="number-pad"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        onPress={handleSave}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Guardar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8, backgroundColor: '#f8fafc' },
  label: { fontSize: 14, color: '#334155', marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  error: { color: '#b91c1c', marginTop: 8 },
  button: { backgroundColor: '#0f766e', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
