import type { ProductInput } from '@/db/repositories/products';

export interface ProductFormValues {
  name: string;
  quantity: string;
  price: string;
}

const WHOLE_NUMBER = /^\d+$/;

/** Devuelve el primer error del formulario, o null si todo está bien. */
export function validateProduct(values: ProductFormValues): string | null {
  if (values.name.trim().length === 0) return 'El nombre es obligatorio';
  if (!WHOLE_NUMBER.test(values.quantity.trim())) {
    return 'La cantidad debe ser un número entero mayor o igual a 0';
  }
  if (!WHOLE_NUMBER.test(values.price.trim())) {
    return 'El precio debe ser un número entero mayor o igual a 0';
  }
  return null;
}

/** Convierte los valores del formulario al formato del repositorio. Asume que ya pasó validateProduct. */
export function toProductInput(values: ProductFormValues): ProductInput {
  return {
    name: values.name.trim(),
    quantity: Number(values.quantity),
    price: Number(values.price),
  };
}

/** 12500 -> "$ 12.500" (separador de miles con punto, como se usa en Colombia). */
export function formatPesos(value: number): string {
  return `$ ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
