import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { sendAiChat } from './api';
import type { ChatMessage } from './types';

/** Opening line the assistant shows before the user says anything (matches web). */
export const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    'Hi! I am GOT AI. 🗺️ How can I help you plan your trip, find stays, or locate guides today?',
};

/** Shown when the request fails — identical copy to the website widget. */
const ERROR_REPLY: ChatMessage = {
  role: 'assistant',
  content: "Sorry, I'm having trouble connecting right now. Please try again!",
};

/**
 * Drives a GOT AI Assistant conversation. Holds the message list in local state
 * (the chat is ephemeral, per the web widget) and posts the running history to
 * `POST /api/ai/chat` on each user turn.
 */
export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const { mutate, isPending } = useMutation({ mutationFn: sendAiChat });

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isPending) return;

      const userMessage: ChatMessage = { role: 'user', content: trimmed };
      const history = [...messages, userMessage];
      setMessages(history);

      mutate(history, {
        onSuccess: (res) => {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: res.content, searchAction: res.searchAction ?? null },
          ]);
        },
        onError: () => {
          setMessages((prev) => [...prev, ERROR_REPLY]);
        },
      });
    },
    [messages, isPending, mutate],
  );

  const reset = useCallback(() => setMessages([GREETING]), []);

  return { messages, send, reset, isTyping: isPending };
}
