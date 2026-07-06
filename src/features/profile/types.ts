/** Domain models for the account/profile area (backed by Supabase). */

export interface Profile {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
  createdAt?: string;
}

export interface ProfileUpdateInput {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

/** A vacation-rental booking the signed-in user made (read for the list). */
export interface MyRentalBooking {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  imageUrl?: string;
  city?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  currency: string;
  status: string;
  message?: string;
  createdAt?: string;
}

/** A hotel/stay listing the user owns ("My properties"). */
export interface MyProperty {
  id: string;
  name: string;
  imageUrl?: string;
  city?: string;
  address?: string;
  price: number;
  currency: string;
  status?: string;
  isAvailable?: boolean;
  propertyType?: string;
}

/** A vacation-rental listing the user owns ("Manage rental properties"). */
export interface MyRentalProperty {
  id: string;
  title: string;
  imageUrl?: string;
  city?: string;
  address?: string;
  pricePerMonth: number;
  currency: string;
  status?: string;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  propertyType?: string;
}
