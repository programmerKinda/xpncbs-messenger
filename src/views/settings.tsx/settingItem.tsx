import { cloneElement } from 'react'
import { useNavigate } from 'react-router-dom'

interface SettingItemProps {
  icon: React.ReactElement<any, any>
  title: string
  subtitle?: string
  large?: boolean
  className?: string
  path: string
}

export default function SettingItem({
  icon,
  title,
  subtitle,
  large = false,
  className = '',
  path
}: SettingItemProps) {
  const iconElement = cloneElement(icon as any, { size: large ? 56 : 28 })
  const navigate = useNavigate()
  return (
    <div className={`setting-item ${large ? 'setting-item--large' : ''} ${className}`} onClick={()=>navigate(`settings/${path}`)}>
      <span className={`setting-item__icon ${large ? '' : 'p-4'} ${className}`}>{iconElement}</span>
      <div className="setting-item__info">
        <h2 className={`setting-item__title ${large ? 'text-xl' : 'text-base'}`}>{title}</h2>
        {subtitle && (
          <span className={`setting-item__icon ${large ? 'text-sm' : 'text-xs'} ${className}`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}
