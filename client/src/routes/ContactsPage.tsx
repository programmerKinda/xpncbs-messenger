import CommonSidebar from '@/shared/components/CommonSidebar'
import UserAvatar from '@/views/user/UserAvatar'
import {
  Clock3,
  MoreVertical,
  Plus,
  Search,
  Star,
  UserRound,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useModalStore } from '@/controllers/modalController'
import ContactFormModal from '@/views/user/ContactFormModal'
import { useContactsController, getContactDisplayName } from '@/hooks/useContactsController'
import type { ContactEntry } from '@/models/contact'

type ContactGroup = 'all' | 'favorites' | 'recent' | 'groups'

export default function Contacts() {
  const { contacts, removeContact } = useContactsController()
  const { setModalChildren, setModalHeaderContent } = useModalStore()
  const [group, setGroup] = useState<ContactGroup>('all')
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 560)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)

  const handleRenameContact = (contact: ContactEntry) => {
    setModalHeaderContent(<span>Изменить контакт</span>)
    setModalChildren(<ContactFormModal initialContact={contact} />)
  }

  const openAddContactModal = () => {
    setModalHeaderContent(<span>Новый контакт</span>)
    setModalChildren(<ContactFormModal />)
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 560px)')
    const updateMobileState = () => setIsMobile(mediaQuery.matches)

    updateMobileState()
    mediaQuery.addEventListener('change', updateMobileState)

    return () => mediaQuery.removeEventListener('change', updateMobileState)
  }, [])

  const visibleContacts = contacts
  const groupTitle =
    group === 'all'
      ? 'Все контакты'
      : group === 'favorites'
        ? 'Избранные'
        : group === 'recent'
          ? 'Недавние'
          : 'Группы'

  const showSidebar = !isMobile || !mobileDetailOpen
  const showDetail = !isMobile || mobileDetailOpen

  const handleGroupChange = (nextGroup: ContactGroup) => {
    setGroup(nextGroup)
    if (isMobile) {
      setMobileDetailOpen(true)
    }
  }

  return (
    <div
      className={`compact-page contacts-page ${isMobile && mobileDetailOpen ? 'contacts-page--detail' : ''}`}
    >
      {showSidebar && (
        <CommonSidebar
          title="Контакты"
          resize={true}
          bodyContent={
            <nav className="contacts-sidebar__nav" aria-label="Категории контактов">
              <button
                type="button"
                onClick={() => handleGroupChange('all')}
                className={`contacts-sidebar__nav-item ${group === 'all' ? 'contacts-sidebar__nav-item--active' : ''}`}
              >
                <UserRound size={18} />
                <span>Все контакты</span>
                <b>3</b>
              </button>
              <button
                type="button"
                onClick={() => handleGroupChange('favorites')}
                className={`contacts-sidebar__nav-item ${group === 'favorites' ? 'contacts-sidebar__nav-item--active' : ''}`}
              >
                <Star size={18} />
                <span>Избранные</span>
                <b>1</b>
              </button>
              <button
                type="button"
                onClick={() => handleGroupChange('recent')}
                className={`contacts-sidebar__nav-item ${group === 'recent' ? 'contacts-sidebar__nav-item--active' : ''}`}
              >
                <Clock3 size={18} />
                <span>Недавние</span>
                <b>2</b>
              </button>
              <button
                type="button"
                onClick={() => handleGroupChange('groups')}
                className={`contacts-sidebar__nav-item ${group === 'groups' ? 'contacts-sidebar__nav-item--active' : ''}`}
              >
                <UsersRound size={18} />
                <span>Группы</span>
                <b>0</b>
              </button>
            </nav>
          }
          popupButton={{
            icon: <MoreVertical size={22} strokeWidth={2} />,
            menuItems: [],
          }}
        />
      )}
      {showDetail && (
        <main className="compact-page__content contacts-page__content">
          {isMobile && (
            <button
              type="button"
              className="compact-page__back-button"
              onClick={() => setMobileDetailOpen(false)}
            >
              Назад
            </button>
          )}
          <header className="compact-page__header contacts-page__hero">
            <div>
              <p className="compact-page__eyebrow">Люди рядом</p>
              <h1 className="compact-page__title">Контакты</h1>
              <p className="compact-page__description">
                Ваши собеседники и новые знакомства в одном месте.
              </p>
            </div>
            <button type="button" className="compact-page__primary-button" onClick={openAddContactModal}>
              <UserRoundPlus size={17} /> Добавить контакт
            </button>
          </header>
          <div className="contacts-page__toolbar">
            <div className="contacts-page__search">
              <Search size={17} />
              <input placeholder="Найти контакт" />
            </div>
            <button
              type="button"
              className="contacts-page__icon-button"
              aria-label="Добавить контакт"
              onClick={openAddContactModal}
            >
              <Plus size={19} />
            </button>
          </div>
          <section className="contacts-page__list">
            <div className="contacts-page__list-heading">
              <h2>{groupTitle}</h2>
              <span>{visibleContacts.length} контакта</span>
            </div>
            {visibleContacts.length > 0 ? (
              visibleContacts.map((contact) => (
                <article className="contacts-page__contact" key={contact.id}>
                  <UserAvatar
                    id={contact.id}
                    name={getContactDisplayName(contact)}
                    avatarURL={contact.avatarUrl ?? ''}
                    size={48}
                  />
                  <div>
                    <h2>{getContactDisplayName(contact)}</h2>
                    <p>{contact.phone || contact.about || 'Без статуса'}</p>
                  </div>
                  <div className="contacts-page__actions">
                    <button type="button" onClick={() => handleRenameContact(contact)}>
                      Подписать
                    </button>
                    <button type="button" onClick={() => removeContact(contact.id)}>
                      Удалить
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="contacts-page__empty">В этой категории пока ничего нет</div>
            )}
          </section>
        </main>
      )}
    </div>
  )
}
