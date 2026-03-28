import { Settings, UserPen, MessageCircle } from 'lucide-react'
export default function AsideMain() {
  const asideElements = [
    { icon: <UserPen size={35} />, text: 'Profile' },
    { icon: <Settings size={35} />, text: 'settings' },
    {
      icon: <MessageCircle size={35} />,
      text: 'Chats',
    },
  ]
  return (
    <>
      <aside className="aside__main">
        <ul className="aside__main-ul">
          {asideElements.map((el) => (
            <li className="aside__main-ul-li">{el.icon}</li>
          ))}
        </ul>
      </aside>
    </>
  )
}
