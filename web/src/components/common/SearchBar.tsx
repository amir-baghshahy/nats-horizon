// ============================================================================
// SearchBar Component
// ============================================================================

import { Search } from 'lucide-react'

interface SearchBarProps {
  /**
   * Current search value
   */
  value: string

  /**
   * Search change callback
   */
  onChange: (value: string) => void

  /**
   * Placeholder text
   * @default "Search..."
   */
  placeholder?: string

  /**
   * Additional className
   */
  className?: string
}

/**
 * Reusable search bar component
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input w-full pl-10"
      />
    </div>
  )
}
