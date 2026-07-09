interface SidebarItemProps {
  icon: React.ReactNode
  text: string
}
export const SideBarItem: React.FC<SidebarItemProps> = ({ icon, text }) => {
  return (
    <li className="sidebar__item-container">
      
      <div className="sidebar__item" title={text}>
        {icon}
        <span className="sidebar__item-text">{text}</span>
      </div>
      
    </li>
  )
}
