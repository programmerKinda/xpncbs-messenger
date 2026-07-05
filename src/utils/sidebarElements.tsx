import { BiSolidMessageDetail } from "react-icons/bi";
import { FaUser } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";

export const sidebarElements = [
    {
    icon: <BiSolidMessageDetail size={35} />,
    text: 'Chats',
  },
  { icon: <FaUser size={30} />, text: 'Profile' },
  { icon: <IoMdSettings size={35} />, text: 'settings' },

]
