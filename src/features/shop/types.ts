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

/** How the buyer chose to pay at checkout. */
export type OrderPaymentMethod = 'card' | 'cod';

/** Everything needed to place a marketplace order (delivery + payment). */
export interface ProductOrderInput {
  productId: string;
  productTitle: string;
  quantity: number;
  /** Unit selling price in the currency's major unit. */
  unitPrice: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  /** Street address the order ships to. */
  shippingAddress: string;
  city: string;
  paymentMethod: OrderPaymentMethod;
  /** Stripe PaymentIntent id (`pi_…`) when paid by card. */
  paymentReference?: string;
  notes?: string;
}

/** Result of a placed order — a human-facing reference for the confirmation. */
export interface ProductOrderResult {
  id: string;
  /** Short order reference shown to the buyer, e.g. `GOT-8F3A2`. */
  reference: string;
}
