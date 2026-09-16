import { MessageCircle, Users, Settings, Phone } from 'lucide-react'

export const sidebarElements = [
  {
    icon: <MessageCircle size={28} strokeWidth={2} />,
    text: 'Чаты',
    path: '/',
  },
  { icon: <Users size={28} strokeWidth={2} />, text: 'Контакты', path: '/contacts' },
  { icon: <Phone size={26} strokeWidth={2} />, text: 'Звонки', path: '/calls' },
  { icon: <Settings size={28} strokeWidth={2} />, text: 'Настройки', path: '/settings' },
]
