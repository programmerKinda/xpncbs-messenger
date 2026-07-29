import { BiSolidMessageDetail } from 'react-icons/bi'
import { FaUsers } from 'react-icons/fa'
import { IoMdSettings } from 'react-icons/io'
import { FaPhoneVolume } from 'react-icons/fa6'
import { HiPhone } from "react-icons/hi2";

export const sidebarElements = [
  {
    icon: <BiSolidMessageDetail size={35} />,
    text: 'Чаты',
    path: '/',
  },
  { icon: <FaUsers size={35} />, text: 'Контакты', path: '/contacts' },
  { icon: <HiPhone  size={25} />, text: 'Звонки', path: '/calls' },
  { icon: <IoMdSettings size={35} />, text: 'Настройки', path: '/settings' },
]
