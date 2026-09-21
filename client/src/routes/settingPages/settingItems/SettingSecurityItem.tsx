import SelectList from '@/shared/components/SelectList'
import type { ReactNode } from 'react'

interface SettingSecurityItemProps {
  title: string | ReactNode
  list: string[]
}

export default function SettingSecurityItem({ title, list }: SettingSecurityItemProps) {
  return (
    <li className="setting-page-secure__item">
      <div className="setting-page-secure__item-title">{title}</div>
      <SelectList list={list} />{' '}
    </li>
  )
}
