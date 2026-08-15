import CommonSidebar from '@/shared/components/CommonSidebar'
import SettingItem from '@/views/settings.tsx/settingItem'
import UserAvatar from '@/views/user/UserAvatar'
import {
  FaStore,
  FaKey,
  FaUnlockAlt,
  FaRegCommentAlt,
  FaRegBell,
  FaKeyboard,
  FaRegQuestionCircle,
  FaSignOutAlt,
} from 'react-icons/fa'

export default function SidebarSettings() {
  return (
    <>
      <CommonSidebar
        title="Настройки"
        resize={true}
        bodyContent={
          <>
            {/* Профиль */}
            <SettingItem
              icon={<UserAvatar name="Иван Иванов" avatarURL="" />}
              title="Иван Иванов"
              subtitle="ivan@example.com"
              large
              className="setting-item--highlight"
              path='/'
            />


            {/* Конфиденциальность */}
            <SettingItem
              icon={<FaUnlockAlt size={22} />}
              title="Конфиденциальность"
              subtitle="Заблокированные контакты, исчезающие сообщения"
              path='secure'
            />

            {/* Чаты */}
            <SettingItem
              icon={<FaRegCommentAlt size={22} />}
              title="Чаты"
              subtitle="Тема, обои, настройки чата"
              path='chats'
            />

            {/* Уведомления */}
            <SettingItem
              icon={<FaRegBell size={22} />}
              title="Уведомления"
              subtitle="Сообщения, группы, звуки"
              path='notification'
            />

            {/* Сочетания клавиш */}
            <SettingItem
              icon={<FaKeyboard size={22} />}
              title="Сочетания клавиш"
              subtitle="Быстрые действия"
              path='hotKeys'
            />



            {/* Выход */}
            <SettingItem icon={<FaSignOutAlt size={22} color="#ef4444" />} title="Выход" path='login'/>
          </>
        }
      />
    </>
  )
}
