import { BiSolidMessageDetail } from 'react-icons/bi'
import { FaUsers } from 'react-icons/fa'
import { IoMdSettings } from 'react-icons/io'
import { FaPhoneVolume } from 'react-icons/fa6'

export const sidebarElements = [
  {
    icon: <BiSolidMessageDetail size={35} />,
    text: 'Чаты',
  },
  { icon: <FaUsers size={35} />, text: 'Контакты' },
  { icon: <FaPhoneVolume size={25} />, text: 'Звонки' },
  { icon: <IoMdSettings size={35} />, text: 'Настройки' },
]
