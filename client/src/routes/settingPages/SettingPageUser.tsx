import UserAvatar from '@/views/user/UserAvatar'
import CommonWindowHeader from '@/shared/components/CommonWindowHeader'
import { MoreHorizontal } from 'lucide-react'

export default function SettingPageUser() {
  return (
    <div className="setting-page">
      <CommonWindowHeader>
        <h2 className="setting-page__title">Редактировать профиль</h2>
      </CommonWindowHeader>

      <form className="setting-page-user__form">
        <div className="setting-page-user__card">
          <header className="setting-page-user__header">
            <UserAvatar name="и и" avatarURL="" size={75} />
          </header>

          <div className="setting-page-user__fields">
            <input
              type="text"
              className="setting-page-user__field"
              placeholder="Имя"
              maxLength={59}
            />
            <input
              type="text"
              className="setting-page-user__field"
              placeholder="Никнейм"
              maxLength={59}
            />
            <textarea
              className="setting-page-user__field resize-none"
              placeholder="О себе"
              rows={4}
              maxLength={300}
            />
          </div>

          <footer className="setting-page-user__actions">
            <button
              type="button"
              className="setting-page-user__button setting-page-user__button--primary"
            >
              Выйти из аккаунта
            </button>
            <button
              type="button"
              className="setting-page-user__button setting-page-user__button--icon"
              aria-label="Ещё"
            >
              <MoreHorizontal size={22} strokeWidth={2} />
            </button>
          </footer>
        </div>
      </form>
    </div>
  )
}
