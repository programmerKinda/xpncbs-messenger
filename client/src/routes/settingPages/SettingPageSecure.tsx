import CommonWindowHeader from '@/shared/components/CommonWindowHeader'
import SettingListItem from './settingItems/SettingListItem'
import SettingSecuritySection from './settingItems/SettingSecuritySection'

import { KeyRound } from 'lucide-react'

export default function SettingPageSecure() {
  const privacyOptions = ['Все', 'Мои контакты', 'Никто']

  const whoCanContactItems = [
    {
      title: 'Найти меня по почте',
      list: privacyOptions,
    },
    {
      title: 'Пригласить в чат',
      list: privacyOptions,
    },
    {
      title: 'Позвонить',
      list: privacyOptions,
    },
  ]

  const personalInfoItems = [
    {
      title: 'Видеть статус «в сети»',
      list: privacyOptions,
    },
    {
      title: 'Видеть мою почту',
      list: privacyOptions,
    },
    {
      title: 'День рождения',
      list: privacyOptions,
    },
    {
      title: 'Фотография профиля',
      list: privacyOptions,
    },
  ]

  return (
    <div className="setting-page setting-page-secure">
      {' '}
      <CommonWindowHeader>
        {' '}
        <h2 className="setting-page__title">Безопасность</h2>{' '}
      </CommonWindowHeader>
      <div className="flex-1 min-h-0 w-full overflow-y-auto py-6 flex flex-col items-center gap-4">
        {/* Password */}
        <div className="setting-page-secure__body bg-white">
          <SettingListItem
            icon={<KeyRound size={24} strokeWidth={2} />}
            title="Пароль для входа"
            description="Откл"
            onClick={() => {
              //тут хз я не придумал проде надо чтобы на сервак это кудато уходило
            }}
            className="setting-page-secure-password"
          />
        </div>

        {/* Who can contact me */}
        <SettingSecuritySection
          bodyBg={true}
          headerContent={
            <SettingListItem
              icon={<KeyRound size={24} strokeWidth={2} />}
              title="dwd"
              description="Откл"
              onClick={() => {
                //тут хз я не придумал проде надо чтобы на сервак это кудато уходило
              }}
              className="setting-page-secure-password"
            />
          }
          items={whoCanContactItems}
        />

        {/* Personal information */}
        <SettingSecuritySection bodyBg={false} title="Моя информация" items={personalInfoItems} />

        {/* Blacklist */}
        <div className="setting-page-secure__body bg-white">
          <SettingListItem
            title="Чёрный список"
            description="Список тех, кто не может вам писать, звонить и добавлять в чаты"
            onClick={() => {
              //тут хз я не придумал проде надо чтобы на сервак это кудато уходило
            }}
            className="setting-page-secure-password"
          />
        </div>
      </div>
    </div>
  )
}
