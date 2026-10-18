import DropdownWithArrow from '@/shared/components/dropdown/DropdownWithArrow'
import type { ReactNode } from 'react'

interface SettingSecurityItemProps {
  id: string
  title: string | ReactNode
  list: string[]
}

export default function SettingSecurityItem({ id, title, list }: SettingSecurityItemProps) {
  return (
    <li className="setting-page-secure__item">
      <div className="setting-page-secure__item-title">{title}</div>
      <DropdownWithArrow
        id={id}
        items={list.map((item) => (
          <span className="setting-dropdown-option" key={item}>
            {item}
          </span>
        ))}
        valueSelector=".setting-dropdown-option"
        defaultValue="Не выбрано"
        buttonClassName="setting-select"
        wrapClassname="setting-select-dropdown"
      />
    </li>
  )
}
