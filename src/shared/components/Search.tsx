import { IoSearch } from "react-icons/io5";
import { useRef, useState } from 'react'

export const SearchInput = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  return (
    <label className={`search ${isFocused ? 'search--focused' : ''}`}>
      <IoSearch size={25} className="flex-shrink-0"/>
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
