import { Linking, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { env } from '@/config/env';

/**
 * Minimal markdown renderer for assistant replies. The web widget renders the
 * assistant's `content` with `react-markdown`; the replies use a small subset —
 * `**bold**`, `*italic*`, `[text](url)` links, and `-`/`1.` lists — so we render
 * that subset natively instead of pulling in a heavy dependency.
 */

type Segment = { text: string; bold?: boolean; italic?: boolean; url?: string };

/** Split a line into styled inline segments (bold / italic / links). */
function parseInline(line: string): Segment[] {
  const segments: Segment[] = [];
  // Order matters: match bold before italic so `**x**` isn't caught as italic.
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) segments.push({ text: line.slice(lastIndex, match.index) });
    if (match[1] != null) segments.push({ text: match[1], bold: true });
    else if (match[2] != null) segments.push({ text: match[2], url: match[3] });
    else if (match[4] != null) segments.push({ text: match[4], italic: true });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < line.length) segments.push({ text: line.slice(lastIndex) });
  return segments;
}

/** Open a link the way the web does — externally, resolving site-relative paths. */
function openLink(url: string) {
  const abs = /^https?:\/\//.test(url)
    ? url
    : `${env.webUrl.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
  WebBrowser.openBrowserAsync(abs).catch(() => Linking.openURL(abs));
}

function InlineText({ segments }: { segments: Segment[] }) {
  return (
    <Text className="text-[15px] leading-6 text-ink">
      {segments.map((seg, i) => {
        if (seg.url) {
          return (
            <Text
              key={i}
              onPress={() => openLink(seg.url!)}
              className="font-semibold text-accent-600 underline"
            >
              {seg.text}
            </Text>
          );
        }
        return (
          <Text
            key={i}
            className={[seg.bold ? 'font-bold' : '', seg.italic ? 'italic' : ''].join(' ')}
          >
            {seg.text}
          </Text>
        );
      })}
    </Text>
  );
}

export function MessageContent({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <View className="gap-1">
      {lines.map((raw, index) => {
        const line = raw.trimEnd();
        if (!line.trim()) return <View key={index} className="h-1" />;

        const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
        if (bullet) {
          return (
            <View key={index} className="flex-row gap-2 pl-1">
              <Text className="text-[15px] leading-6 text-accent-500">•</Text>
              <View className="flex-1">
                <InlineText segments={parseInline(bullet[1])} />
              </View>
            </View>
          );
        }

        const numbered = line.match(/^\s*(\d+)\.\s+(.*)$/);
        if (numbered) {
          return (
            <View key={index} className="flex-row gap-2 pl-1">
              <Text className="text-[15px] leading-6 text-accent-500">{numbered[1]}.</Text>
              <View className="flex-1">
                <InlineText segments={parseInline(numbered[2])} />
              </View>
            </View>
          );
        }

        return <InlineText key={index} segments={parseInline(line)} />;
      })}
    </View>
  );
}
