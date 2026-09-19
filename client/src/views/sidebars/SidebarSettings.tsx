import CommonSidebar from '@/shared/components/CommonSidebar'
import SettingItem from '@/views/settings/settingItem'
import UserAvatar from '@/views/user/UserAvatar'
import { Bell, Keyboard, LockKeyhole, LogOut, MessageCircle } from 'lucide-react'

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
              path="/"
            />

            {/* Конфиденциальность */}
            <SettingItem
              icon={<LockKeyhole size={22} strokeWidth={2} />}
              title="Конфиденциальность"
              path="secure"
            />

            {/* Чаты */}
            <SettingItem
              icon={<MessageCircle size={22} strokeWidth={2} />}
              title="Чаты"
              path="chats"
            />

            {/* Уведомления */}
            <SettingItem
              icon={<Bell size={22} strokeWidth={2} />}
              title="Уведомления"
              path="notification"
            />

            {/* Сочетания клавиш */}
            <SettingItem
              icon={<Keyboard size={22} strokeWidth={2} />}
              title="Сочетания клавиш"
              path="hotKeys"
            />

            {/* Выход */}
            <SettingItem
              icon={<LogOut size={22} strokeWidth={2} color="#ef4444" />}
              title="Выход"
              path="login"
            />
          </>
        }
      />
    </>
  )
}
