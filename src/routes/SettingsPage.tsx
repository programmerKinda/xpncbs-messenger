import CommonSidebar from '@/shared/components/CommonSidebar'
import SettingItem from '@/views/settings.tsx/settingItem';
import { FaUnlockAlt } from "react-icons/fa";
export default function Settings() {
  return (
    <>
      <CommonSidebar
        title="Настройки"
        resize={true}
        bodyContent={
          <>
            <SettingItem icon={ <FaUnlockAlt size={30}/>} title='Конфидециальность' subtitle='Блокировка,исцезающие сообщения'/>
          </>
        }
             
      />
    </>
  )
}
