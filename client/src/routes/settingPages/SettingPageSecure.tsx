import SettingListItem from './settingItems/SettingListItem'
import SettingSecuritySection from './settingItems/SettingSecuritySection'

import { KeyRound, ShieldCheck } from 'lucide-react'

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
      <div className="setting-page-secure__content">
        <header className="setting-security-hero">
          <div className="setting-security-hero__icon"><ShieldCheck size={28} strokeWidth={1.8} /></div>
          <div>
            <p className="setting-profile__eyebrow">Центр контроля</p>
            <h1>Безопасность и приватность</h1>
            <p>Управляйте тем, кто видит ваши данные и может связаться с вами.</p>
          </div>
        </header>

        <div className="setting-security__intro">Доступ и вход</div>
        <section className="setting-page-secure__body setting-page-secure__standalone">
          <SettingListItem
            icon={<KeyRound size={24} strokeWidth={2} />}
            title="Пароль для входа"
            description="Откл"
            onClick={() => {
              //тут хз я не придумал проде надо чтобы на сервак это кудато уходило
            }}
            className="setting-page-secure-password"
          />
        </section>

        <SettingSecuritySection
          bodyBg={true}
          headerContent={
            <SettingListItem
              icon={<KeyRound size={24} strokeWidth={2} />}
              title="Кто может связаться со мной"
              description="Управление доступом к контактам"
              onClick={() => {
                //тут хз я не придумал проде надо чтобы на сервак это кудато уходило
              }}
              className="setting-page-secure-password"
            />
          }
          items={whoCanContactItems}
        />

        <SettingSecuritySection bodyBg={false} title="Моя информация" items={personalInfoItems} />

        <section className="setting-page-secure__body setting-page-secure__standalone">
          <SettingListItem
            title="Чёрный список"
            description="Список тех, кто не может вам писать, звонить и добавлять в чаты"
            onClick={() => {
              //тут хз я не придумал проде надо чтобы на сервак это кудато уходило
            }}
            className="setting-page-secure-password"
          />
        </section>
      </div>
    </div>
  )
}
