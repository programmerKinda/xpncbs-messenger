import { useNavigate, useLocation } from 'react-router-dom'
interface SidebarItemProps {
  icon: React.ReactNode
  text: string
  path: string
}
export const SideBarItem: React.FC<SidebarItemProps> = ({ icon, text, path }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isActive = path === '/'
    ? pathname === '/' || pathname.startsWith('/chat/')
    : pathname === path
  return (
    <li
      className={`sidebar__item-container ${isActive ? 'active' : ''}`}
      onClick={() => {
        navigate(path)
      }}
    >
      <div className="sidebar__item" title={text}>
        {icon}
        <span className="sidebar__item-text">{text}</span>
      </div>
    </li>
  )
}
