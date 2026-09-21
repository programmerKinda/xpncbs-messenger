import type { ReactNode } from 'react'
import SettingSecurityItem from './SettingSecurityItem'

interface SettingSecuritySectionProps {
  title?: string
  headerContent?: ReactNode
  bodyBg: boolean
  items: {
    title: string
    list: string[]
  }[]
}

export default function SettingSecuritySection({
  title,
  headerContent,
  bodyBg,
  items,
}: SettingSecuritySectionProps) {
  return (
    <div
      className={`setting-page-secure__body setting-page-secure__section ${bodyBg ? 'setting-page-secure__section--card' : ''}`}
    >
      <div className="setting-page-secure__section-header">
        {title && <h2 className="setting-page-secure__title">{title}</h2>}
        {headerContent && headerContent}
      </div>

      <ul className="setting-page-secure__list">
        {items.map((item) => (
          <SettingSecurityItem key={item.title} title={item.title} list={item.list} />
        ))}
      </ul>
    </div>
  )
}
