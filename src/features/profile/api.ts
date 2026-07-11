/**
 * Account/profile data — Supabase reads & writes for the signed-in user.
 *
 * All queries are scoped to the current user id and rely on the same row-level
 * security policies the website uses. Catalog fields (hotel/property name,
 * images) come embedded via PostgREST joins so the lists render in one round trip.
 */
import { resolveImageUrl } from '@/api/media';
import { supabase } from '@/lib/supabase';
import type {
  MyProperty,
  MyRentalBooking,
  MyRentalProperty,
  Profile,
  ProfileUpdateInput,
  RentalPropertyDetail,
  RentalPropertyInput,
} from './types';

const DEFAULT_CURRENCY = 'PKR';

function firstImage(images?: string[] | null): string | undefined {
  const url = images?.find(Boolean);
  return url ? resolveImageUrl(url) : undefined;
}

// ----- Profile settings -----------------------------------------------------

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, name, email, phone, avatar_url, role, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    id: data.id,
    fullName: data.full_name ?? undefined,
    name: data.name ?? undefined,
    email: data.email ?? undefined,
    phone: data.phone ?? undefined,
    avatarUrl: data.avatar_url ?? undefined,
    role: data.role ?? undefined,
    createdAt: data.created_at ?? undefined,
  };
}

export async function updateProfile(
  userId: string,
  input: ProfileUpdateInput,
): Promise<Profile> {
  const patch: Record<string, string | null> = {};
  if (input.fullName !== undefined) patch.full_name = input.fullName;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl;

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select('id, full_name, name, email, phone, avatar_url, role, created_at')
    .single();
  if (error) throw new Error(error.message);

  // Keep the auth-user metadata in sync so the store's cached name/avatar match.
  await supabase.auth.updateUser({
    data: {
      full_name: input.fullName ?? data.full_name ?? undefined,
      avatar_url: input.avatarUrl ?? data.avatar_url ?? undefined,
      phone: input.phone ?? data.phone ?? undefined,
    },
  });

  return {
    id: data.id,
    fullName: data.full_name ?? undefined,
    name: data.name ?? undefined,
    email: data.email ?? undefined,
    phone: data.phone ?? undefined,
    avatarUrl: data.avatar_url ?? undefined,
    role: data.role ?? undefined,
    createdAt: data.created_at ?? undefined,
  };
}

// ----- My rental bookings ---------------------------------------------------

interface RawRentalBooking {
  id: string | number;
  property_id: string | number;
  start_date: string;
  end_date: string;
  total_price?: number | null;
  status?: string | null;
  message?: string | null;
  created_at?: string | null;
  rental_properties?: {
    title?: string | null;
    images_url?: string[] | null;
    city?: string | null;
  } | null;
}

export async function fetchMyRentalBookings(userId: string): Promise<MyRentalBooking[]> {
  const { data, error } = await supabase
    .from('rental_bookings')
    .select('*, rental_properties(title, images_url, city)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  return (data as RawRentalBooking[]).map((b) => ({
    id: String(b.id),
    propertyId: String(b.property_id),
    propertyTitle: b.rental_properties?.title ?? undefined,
    imageUrl: firstImage(b.rental_properties?.images_url),
    city: b.rental_properties?.city ?? undefined,
    startDate: b.start_date,
    endDate: b.end_date,
    totalPrice: b.total_price ?? 0,
    currency: DEFAULT_CURRENCY,
    status: b.status ?? 'pending',
    message: b.message ?? undefined,
    createdAt: b.created_at ?? undefined,
  }));
}

// ----- My properties (hotels/stays I own) -----------------------------------

interface RawOwnedHotel {
  id: string | number;
  name?: string | null;
  images_url?: string[] | null;
  city?: string | null;
  address?: string | null;
  discounted_price?: number | null;
  actual_price?: number | null;
  currency?: string | null;
  status?: string | null;
  is_available?: boolean | null;
  property_type?: string | null;
}

export async function fetchMyProperties(userId: string): Promise<MyProperty[]> {
  const { data, error } = await supabase
    .from('hotels')
    .select(
      'id, name, images_url, city, address, discounted_price, actual_price, currency, status, is_available, property_type',
    )
    .eq('owner_id', userId)
    .order('id', { ascending: false });
  if (error) throw new Error(error.message);

  return (data as RawOwnedHotel[]).map((h) => ({
    id: String(h.id),
    name: h.name ?? 'Untitled property',
    imageUrl: firstImage(h.images_url),
    city: h.city ?? undefined,
    address: h.address ?? undefined,
    price: h.discounted_price ?? h.actual_price ?? 0,
    currency: h.currency ?? DEFAULT_CURRENCY,
    status: h.status ?? undefined,
    isAvailable: h.is_available ?? undefined,
    propertyType: h.property_type ?? undefined,
  }));
}

