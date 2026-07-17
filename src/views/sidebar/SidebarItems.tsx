import { SideBarItem } from './SidebarItem'
import { sidebarElements } from '../../utils/sidebarElements'
export const SidebarItems = () => {
  return (
    <ul className="sidebar__items">
      {sidebarElements.map((el) => (
        <SideBarItem key={el.text} icon={el.icon} text={el.text} path={el.path}/>
      ))}
    </ul>
  )
}
