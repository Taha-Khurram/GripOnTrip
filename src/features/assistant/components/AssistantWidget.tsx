import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OceanHero, PressableScale } from '@/components/ui';
import { useAssistantChat } from '../hooks';
import type { ChatMessage } from '../types';
import { AssistantSearchStrip } from './AssistantSearchStrip';
import { MessageContent } from './MessageContent';
import { TypingDots } from './TypingDots';

/** Routes where the assistant should stay hidden (auth modal), mirroring the web. */
const HIDDEN_ROUTES = /^\/(sign-in|sign-up|forgot-password)/;

/** Quick-start prompts shown before the traveller has typed anything. */
const SUGGESTIONS = [
  { icon: 'bed-outline', label: 'Hotels in Islamabad' },
  { icon: 'person-outline', label: 'Find a guide in Naran' },
  { icon: 'compass-outline', label: 'Top places to visit' },
] as const;

/**
 * The "GOT AI Assistant" — a floating chat button plus a full chat panel, mounted
 * globally so it's reachable from every screen (exactly like the website widget).
 * Styled in the app's "Ocean & Sun" system: ocean-teal header, sandy-cream canvas,
 * white agent bubbles, teal traveller bubbles, sun-orange send.
 */
export function AssistantWidget() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  if (pathname && HIDDEN_ROUTES.test(pathname)) return null;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open GOT AI Assistant"
        onPress={() => setOpen(true)}
        style={{
          position: 'absolute',
          right: 16,
          bottom: insets.bottom + 78,
          elevation: 6,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
        className="h-14 w-14 items-center justify-center rounded-full bg-brand-500 active:bg-brand-600"
      >
        <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
      </Pressable>

      <ChatPanel visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

function ChatPanel({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { messages, send, reset, isTyping } = useAssistantChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const scrollToEnd = () => scrollRef.current?.scrollToEnd({ animated: true });

  const submit = (text: string) => {
    if (!text.trim() || isTyping) return;
    setInput('');
    send(text);
  };

  const showSuggestions = messages.length <= 1 && !isTyping;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background">
        {/* Header — ocean-teal hero */}
        <OceanHero style={{ paddingTop: insets.top + 6 }} className="rounded-b-[28px] px-4 pb-4 shadow-glow-ocean">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <Text className="text-xl">🤖</Text>
            </View>
            <View className="flex-1">
              <Text className="font-display text-[17px] text-white">GOT AI Assistant</Text>
              <View className="flex-row items-center gap-1.5">
                <View className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                <Text className="text-[10px] font-body-semibold uppercase tracking-wide text-accent-200">
                  Agent online
                </Text>
              </View>
            </View>

            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Start a new chat"
              activeScale={0.9}
              hitSlop={8}
              onPress={reset}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/15"
            >
              <Ionicons name="refresh" size={18} color="#fff" />
            </PressableScale>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Close assistant"
              activeScale={0.9}
              hitSlop={8}
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/15"
            >
              <Ionicons name="close" size={20} color="#fff" />
            </PressableScale>
          </View>
        </OceanHero>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top}
        >
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4"
            contentContainerClassName="gap-3 py-4"
            onContentSizeChange={scrollToEnd}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} onNavigate={onClose} />
            ))}

            {isTyping ? (
              <View className="flex-row items-end gap-2">
                <Avatar />
                <View className="rounded-2xl rounded-tl-sm border border-hairline bg-surface px-4 py-3 shadow-card">
                  <TypingDots />
                </View>
              </View>
            ) : null}

            {showSuggestions ? (
              <View className="mt-1 flex-row flex-wrap gap-2 pl-9">
                {SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s.label}
                    accessibilityRole="button"
                    onPress={() => submit(s.label)}
                    className="flex-row items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-2 active:bg-brand-100"
                  >
                    <Ionicons name={s.icon} size={13} color="#037a4e" />
                    <Text className="text-[13px] font-body-medium text-brand-700">{s.label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </ScrollView>

          {/* Composer */}
          <View
            className="flex-row items-end gap-2 border-t border-hairline bg-surface px-3 py-3"
            style={{ paddingBottom: insets.bottom + 8 }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Search hotels, find guides…"
              placeholderTextColor="#7c8a90"
              className="max-h-28 flex-1 rounded-3xl border border-hairline bg-surface-sunk px-4 py-3 text-[15px] text-ink"
              returnKeyType="send"
              multiline
              onSubmitEditing={() => submit(input)}
              editable={!isTyping}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              onPress={() => submit(input)}
              disabled={!input.trim() || isTyping}
              className={[
                'h-12 w-12 items-center justify-center rounded-full',
                !input.trim() || isTyping ? 'bg-hairline' : 'bg-accent-500 active:bg-accent-600',
              ].join(' ')}
            >
              <Ionicons name="send" size={18} color={!input.trim() || isTyping ? '#7c8a90' : '#fff'} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/** Small ocean-teal agent avatar shown beside assistant messages. */
function Avatar() {
  return (
    <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-500">
      <Ionicons name="sparkles" size={13} color="#fff" />
    </View>
  );
}

function MessageBubble({
  message,
  onNavigate,
}: {
  message: ChatMessage;
  onNavigate: () => void;
}) {
  if (message.role === 'user') {
    return (
      <View className="max-w-[82%] self-end rounded-2xl rounded-tr-sm bg-brand-500 px-4 py-2.5 shadow-card">
        <Text className="text-[15px] leading-6 text-white">{message.content}</Text>
      </View>
    );
  }

  return (
    <View className="w-full flex-row items-start gap-2">
      <Avatar />
      <View className="flex-1 items-start gap-2">
        <View className="max-w-full rounded-2xl rounded-tl-sm border border-hairline bg-surface px-4 py-2.5 shadow-card">
          <MessageContent content={message.content} />
        </View>
        {message.searchAction ? (
          <View className="w-full">
            <AssistantSearchStrip action={message.searchAction} onNavigate={onNavigate} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