// ----- Manage rental properties (rentals I own) -----------------------------

interface RawOwnedRental {
  id: string | number;
  title?: string | null;
  images_url?: string[] | null;
  city?: string | null;
  address?: string | null;
  price_per_month?: number | null;
  status?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  max_guests?: number | null;
  property_type?: string | null;
}

export async function fetchMyRentalProperties(userId: string): Promise<MyRentalProperty[]> {
  const { data, error } = await supabase
    .from('rental_properties')
    .select(
      'id, title, images_url, city, address, price_per_month, status, bedrooms, bathrooms, max_guests, property_type',
    )
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  return (data as RawOwnedRental[]).map((r) => ({
    id: String(r.id),
    title: r.title ?? 'Untitled rental',
    imageUrl: firstImage(r.images_url),
    city: r.city ?? undefined,
    address: r.address ?? undefined,
    pricePerMonth: r.price_per_month ?? 0,
    currency: DEFAULT_CURRENCY,
    status: r.status ?? undefined,
    bedrooms: r.bedrooms ?? undefined,
    bathrooms: r.bathrooms ?? undefined,
    maxGuests: r.max_guests ?? undefined,
    propertyType: r.property_type ?? undefined,
  }));
}

export async function deleteRentalProperty(id: string): Promise<void> {
  const { error } = await supabase.from('rental_properties').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/**
 * List a new vacation rental. Inserts into `rental_properties` scoped to the
 * owner and marks it `pending` for review (matching the website's flow). Column
 * names mirror the verified table schema (snake_case).
 */
export async function createRentalProperty(
  userId: string,
  input: RentalPropertyInput,
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('rental_properties')
    .insert({
      owner_id: userId,
      title: input.title,
      description: input.description || null,
      property_type: input.propertyType,
      owner_phone: input.ownerPhone || null,
      city: input.city,
      address: input.address,
      price_per_month: input.pricePerMonth,
      price_per_day: input.pricePerDay ?? null,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      area_sqft: input.areaSqft ?? null,
      max_guests: input.maxGuests,
      amenities: input.amenities,
      images_url: input.images,
      available: input.available,
      furnished: input.furnished,
      parking_available: input.parkingAvailable,
      pets_allowed: input.petsAllowed,
      status: 'pending',
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return { id: String(data.id) };
}

/** Full rental listing for the edit form (all writable fields). */
export async function fetchRentalProperty(id: string): Promise<RentalPropertyDetail> {
  const { data, error } = await supabase
    .from('rental_properties')
    .select(
      'id, title, description, property_type, owner_phone, city, address, price_per_month, price_per_day, bedrooms, bathrooms, area_sqft, max_guests, amenities, images_url, available, furnished, parking_available, pets_allowed',
    )
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return {
    id: String(data.id),
    title: data.title ?? '',
    description: data.description ?? '',
    propertyType: data.property_type ?? 'House',
    ownerPhone: data.owner_phone ?? '',
    city: data.city ?? '',
    address: data.address ?? '',
    pricePerMonth: data.price_per_month ?? 0,
    pricePerDay: data.price_per_day ?? undefined,
    bedrooms: data.bedrooms ?? 0,
    bathrooms: data.bathrooms ?? 0,
    areaSqft: data.area_sqft ?? undefined,
    maxGuests: data.max_guests ?? 1,
    amenities: data.amenities ?? [],
    images: data.images_url ?? [],
    available: data.available ?? true,
    furnished: data.furnished ?? false,
    parkingAvailable: data.parking_available ?? false,
    petsAllowed: data.pets_allowed ?? false,
  };
}

/** Update an existing rental listing (owner only, enforced by RLS). */
export async function updateRentalProperty(
  id: string,
  input: RentalPropertyInput,
): Promise<void> {
  const { error } = await supabase
    .from('rental_properties')
    .update({
      title: input.title,
      description: input.description || null,
      property_type: input.propertyType,
      owner_phone: input.ownerPhone || null,
      city: input.city,
      address: input.address,
      price_per_month: input.pricePerMonth,
      price_per_day: input.pricePerDay ?? null,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      area_sqft: input.areaSqft ?? null,
      max_guests: input.maxGuests,
      amenities: input.amenities,
      images_url: input.images,
      available: input.available,
      furnished: input.furnished,
      parking_available: input.parkingAvailable,
      pets_allowed: input.petsAllowed,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
