import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import * as productsRepo from '@/db/repositories/products';

/** Lista reactiva de productos con sus totales e indicadores de pendientes. */
export function useProducts() {
  const { data } = useLiveQuery(productsRepo.listQuery());

  return {
    products: data,
    pendingCount: data.filter((product) => productsRepo.isPending(product)).length,
    totalUnits: data.reduce((sum, product) => sum + product.quantity, 0),
    totalValue: data.reduce((sum, product) => sum + product.quantity * product.price, 0),
    remove: productsRepo.remove,
  };
}
