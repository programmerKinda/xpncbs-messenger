import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

interface SettingListItemProps {
  icon?: ReactNode
  title: string
  description?: string
  onClick?: () => void
  showArrow?: boolean
  className?: string
}

export default function SettingListItem({
  icon,
  title,
  description,
  onClick,
  showArrow = true,
  className = '',
}: SettingListItemProps) {
  return (
    <div
      className={`setting-list-item ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && <div className="setting-list-item__icon">{icon} </div>}

      <div className="setting-list-item__content">
        <h2 className="setting-list-item__title">{title}</h2>

        {description && <p className="setting-list-item__description">{description}</p>}
      </div>

      {showArrow && <ChevronRight className="setting-list-item__arrow" size={20} strokeWidth={2} />}
    </div>
  )
}
