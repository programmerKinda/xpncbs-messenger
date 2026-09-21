import React, { useEffect } from 'react'
import { PopupProvider } from '../PopupProvider'
import { type ReactNode, type UIEvent, useState } from 'react'
import { usePopupStore } from '@/controllers/popupController'
import { useDropdownStore } from '@/controllers/dropdownController'
import { useRef } from 'react'
interface DropdownProps {
  id: string
  items: ReactNode[]
  valueSelector: string
  buttonClassName?: string
  wrapClassname?: string
  flip?: boolean
  dropdownBtnContent?: ReactNode
  search?: boolean
  width?:string
  className?:string
}

interface DropdownListProps {
  items: ReactNode[]
  onChoice: (event: React.MouseEvent<HTMLLIElement>) => void
}

const getNodeText = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getNodeText).join(' ')
  if (React.isValidElement<{ children?: ReactNode }>(node)) {
    return getNodeText(node.props.children)
  }
  return ''
}

const DropdownList = ({ items, onChoice }: DropdownListProps) => {
  const [visibleItemsCount, setVisibleItemsCount] = useState(30)

  useEffect(() => {
    setVisibleItemsCount(30)
  }, [items])

  const handleScroll = (event: UIEvent<HTMLUListElement>) => {
    const list = event.currentTarget
    const reachedBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 40

    if (reachedBottom && visibleItemsCount < items.length) {
      setVisibleItemsCount((count) => Math.min(count + 30, items.length))
    }
  }

  return (
    <ul className="max-h-[250px] overflow-auto p-2" onScroll={handleScroll}>
      {items.slice(0, visibleItemsCount).map((item, index) => (
        <li key={index} className="cursor-pointer" onClick={onChoice}>
          {item}
        </li>
      ))}
    </ul>
  )
}

const Dropdown = ({
  id,
  items,
  valueSelector,
  buttonClassName,
  wrapClassname,
  flip,
  dropdownBtnContent,
  search,
  width,
  className
}: DropdownProps) => {
  const { values, setValue } = useDropdownStore()
  const { isOpen, setIsOpen } = useDropdownStore()

  const { onClose, updatePopup } = usePopupStore()
  const [searchValue, setSearchValue] = useState(values[id] ?? '')
  const filteredItems = search
    ? items.filter((item) =>
        getNodeText(item).toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
      )
    : items

  const choiceItem = (event: React.MouseEvent<HTMLLIElement>) => {
    const element = event.currentTarget.querySelector(valueSelector)

    if (element) {
      const selectedValue = element.textContent?.trim() ?? ''
      setSearchValue(selectedValue)
      setValue(id, selectedValue)
    }
    onClose()
    setIsOpen(id, false)
  }
  const toggle = () => setIsOpen(id, !isOpen[id])
  const valueRef = useRef<HTMLSpanElement | null>(null)
  const wasOpenRef = useRef(false)
  const initialValueRef = useRef<string | undefined>(undefined)
  const inputChangedRef = useRef(false)
  const handleInput = (event: React.FormEvent<HTMLSpanElement>) => {
    inputChangedRef.current = true
    setSearchValue(event.currentTarget.textContent ?? '')
  }

  useEffect(() => {
    if (!isOpen[id] || !search || !valueRef.current) return

    const element = valueRef.current
    initialValueRef.current = values[id]
    inputChangedRef.current = false
    setSearchValue('')
    element.focus()

    const selection = window.getSelection()
    const range = document.createRange()

    range.selectNodeContents(element)
    range.collapse(false)

    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [isOpen[id], search, id, values])

  useEffect(() => {
    if (isOpen[id] && search) {
      updatePopup(<DropdownList items={filteredItems} onChoice={choiceItem} />)
    }
  }, [searchValue, isOpen[id], search, updatePopup])

  useEffect(() => {
    if (isOpen[id]) {
      wasOpenRef.current = true
      return
    }

    if (!search || !wasOpenRef.current) return

    const selectedValue = values[id]
    const initialValue = initialValueRef.current
    if (!inputChangedRef.current && initialValue && initialValue !== 'Не выбрано') {
      setSearchValue(initialValue)
      setValue(id, initialValue)
      wasOpenRef.current = false
      return
    }

    const hasValidValue =
      searchValue.trim() !== '' &&
      selectedValue !== undefined &&
      selectedValue !== 'Не выбрано' &&
      searchValue.trim() === selectedValue

    if (!hasValidValue) {
      setSearchValue('')
      setValue(id, undefined)
      if (valueRef.current) valueRef.current.textContent = 'Не выбрано'
    }

    wasOpenRef.current = false
  }, [isOpen[id], search, searchValue, values, id, setValue])

  return (
    <PopupProvider
      popup={<DropdownList items={filteredItems} onChoice={choiceItem} />}
      placement="bottom"
      align="center"
      flip={flip}
      width={width}
      popupClassName={className}
      wrapClassname={wrapClassname}
    >
      <button className={buttonClassName} onClick={toggle}>
        <span
          className="dropdown-value outline-none"
          ref={valueRef}
          contentEditable={search && isOpen[id]}
          onInput={handleInput}
          suppressContentEditableWarning
        >
          {search && isOpen[id] ? null : (values[id] ?? 'Не выбрано')}
        </span>
        {dropdownBtnContent}
      </button>
    </PopupProvider>
  )
}
export default Dropdown
