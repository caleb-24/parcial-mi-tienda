// services/sync.ts
// Única capa que conoce Supabase para los productos. SQLite sigue siendo la
// fuente de verdad local: la nube es el respaldo.
import { supabase } from '@/lib/supabase';
import * as productsRepo from '@/db/repositories/products';

export interface SyncResult {
  uploaded: number;
  downloaded: number;
}

/** Fila de public.products tal como la devuelve Supabase. */
interface CloudProductRow {
  client_id: string;
  name: string;
  quantity: number;
  price: number;
  updated_at: string;
}

/**
 * Botón Sincronizar: primero baja lo que falta en el teléfono y después sube
 * los pendientes. Si un paso falla (por ejemplo, sin conexión), lanza el error
 * y los productos ya subidos quedan marcados.
 */
export async function syncProducts(userId: string): Promise<SyncResult> {
  // 1. Bajar: productos de la nube que no existen en SQLite (RLS limita a los del usuario)
  const { data, error: downloadError } = await supabase
    .from('products')
    .select('client_id, name, quantity, price, updated_at');
  if (downloadError) throw downloadError;

  let downloaded = 0;
  for (const row of (data ?? []) as CloudProductRow[]) {
    const inserted = await productsRepo.insertFromCloud({
      clientId: row.client_id,
      name: row.name,
      quantity: row.quantity,
      price: row.price,
      updatedAt: new Date(row.updated_at),
    });
    if (inserted) downloaded++;
  }

  // 2. Subir: upsert por client_id para no duplicar filas si ya existían
  const pending = await productsRepo.pendingProducts();
  for (const product of pending) {
    const { error: uploadError } = await supabase.from('products').upsert(
      {
        user_id: userId,
        client_id: product.clientId,
        name: product.name,
        quantity: product.quantity,
        price: product.price,
        updated_at: product.updatedAt.toISOString(),
      },
      { onConflict: 'client_id' }
    );
    if (uploadError) throw uploadError;

    // syncedAt = el updatedAt que se acaba de subir (snapshot, no el actual)
    await productsRepo.markSynced(product.id, product.updatedAt);
  }

  return { uploaded: pending.length, downloaded };
}

/** Mensaje legible para la UI a partir de cualquier error. */
export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'object' && e !== null && 'message' in e && typeof e.message === 'string') {
    return e.message;
  }
  return 'Error desconocido';
}
