import { useEffect, useState } from 'react';
import * as productsRepo from '@/db/repositories/products';
import type { Product } from '@/db/schema';
import type { ProductInput } from '@/db/repositories/products';

/**
 * Carga el producto cuando se edita (id no nulo) y expone save para crear o
 * actualizar. Mientras carga, product es undefined.
 */
export function useProductForm(id: number | null) {
  const [product, setProduct] = useState<Product | null | undefined>(id === null ? null : undefined);

  useEffect(() => {
    if (id === null) return;
    let active = true;
    void productsRepo.getById(id).then((row) => {
      if (active) setProduct(row);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const save = (input: ProductInput) =>
    id === null ? productsRepo.create(input) : productsRepo.update(id, input);

  return { product, save };
}
