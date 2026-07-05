/**
 * Types for the "GOT AI Assistant" chat — the mobile counterpart of the floating
 * chat widget on gripontrip.com. Verified against the live `POST /api/ai/chat`
 * contract: the request carries `{ messages: [{ role, content }] }` and the
 * response is `{ role, content, searchAction }`.
 */

export type ChatRole = 'user' | 'assistant';

/**
 * When the assistant decides the user is looking for listings, it returns a
 * `searchAction`. The web widget renders a horizontal strip of matching hotels
 * or guides for the given city; we mirror that behavior.
 */
export interface SearchAction {
  type: 'hotels' | 'guides';
  city: string;
}

/** A single turn in the conversation. `searchAction` only ever set on assistant turns. */
export interface ChatMessage {
  role: ChatRole;
  content: string;
  searchAction?: SearchAction | null;
}

/** Raw response body from `POST /api/ai/chat`. */
export interface AiChatResponse {
  role: 'assistant';
  content: string;
  searchAction?: SearchAction | null;
  /** Present when the server rejects the request (surfaced as a thrown error). */
  error?: string;
}
