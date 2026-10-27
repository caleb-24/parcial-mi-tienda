import { asc, eq, isNull, lt, or } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { db } from '../client';
import { products, type Product } from '../schema';

export interface ProductInput {
  name: string;
  quantity: number;
  price: number;
}

/** Datos de un producto que llegan de la nube. */
export interface CloudProductInput extends ProductInput {
  clientId: string;
  updatedAt: Date;
}

/** Pendiente: nunca se subió, o cambió después de la última subida. */
export function isPending(product: Pick<Product, 'syncedAt' | 'updatedAt'>): boolean {
  return product.syncedAt === null || product.syncedAt.getTime() < product.updatedAt.getTime();
}

/** Lista reactiva: todos los productos, por nombre. */
export function listQuery() {
  return db.select().from(products).orderBy(asc(products.name));
}

export async function getById(id: number): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.id, id));
  return rows[0] ?? null;
}

/** Productos que faltan por subir (sin syncedAt, o editados después de la subida). */
export function pendingProducts(): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(or(isNull(products.syncedAt), lt(products.syncedAt, products.updatedAt)));
}

export async function create(input: ProductInput): Promise<void> {
  await db.insert(products).values({
    ...input,
    clientId: Crypto.randomUUID(),
    updatedAt: new Date(),
  });
}

/** Cada edición escribe updatedAt: así el producto vuelve a quedar pendiente. */
export async function update(id: number, input: ProductInput): Promise<void> {
  await db
    .update(products)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(products.id, id));
}

/** Borrado local. La nube no se toca (ver README: borrados sincronizados fuera de alcance). */
export async function remove(id: number): Promise<void> {
  await db.delete(products).where(eq(products.id, id));
}

/** Marca como subido. Escribe solo syncedAt: si tocara updatedAt, quedaría pendiente. */
export async function markSynced(id: number, syncedAt: Date): Promise<void> {
  await db.update(products).set({ syncedAt }).where(eq(products.id, id));
}

/**
 * Inserta un producto bajado de la nube. Si ya existe ese clientId en el
 * teléfono no hace nada. Devuelve true cuando insertó una fila.
 */
export async function insertFromCloud(input: CloudProductInput): Promise<boolean> {
  const rows = await db
    .insert(products)
    .values({
      clientId: input.clientId,
      name: input.name,
      quantity: input.quantity,
      price: input.price,
      updatedAt: input.updatedAt,
      syncedAt: input.updatedAt,
    })
    .onConflictDoNothing({ target: products.clientId })
    .returning({ id: products.id });
  return rows.length > 0;
}
