import React from 'react'
import { PopupProvider } from '../PopupProvider'
import { isValidElement, type ReactNode, type UIEvent, useEffect, useState } from 'react'
import { usePopupStore } from '@/controllers/popupController'
interface DropdownProps {
  items: ReactNode[]
  valueSelector: string
  buttonClassName?: string
  wrapClassname?: string
  flip?: boolean
  defaultValue?: string | ReactNode
  setDefaultValue?: (defaultValue: string) => void
}
interface DropdownItemProps {
  children: ReactNode
  onClick?: (event: React.MouseEvent<HTMLLIElement>) => void
}
interface DropdownListProps {
  items: ReactNode[]
  onChoice: (event: React.MouseEvent<HTMLLIElement>) => void
}

const getTextContent = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return ''
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join('')
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getTextContent(node.props.children)
  }

  return ''
}

const DropdownItem = ({ children, onClick }: DropdownItemProps) => {
  return (
    <li className="cursor-pointer" onClick={onClick}>
      {children}
    </li>
  )
}

const DropdownList = ({ items, onChoice }: DropdownListProps) => {
  const [visibleItemsCount, setVisibleItemsCount] = useState(30)

  const handleScroll = (event: UIEvent<HTMLUListElement>) => {
    const list = event.currentTarget
    const reachedBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 40

    if (reachedBottom && visibleItemsCount < items.length) {
      setVisibleItemsCount((count) => Math.min(count + 30, items.length))
    }
  }

  return (
    <ul className="h-[300px] overflow-auto p-2" onScroll={handleScroll}>
      {items.slice(0, visibleItemsCount).map((item, index) => (
        <DropdownItem key={index} onClick={onChoice}>
          {item}
        </DropdownItem>
      ))}
    </ul>
  )
}

const Dropdown = ({
  items,
  defaultValue,
  valueSelector,
  buttonClassName,
  wrapClassname,
  flip,
  setDefaultValue,
}: DropdownProps) => {
  const [value, setValue] = useState(typeof defaultValue === 'string' ? defaultValue : null)

  const { onClose } = usePopupStore()
  const choiceItem = (event: React.MouseEvent<HTMLLIElement>) => {
    const element = event.currentTarget.querySelector(valueSelector)

    if (element) {
      if (value) {
        setValue(element.textContent?.trim() ?? '')
      } else {
        setDefaultValue?.(element.textContent?.trim() ?? '')
      }
    }
    onClose()
  }
  useEffect(() => {
    if (!getTextContent(defaultValue).trim()) {
      setDefaultValue?.('Не выбрано')
    }
  }, [defaultValue, setDefaultValue])
  return (
    <PopupProvider
      popup={<DropdownList items={items} onChoice={choiceItem} />}
      placement="bottom"
      align="center"
      flip={flip}
      wrapClassname={wrapClassname}
    >
      <button className={buttonClassName}>{value ? value : defaultValue}</button>
    </PopupProvider>
  )
}
export default Dropdown
