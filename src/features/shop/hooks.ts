import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { fetchProduct, fetchProducts } from './api';
import type { ProductSearchParams } from './types';

/** Marketplace product list. */
export function useProducts(params: ProductSearchParams = {}) {
  return useQuery({
    queryKey: queryKeys.shop.products(params),
    queryFn: () => fetchProducts(params),
  });
}

/** Single product detail (resolved from the list — see {@link fetchProduct}). */
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.shop.product(id),
    queryFn: () => fetchProduct(id),
    enabled: Boolean(id),
  });
}
