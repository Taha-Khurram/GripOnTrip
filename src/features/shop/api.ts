import { apiGet } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { resolveImageUrl } from '@/api/media';
import { env } from '@/config/env';
import type { Paginated } from '@/types';
import type { Product, ProductOrderInput, ProductOrderResult, ProductSearchParams } from './types';

/**
 * Raw product record as returned by `GET /products` on gripontrip.com. Field
 * names are snake_case / mixed-case and differ from our normalized
 * {@link Product}; the UI only ever sees the output of {@link mapProduct}.
 */
interface RawProduct {
  id: number | string;
  name: string;
  description?: string | null;
  /** Effective selling price. */
  price?: number | string | null;
  /** List/original price before discount. */
  actual_price?: number | string | null;
  discountedPrice?: number | string | null;
  discountPercentage?: number | string | null;
  category?: string | null;
  /** Brand / make. */
  type?: string | null;
  collection?: string | null;
  colour?: string | null;
  size?: string | null;
  stock?: number | null;
  availability?: string | null;
  rating?: number | string | null;
  image_urls?: string[] | null;
  masked_id?: string | null;
  tags?: string[] | string | null;
}

/** API envelope: `{ success, data }` (no pagination metadata). */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

function toNumber(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/** Normalize a raw API record into the app's {@link Product} shape. */
function mapProduct(raw: RawProduct): Product {
  const id = String(raw.id);
  const currency = 'PKR';
  const price = toNumber(raw.price) ?? toNumber(raw.discountedPrice) ?? toNumber(raw.actual_price) ?? 0;
  const original = toNumber(raw.actual_price);
  const hasDiscount = original != null && original > price;
  const discountPercent =
    toNumber(raw.discountPercentage) ??
    (hasDiscount ? Math.round((1 - price / original!) * 100) : undefined);
  const stock = toNumber(raw.stock) ?? 0;
  const inStock = raw.availability
    ? raw.availability.toLowerCase() === 'available'
    : stock > 0;
  const tags = Array.isArray(raw.tags)
    ? raw.tags
    : typeof raw.tags === 'string' && raw.tags.trim()
      ? raw.tags.split(',').map((t) => t.trim())
      : [];

  return {
    id,
    category: 'shop',
    title: raw.name ?? 'Untitled product',
    description: raw.description ?? '',
    images: (raw.image_urls ?? []).map((url, index) => ({
      id: `${id}-${index}`,
      url: resolveImageUrl(url),
    })),
    price: { amount: price, currency },
    originalPrice: hasDiscount ? { amount: original!, currency } : undefined,
    discountPercent: discountPercent != null && discountPercent > 0 ? discountPercent : undefined,
    rating: toNumber(raw.rating),
    productCategory: raw.category ?? undefined,
    brand: raw.type ?? undefined,
    collection: raw.collection ?? undefined,
    colour: raw.colour ?? undefined,
    size: raw.size ?? undefined,
    stock,
    inStock,
    maskedId: raw.masked_id ?? undefined,
    tags,
  };
}

export async function fetchProducts(
  params: ProductSearchParams = {},
): Promise<Paginated<Product>> {
  const res = await apiGet<ApiEnvelope<RawProduct[]>>(endpoints.shop.products, params);
  const items = (res.data ?? []).map(mapProduct);
  return {
    data: items,
    page: params.page ?? 1,
    pageSize: items.length,
    total: items.length,
    hasMore: false,
  };
}

/**
 * A single product. The API has no GET-by-id route (it 405s), so — like the web
 * site — we resolve the item from the full list by `id` (or its public
 * `masked_id`).
 */
export async function fetchProduct(id: string): Promise<Product | undefined> {
  const { data } = await fetchProducts();
  return data.find((p) => p.id === id || p.maskedId === id);
}

/**
 * Place a marketplace order.
 *
 * The card charge (when paying online) has already happened upstream via the
 * payments layer, so this records the order and returns a buyer-facing
 * reference. The public `/products` API is read-only and there's no verified
 * order-write endpoint yet — so, like the agency/guide booking flows, this is a
 * local confirmation: the money moves through Stripe, and the reference lets the
 * buyer follow up. Swap the body for a Supabase insert once the `orders` table
 * is finalized.
 */
export async function createProductOrder(input: ProductOrderInput): Promise<ProductOrderResult> {
  const reference = `GOT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  return { id: input.paymentReference ?? reference, reference };
}

/** Absolute URL of a product on gripontrip.com — where purchase happens. */
export function productWebUrl(product: Product): string {
  const origin = env.webUrl.replace(/\/$/, '');
  return product.maskedId ? `${origin}/product/${product.maskedId}` : `${origin}/products`;
}
