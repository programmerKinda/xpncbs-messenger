import CommonSidebar from '@/shared/components/CommonSidebar'
import SettingItem from '@/views/settings.tsx/settingItem'
import { FaUnlockAlt, FaUserCircle } from 'react-icons/fa'

export default function Settings() {
  return (
    <>
      <CommonSidebar
        title="Настройки"
        resize={true}
        bodyContent={
          <>
            {/* Верхний большой элемент профиля пользователя (выделён) */}
            <SettingItem
              icon={<FaUserCircle />}
              title={'Иван Иванов'}
              subtitle={'Online • ivan@example.com'}
              large
              className="setting-item--highlight"
            />

            {/* Обычные элементы */}
            <SettingItem
              icon={<FaUnlockAlt size={30} />}
              title="Конфидециальность"
              subtitle="Блокировка, исчезающие сообщения"
            />
          </>
        }
      />
    </>
  )
}
