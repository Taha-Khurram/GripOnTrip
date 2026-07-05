import { Fragment } from 'react';
import { Text, View } from 'react-native';

/**
 * Minimal Markdown renderer for product descriptions.
 *
 * Products on gripontrip.com store their description as Markdown (`#` headings,
 * `**bold**`, `* ` bullets, `---` rules). We render the common subset natively
 * rather than pulling in a Markdown dependency — matching how the web displays
 * the same text.
 */

/** Render `**bold**` spans inline within a line of text. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <Text key={i} className="font-bold text-neutral-900 dark:text-white">
            {part.slice(2, -2)}
          </Text>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function ProductDescription({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');

  return (
    <View className="gap-2">
      {lines.map((raw, i) => {
        const line = raw.trim();
        if (!line) return null;

        // Horizontal rule
        if (/^---+$/.test(line)) {
          return <View key={i} className="my-1 h-px bg-neutral-100 dark:bg-neutral-800" />;
        }

        // Headings (#, ##, ###)
        const heading = /^(#{1,3})\s+(.*)$/.exec(line);
        if (heading) {
          const level = heading[1].length;
          const content = heading[2];
          const size = level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm';
          return (
            <Text key={i} className={`${size} font-bold text-neutral-900 dark:text-white`}>
              <Inline text={content} />
            </Text>
          );
        }

        // Bullets (* or -)
        const bullet = /^[*-]\s+(.*)$/.exec(line);
        if (bullet) {
          return (
            <View key={i} className="flex-row gap-2 pl-1">
              <Text className="text-neutral-400">•</Text>
              <Text className="flex-1 leading-6 text-neutral-700 dark:text-neutral-300">
                <Inline text={bullet[1]} />
              </Text>
            </View>
          );
        }

        // Paragraph
        return (
          <Text key={i} className="leading-6 text-neutral-700 dark:text-neutral-300">
            <Inline text={line} />
          </Text>
        );
      })}
    </View>
  );
}
