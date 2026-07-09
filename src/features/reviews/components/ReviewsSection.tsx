import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui';
import { useRequireAuth } from '@/features/auth';
import type { HotelReview } from '@/features/hotels';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/utils/format';
import { useCreateReview } from '../hooks';
import { StarRating } from './StarRating';

function ReviewItem({ review }: { review: HotelReview }) {
  return (
    <View className="gap-1 border-b border-neutral-100 py-3 dark:border-neutral-800">
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold text-ink">{review.authorName}</Text>
        <StarRating value={review.rating} size={14} />
      </View>
      {review.comment ? (
        <Text className="text-sm leading-5 text-muted">{review.comment}</Text>
      ) : null}
      <Text className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</Text>
    </View>
  );
}

/** Review list + auth-gated composer for a hotel. */
export function ReviewsSection({ hotelId, reviews }: { hotelId: string; reviews: HotelReview[] }) {
  const { requireAuth, isAuthenticated } = useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const { mutateAsync, isPending } = useCreateReview(hotelId);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError(null);
    try {
      await mutateAsync({
        productId: hotelId,
        rating,
        comment: comment.trim(),
        userName: user?.name ?? 'Guest',
        userPhone: user?.phone,
      });
      setDone(true);
      setOpen(false);
      setComment('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your review.');
    }
  };

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-display text-ink">
          Reviews {reviews.length > 0 ? `(${reviews.length})` : ''}
        </Text>
        {!open ? (
          <Button
            label={done ? 'Reviewed' : 'Write a review'}
            variant="outline"
            size="sm"
            disabled={done}
            onPress={() => requireAuth(() => setOpen(true))}
          />
        ) : null}
      </View>

      {open && isAuthenticated ? (
        <View className="gap-3 rounded-2xl border border-neutral-100 p-4 dark:border-neutral-800">
          <StarRating value={rating} onChange={setRating} size={26} />
          <TextInput
            placeholder="Share your experience…"
            placeholderTextColor="#9aa7ac"
            multiline
            value={comment}
            onChangeText={setComment}
            className="min-h-20 rounded-xl border border-hairline bg-white px-3 py-2 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          {error ? <Text className="text-xs text-danger">{error}</Text> : null}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button label="Cancel" variant="ghost" onPress={() => setOpen(false)} fullWidth />
            </View>
            <View className="flex-1">
              <Button label="Submit" loading={isPending} onPress={submit} fullWidth />
            </View>
          </View>
        </View>
      ) : null}

      {reviews.length === 0 ? (
        <Text className="text-sm text-muted">No reviews yet. Be the first to review this stay.</Text>
      ) : (
        <View>
          {reviews.map((r) => (
            <ReviewItem key={r.id} review={r} />
          ))}
        </View>
      )}
    </View>
  );
}
