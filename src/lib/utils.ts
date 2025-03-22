
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert GitHub emoji format to native emoji
 * Replaces strings like ":emoji:" with the corresponding native emoji
 */
export function convertEmojiText(text: string): string {
  if (!text) return '';
  
  // Common GitHub emojis mapping
  const emojiMap: Record<string, string> = {
    'mega': '📣',
    'speech_balloon': '💬',
    'bulb': '💡',
    'ballot_box': '🗳️',
    'pray': '🙏',
    'raised_hands': '🙌',
    'rocket': '🚀',
    'bug': '🐛',
    'question': '❓',
    'eyes': '👀',
    'heart': '❤️',
    'tada': '🎉',
    'white_check_mark': '✅',
    'x': '❌',
    'warning': '⚠️',
    'memo': '📝',
    'thinking': '🤔',
    'thumbsup': '👍',
    'thumbsdown': '👎',
    'exclamation': '❗',
    'bell': '🔔',
    'bookmark': '🔖',
    'fire': '🔥',
    'zap': '⚡',
    'star': '⭐',
    'sparkles': '✨',
    'gem': '💎',
    'computer': '💻',
    'gear': '⚙️',
    'wrench': '🔧',
    'lock': '🔒',
    'unlock': '🔓',
    'key': '🔑',
    'link': '🔗',
    'package': '📦',
    'gift': '🎁',
    'calendar': '📅',
    'clock': '🕒',
    'hourglass': '⌛',
    'telescope': '🔭',
    'microscope': '🔬',
    'books': '📚',
    'book': '📖',
    'inbox': '📥',
    'outbox': '📤',
    'email': '📧',
    'telephone': '☎️',
    'mobile_phone': '📱',
    'camera': '📷',
    'video_camera': '📹',
    'microphone': '🎤',
    'headphones': '🎧',
    'loud_sound': '🔊',
    'mute': '🔇',
    'chart': '📊',
    'newspaper': '📰',
    'loudspeaker': '📢',
    'clipboard': '📋',
    'memo': '📝',
    'pushpin': '📌',
    'paperclip': '📎',
    'closed_book': '📕',
    'green_book': '📗',
    'blue_book': '📘',
    'orange_book': '📙',
    'notebook': '📓',
    'file_folder': '📁',
    'open_file_folder': '📂',
    'card_index': '📇',
    'chart_with_upwards_trend': '📈',
    'chart_with_downwards_trend': '📉',
    'bar_chart': '📊',
    'notepad_spiral': '🗒️',
    'calendar': '📆',
    'hammer': '🔨',
    'sos': '🆘',
    'globe': '🌐',
    'house': '🏠',
    'office': '🏢',
    'mailbox': '📫',
    'shield': '🛡️',
  };
  
  // Match :emoji: pattern and replace with actual emoji if found in map
  return text.replace(/:([a-z0-9_+-]+):/g, (match, emojiName) => {
    return emojiMap[emojiName] || match;
  });
}
