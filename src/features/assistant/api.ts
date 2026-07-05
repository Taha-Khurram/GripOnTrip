import { apiPost } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { AiChatResponse, ChatMessage } from './types';

/**
 * Send the running conversation to the GOT AI Assistant and get the next reply.
 *
 * Exactly like the web widget, we post the full message history so the model has
 * context. Only `role` + `content` are sent — the client-only `searchAction`
 * field is stripped from the outgoing history.
 */
export async function sendAiChat(messages: ChatMessage[]): Promise<AiChatResponse> {
  const payload = {
    messages: messages.map(({ role, content }) => ({ role, content })),
  };
  const res = await apiPost<AiChatResponse>(endpoints.ai.chat, payload);
  // The server signals soft failures with `{ error }` and a 200; treat as error.
  if (res.error) throw new Error(res.error);
  return res;
}
