import { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import Dropdown from './Dropdown'
import type { ReactNode } from 'react'
import { useDropdownStore } from '@/controllers/dropdownController'
interface DropdownProps {
  id: string
  items: ReactNode[]
  valueSelector: string
  search?: boolean
  width?: string
  className?: string
  defaultValue?: string
  onChange?: (value: string) => void
  buttonClassName?: string
  wrapClassname?: string
}
const DropdownWithArrow = ({
  id,
  items,
  valueSelector,
  search,
  width,
  className,
  defaultValue,
  onChange,
  buttonClassName = 'flex items-center justify-between w-full h-full',
  wrapClassname = 'w-full h-full',
}: DropdownProps) => {
  const { isOpen } = useDropdownStore()
  const selectedValue = useDropdownStore((state) => state.values[id])
  const setValue = useDropdownStore((state) => state.setValue)
  const initializedRef = useRef(false)
  const previousValueRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      previousValueRef.current = defaultValue ?? selectedValue
      if (defaultValue !== undefined && selectedValue !== defaultValue) {
        setValue(id, defaultValue)
      }
      return
    }

    if (selectedValue === previousValueRef.current) return
    previousValueRef.current = selectedValue
    if (selectedValue && selectedValue !== 'Не выбрано') onChange?.(selectedValue)
  }, [defaultValue, id, onChange, selectedValue, setValue])

  return (
    <Dropdown
      id={id}
      items={items}
      valueSelector={valueSelector}
      buttonClassName={buttonClassName}
      wrapClassname={wrapClassname}
      flip={true}
      search={search}
      width={width ?? '100%'}
      className={className}
      dropdownBtnContent={
        <ChevronDown
          className={`auth-field__chevron dropdown-arrow ${isOpen[id] ? 'open' : ''}`}
          size={22}
          strokeWidth={1.6}
        />
      }
    />
  )
}
export default DropdownWithArrow
