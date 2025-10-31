import { getAllCategories } from '@/lib/categories'

interface CategorySelectorProps {
  value: string
  onChange: (category: string) => void
  required?: boolean
}

export default function CategorySelector({ value, onChange, required = true }: CategorySelectorProps) {
  const categories = getAllCategories()

  return (
    <div>
      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
        Category {required && '*'}
      </label>
      <select
        id="category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.emoji} {category.name}
          </option>
        ))}
      </select>
    </div>
  )
}

