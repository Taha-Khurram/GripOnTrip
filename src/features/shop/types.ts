import type { BaseListing, Money } from '@/types';

/**
 * A marketplace product (travel gear / local goods) as shown on the web
 * "Marketplace" (`/products`). `price` holds the effective selling price;
 * {@link originalPrice} + {@link discountPercent} describe any discount.
 */
export interface Product extends BaseListing {
  category: 'shop';
  /** Seller-defined product category, e.g. "Used Items", "Travel Gear". */
  productCategory?: string;
  /** Brand / make (API `type`), e.g. "Tinnies". */
  brand?: string;
  /** Curated collection the item belongs to, e.g. "Preloved". */
  collection?: string;
  colour?: string;
  size?: string;
  /** Units in stock; 0 when sold out. */
  stock: number;
  inStock: boolean;
  originalPrice?: Money;
  discountPercent?: number;
  /** Public slug used to open the item on gripontrip.com (`/product/{maskedId}`). */
  maskedId?: string;
  tags: string[];
}

export interface ProductSearchParams {
  category?: string;
  page?: number;
}

/** Client-side filters applied on the marketplace list screen. */
export interface ProductFilters {
  query?: string;
  category?: string;
  sort?: 'recommended' | 'price-asc' | 'price-desc' | 'rating-desc';
}
