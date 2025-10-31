export interface EmojiCategory {
  name: string
  emojis: string[]
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Popular',
    emojis: ['💰', '✈️', '🍕', '🏠', '🎉', '💼', '🎓', '⚽', '🎮', '🌴', '🍺', '🎬'],
  },
  {
    name: 'Finance & Money',
    emojis: ['💰', '💵', '💳', '💸', '🏦', '💎', '🪙', '💷'],
  },
  {
    name: 'Travel & Places',
    emojis: ['✈️', '🗺️', '🏖️', '🏔️', '🚗', '🏝️', '🗼', '🏛️', '🚂', '🚢', '🗽', '🎡'],
  },
  {
    name: 'Food & Dining',
    emojis: ['🍕', '🍔', '🍱', '🍜', '☕', '🍰', '🥗', '🍷', '🍺', '🍣', '🍝', '🌮'],
  },
  {
    name: 'Activities & Events',
    emojis: ['🎉', '🎊', '🎈', '🎭', '🎪', '🎨', '🎸', '🎮', '🎬', '🎤', '🎯', '🎲'],
  },
  {
    name: 'Home & Living',
    emojis: ['🏠', '🏡', '🛋️', '🔑', '🚪', '🏢', '🏪', '🏬'],
  },
  {
    name: 'Work & Education',
    emojis: ['💼', '📚', '🎓', '✏️', '📊', '💻', '📱', '⌨️', '🖥️', '📝'],
  },
  {
    name: 'Sports & Fitness',
    emojis: ['⚽', '🏃', '🚴', '⛷️', '🏋️', '🎾', '🏀', '⛳', '🏊', '🧘'],
  },
  {
    name: 'Nature & Animals',
    emojis: ['🌳', '🌸', '🐶', '🐱', '🦁', '🌊', '🌈', '⭐', '🌙', '☀️'],
  },
]

export function getDefaultEmoji(): string {
  return '💰'
}

export function getAllEmojis(): string[] {
  return EMOJI_CATEGORIES.flatMap((category) => category.emojis)
}


