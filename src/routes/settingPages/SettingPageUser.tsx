import UserAvatar from '@/views/user/UserAvatar'
import CommonWindowHeader from '@/shared/components/commonWindowHeader'
import { HiEllipsisHorizontal } from 'react-icons/hi2'

export default function SettingPageUser() {
  return (
    <div className="setting-page-user">
      <CommonWindowHeader>
        <h2 className="setting-page-user__title">Редактировать профиль</h2>
      </CommonWindowHeader>

      <form className="setting-page-user__form">
        <div className="setting-page-user__card">
          <header className="setting-page-user__header">
            <UserAvatar name="и и" avatarURL="" size={75} />
          </header>

          <div className="setting-page-user__fields">
            <input type="text" className="setting-page-user__field" placeholder="Имя" />
            <input type="text" className="setting-page-user__field" placeholder="Никнейм" />
            <input type="text" className="setting-page-user__field" placeholder="О себе" />
          </div>

          <footer className="setting-page-user__actions">
            <button type="button" className="setting-page-user__button setting-page-user__button--primary">
              Выйти из аккаунта
            </button>
            <button type="button" className="setting-page-user__button setting-page-user__button--icon" aria-label="Ещё">
              <HiEllipsisHorizontal size={25} />
            </button>
          </footer>
        </div>
      </form>
    </div>
  )
}
