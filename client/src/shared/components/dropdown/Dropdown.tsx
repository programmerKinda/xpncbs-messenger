import { PopupProvider } from '../PopupProvider'
import { useState } from 'react'
import { usePopupStore } from '@/controllers/popupController';
import { renderToStaticMarkup } from 'react-dom/server';
interface DropdownProps {
  items: React.ReactNode[]
  valueSelector: string
  defaultValue?: string
}
interface DropdownItemProps {
  children: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLLIElement>) => void
}

const DropdownItem = ({ children, onClick }: DropdownItemProps) => {
  return (
    <li className='cursor-pointer' onClick={onClick}>
      {children}
    </li>
  )
}
const Dropdown = ({items, defaultValue,valueSelector }: DropdownProps) => {
  const [value, setValue] = useState(defaultValue ? defaultValue : 'Не выбрано')
  const {onClose} = usePopupStore()
   const choiceItem = (
    event: React.MouseEvent<HTMLLIElement>
  ) => {
    const element = event.currentTarget.querySelector(valueSelector)

    if (element) {
      setValue(element.textContent?.trim() ?? '')
    }
    onClose()
  }
  return (
    <div className="dropdown relative">
      <PopupProvider popup={<ul className='h-[300px] overflow-auto p-2'>
        {items.map((item)=>(
            <DropdownItem key={renderToStaticMarkup(item)} onClick={choiceItem}>{item}</DropdownItem>
        ))}
      </ul>} placement="bottom" align="center">
        <button className="">{value}</button>
      </PopupProvider>
    </div>
  )
}
export default Dropdown