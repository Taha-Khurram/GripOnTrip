/**
 * Review submission — local stub (no backend).
 *
 * Review *display* still comes from the public REST API (see
 * `features/hotels/api.ts#fetchHotelReviews`). Submitting is disabled while the
 * app has no write backend; this resolves without persisting.
 */
export interface CreateReviewInput {
  productId: string;
  rating: number;
  comment: string;
  userName: string;
  userPhone?: string;
}

export async function createReview(_input: CreateReviewInput) {
  return { ok: true };
}
