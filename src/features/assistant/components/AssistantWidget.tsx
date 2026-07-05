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

import { useAssistantChat } from '../hooks';
import type { ChatMessage } from '../types';
import { AssistantSearchStrip } from './AssistantSearchStrip';
import { MessageContent } from './MessageContent';
import { TypingDots } from './TypingDots';

/** Routes where the assistant should stay hidden (auth modal), mirroring the web. */
const HIDDEN_ROUTES = /^\/(sign-in|sign-up|forgot-password)/;

/**
 * The "GOT AI Assistant" — a floating chat button plus a full chat panel, mounted
 * globally so it's reachable from every screen (exactly like the website widget).
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
  const { messages, send, isTyping } = useAssistantChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const scrollToEnd = () => scrollRef.current?.scrollToEnd({ animated: true });

  const handleSend = () => {
    const text = input;
    if (!text.trim() || isTyping) return;
    setInput('');
    send(text);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-slate-900" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center gap-3 border-b border-white/10 px-4 pb-3 pt-2">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-500">
            <Text className="text-xl">🤖</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-white">GOT AI Assistant</Text>
            <View className="flex-row items-center gap-1.5">
              <View className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
              <Text className="text-[10px] font-medium uppercase tracking-wide text-yellow-400">
                Agent Online
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close assistant"
            hitSlop={8}
            onPress={onClose}
            className="rounded-full border border-white/10 p-2 active:bg-white/10"
          >
            <Ionicons name="close" size={20} color="#cbd5e1" />
          </Pressable>
        </View>

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
          >
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} onNavigate={onClose} />
            ))}
            {isTyping ? (
              <View className="max-w-[88%] self-start rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3">
                <TypingDots />
              </View>
            ) : null}
          </ScrollView>

          {/* Composer */}
          <View
            className="flex-row items-center gap-2 border-t border-white/10 bg-slate-900 px-3 py-3"
            style={{ paddingBottom: insets.bottom + 8 }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Search hotels, find guides…"
              placeholderTextColor="#94a3b8"
              className="flex-1 rounded-full bg-white/10 px-4 py-2.5 text-[15px] text-white"
              returnKeyType="send"
              onSubmitEditing={handleSend}
              editable={!isTyping}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              onPress={handleSend}
              disabled={!input.trim() || isTyping}
              className={[
                'h-11 w-11 items-center justify-center rounded-full',
                !input.trim() || isTyping ? 'bg-white/10' : 'bg-brand-500 active:bg-brand-600',
              ].join(' ')}
            >
              <Ionicons name="send" size={18} color={!input.trim() || isTyping ? '#64748b' : '#fff'} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
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
      <View className="max-w-[82%] self-end rounded-2xl rounded-tr-sm bg-brand-500 px-4 py-2.5">
        <Text className="text-[15px] leading-6 text-white">{message.content}</Text>
      </View>
    );
  }

  return (
    <View className="w-full items-start">
      <View className="max-w-[88%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-2.5">
        <MessageContent content={message.content} />
      </View>
      {message.searchAction ? (
        <View className="w-full pl-1">
          <AssistantSearchStrip action={message.searchAction} onNavigate={onNavigate} />
        </View>
      ) : null}
    </View>
  );
}
