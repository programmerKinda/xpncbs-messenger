import { cloneElement } from 'react'

interface SettingItemProps {
  icon: React.ReactElement<any, any>
  title: string
  subtitle?: string
  large?: boolean
  className?: string
}

export default function SettingItem({
  icon,
  title,
  subtitle,
  large = false,
  className = '',
}: SettingItemProps) {
  const iconElement = cloneElement(icon as any, { size: large ? 64 : 32 })

  return (
    <div className={`setting-item ${large ? 'setting-item--large' : ''} ${className}`}>
      <span className="setting-item__icon">{iconElement}</span>
      <div className="setting-item__info">
        <h2 className={`setting-item__title ${large ? 'text-2xl' : ''}`}>
          {title}
        </h2>
        {subtitle && <span className="setting-item-subtitle">{subtitle}</span>}
      </div>
    </div>
  )
}