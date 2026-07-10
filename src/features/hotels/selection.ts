import type { Room } from './types';

/** roomId → number of rooms selected. */
export type RoomQuantities = Record<string, number>;

/** A selected room paired with its chosen quantity. */
export interface SelectedRoom {
  room: Room;
  quantity: number;
}

/**
 * Serialize a selection for passing through navigation params, e.g.
 * `{ "12": 2, "15": 1 }` → `"12:2,15:1"`. Zero-quantity entries are dropped.
 */
export function encodeSelection(quantities: RoomQuantities): string {
  return Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => `${id}:${qty}`)
    .join(',');
}

/** Parse a selection string produced by {@link encodeSelection}. */
export function parseSelection(value?: string): RoomQuantities {
  if (!value) return {};
  const out: RoomQuantities = {};
  for (const part of value.split(',')) {
    const [id, qty] = part.split(':');
    const n = Number(qty);
    if (id && Number.isFinite(n) && n > 0) out[id] = n;
  }
  return out;
}

/** Rooms with a non-zero quantity, in the order they appear in `rooms`. */
export function selectedRooms(rooms: Room[], quantities: RoomQuantities): SelectedRoom[] {
  return rooms
    .map((room) => ({ room, quantity: quantities[room.id] ?? 0 }))
    .filter((s) => s.quantity > 0);
}

/** Total number of rooms selected across all room types. */
export function totalRoomCount(quantities: RoomQuantities): number {
  return Object.values(quantities).reduce((sum, q) => sum + q, 0);
}

/** Nightly subtotal (price × quantity, summed across selected rooms). */
export function nightlySubtotal(rooms: Room[], quantities: RoomQuantities): number {
  return selectedRooms(rooms, quantities).reduce(
    (sum, { room, quantity }) => sum + room.pricePerNight * quantity,
    0,
  );
}
