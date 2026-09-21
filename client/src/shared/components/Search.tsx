import { Search } from 'lucide-react'
import { useRef, useState } from 'react'

export const SearchInput = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  return (
    <label className={`search ${isFocused ? 'search--focused' : ''}`}>
      <Search size={20} strokeWidth={2} className="flex-shrink-0" />
      <input
        type="text"
        placeholder="Поиск"
        className="search__input"
        ref={inputRef}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </label>
  )
}
