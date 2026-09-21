import UserAvatar from '@/views/user/UserAvatar'
import { Camera, Check, MoreHorizontal } from 'lucide-react'

export default function SettingPageUser() {
  return (
    <div className="setting-page">
      <form className="setting-page-user__form">
        <div className="setting-profile">
          <header className="setting-profile__hero">
            <div className="setting-profile__hero-glow" />
            <div className="setting-profile__identity">
              <div className="setting-profile__avatar-wrap">
                <UserAvatar name="Иван Иванов" avatarURL="" size={96} />
                <button
                  type="button"
                  className="setting-profile__avatar-action"
                  aria-label="Изменить фото"
                >
                  <Camera size={16} strokeWidth={2.2} />
                </button>
              </div>
              <div>
                <p className="setting-profile__eyebrow">Личный профиль</p>
                <h1>Иван Иванов</h1>
                <p className="setting-profile__email">ivan@example.com</p>
              </div>
            </div>
          </header>

          <section className="setting-profile__body">
            <div className="setting-section-heading">
              <div>
                <p className="setting-section-heading__eyebrow">Профиль</p>
                <h2>Личные данные</h2>
              </div>
              <span className="setting-section-heading__status">
                <Check size={15} /> Синхронизировано
              </span>
            </div>

            <div className="setting-page-user__fields">
              <label className="setting-field">
                <span>Имя</span>
                <input
                  type="text"
                  className="setting-page-user__field"
                  placeholder="Имя"
                  maxLength={59}
                />
              </label>
              <label className="setting-field">
                <span>Никнейм</span>
                <input
                  type="text"
                  className="setting-page-user__field"
                  placeholder="Никнейм"
                  maxLength={59}
                />
              </label>
              <label className="setting-field setting-field--wide">
                <span>О себе</span>
                <textarea
                  className="setting-page-user__field resize-none"
                  placeholder="Расскажите о себе"
                  rows={4}
                  maxLength={300}
                />
              </label>
            </div>

            <footer className="setting-page-user__actions">
              <button
                type="button"
                className="setting-page-user__button setting-page-user__button--primary"
              >
                Сохранить изменения
              </button>
              <button
                type="button"
                className="setting-page-user__button setting-page-user__button--icon"
                aria-label="Дополнительные действия"
              >
                <MoreHorizontal size={22} strokeWidth={2} />
              </button>
            </footer>
          </section>

          <button type="button" className="setting-profile__logout">
            Выйти из аккаунта
          </button>
        </div>
      </form>
    </div>
  )
}
