import CommonSidebar from '@/shared/components/CommonSidebar'
import SettingItem from '@/views/settings/settingItem'
import UserAvatar from '@/views/user/UserAvatar'
import {
  Bell,
  HardDrive,
  Info,
  Keyboard,
  LockKeyhole,
  LogOut,
  MessageCircle,
  Palette,
  Languages,
  MonitorSmartphone,
  Settings2,
  Accessibility,
} from 'lucide-react'

export default function SidebarSettings() {
  return (
    <>
      <CommonSidebar
        title="Настройки"
        resize={true}
        showSearch={false}
        footerContent={
          <div className="settings-sidebar__footer-content">
            <span className="settings-sidebar__status-dot" />
            <span>Сервис работает</span>
            <span className="settings-sidebar__version">v0.1.0</span>
          </div>
        }
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

            <SettingItem
              icon={<Palette size={22} strokeWidth={2} />}
              title="Внешний вид"
              path="appearance"
            />

            <SettingItem
              icon={<HardDrive size={22} strokeWidth={2} />}
              title="Данные и память"
              path="data"
            />

            <SettingItem
              icon={<Info size={22} strokeWidth={2} />}
              title="О приложении"
              path="about"
            />

            <SettingItem
              icon={<Languages size={22} strokeWidth={2} />}
              title="Язык и регион"
              path="language"
            />

            <SettingItem
              icon={<Accessibility size={22} strokeWidth={2} />}
              title="Доступность"
              path="accessibility"
            />

            <SettingItem
              icon={<MonitorSmartphone size={22} strokeWidth={2} />}
              title="Устройства"
              path="devices"
            />

            <SettingItem
              icon={<Settings2 size={22} strokeWidth={2} />}
              title="Расширенные настройки"
              path="advanced"
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
