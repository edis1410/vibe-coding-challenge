export interface ExpenseCategory {
  id: string
  name: string
  emoji: string
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'food-dining', name: 'Food & Dining', emoji: '🍕' },
  { id: 'groceries', name: 'Groceries', emoji: '🛒' },
  { id: 'transportation', name: 'Transportation', emoji: '🚗' },
  { id: 'tickets', name: 'Tickets & Events', emoji: '🎫' },
  { id: 'rent', name: 'Rent & Utilities', emoji: '🏠' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️' },
  { id: 'healthcare', name: 'Healthcare', emoji: '🏥' },
  { id: 'pharmacy', name: 'Pharmacy', emoji: '💊' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
  { id: 'travel', name: 'Travel & Accommodation', emoji: '✈️' },
  { id: 'phone', name: 'Phone & Internet', emoji: '📱' },
  { id: 'utilities', name: 'Electricity & Gas', emoji: '⚡' },
  { id: 'education', name: 'Education', emoji: '🎓' },
  { id: 'fitness', name: 'Sports & Fitness', emoji: '🏋️' },
  { id: 'personal-care', name: 'Personal Care', emoji: '💇' },
  { id: 'pet-care', name: 'Pet Care', emoji: '🐕' },
  { id: 'maintenance', name: 'Maintenance & Repairs', emoji: '🔧' },
  { id: 'gifts', name: 'Gifts', emoji: '🎁' },
  { id: 'business', name: 'Business', emoji: '💼' },
  { id: 'books', name: 'Books & Supplies', emoji: '📚' },
  { id: 'coffee', name: 'Coffee & Snacks', emoji: '☕' },
  { id: 'gaming', name: 'Gaming', emoji: '🎮' },
  { id: 'taxi', name: 'Taxi & Ride Share', emoji: '🚕' },
  { id: 'hotel', name: 'Hotel', emoji: '🏨' },
  { id: 'other', name: 'Other', emoji: '🎉' },
]

export function getAllCategories(): ExpenseCategory[] {
  return EXPENSE_CATEGORIES
}

export function getCategoryById(id: string): ExpenseCategory | undefined {
  return EXPENSE_CATEGORIES.find((cat) => cat.id === id)
}

export function getCategoryEmoji(id: string): string {
  const category = getCategoryById(id)
  return category?.emoji || '🎉'
}

export function getCategoryName(id: string): string {
  const category = getCategoryById(id)
  return category?.name || 'Other'
}

export function getDefaultCategory(): ExpenseCategory {
  return EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]
}

