import { ChevronDown } from 'lucide-react'
import Dropdown from './Dropdown'
import type { ReactNode } from 'react'
import { useDropdownStore } from '@/controllers/dropdownController'
interface DropdownProps {
  id: string
  items: ReactNode[]
  valueSelector: string
  search?: boolean
}
const DropdownWithArrow = ({ id, items, valueSelector, search }: DropdownProps) => {
  const { isOpen } = useDropdownStore()
  return (
    <Dropdown
      id={id}
      items={items}
      valueSelector={valueSelector}
      buttonClassName="flex items-center justify-between w-full h-full"
      wrapClassname="w-full h-full"
      flip={false}
      search={search}
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
