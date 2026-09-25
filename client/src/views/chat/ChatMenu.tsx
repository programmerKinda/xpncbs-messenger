import {
  Ban,
  BrushCleaning,
  ChevronRight,
  Gift,
  Images,
  Info,
  PenIcon,
  Phone,
  Trash,
  X,
} from 'lucide-react'
import UserAvatar from '../user/UserAvatar'
import UserName from '../user/UserName'
import { useChatMenuStore } from '@/controllers/chatMenuController'

export default function ChatMenu() {
  const { toggleMenu, selectedChat } = useChatMenuStore()
  const participant = selectedChat?.participant
  const title = selectedChat?.title ?? 'Чат'
  const isSavedMessages = selectedChat?.type === 'saved_messages'

  return (
    <div className={`chat-menu`}>
      <header className="chat-menu__header">
        <button
          className="chat-menu__exit"
          onClick={toggleMenu}
          aria-label="Закрыть данные контакта"
        >
          <X size={25} />
        </button>
        <h2 className="chat-menu__title">
          {isSavedMessages ? 'Информация о чате' : 'Данные контакта'}
        </h2>
        <button className="chat-menu__edit" aria-label="Редактировать контакт">
          <PenIcon size={25} />
        </button>
      </header>
      <div className="chat-menu__content">
        <div className="user-info">
          <UserAvatar
            id={selectedChat?.id ?? 'empty-chat'}
            name={title}
            avatarURL={selectedChat?.avatarUrl ?? ''}
            size={100}
          />
          <UserName name={title} phone={participant?.phone ?? ''} contactName="" />
          <span className="chat-menu__status">
            {isSavedMessages
              ? 'Личные заметки'
              : participant?.username
                ? `@${participant.username}`
                : 'Личный чат'}
          </span>
        </div>
        <div className="chat-menu__media">
          <button className="chat-menu__media-button">
            <span className="chat-menu__media-label">
              <Images size={22} />
              <span>
                <strong>Медиа, ссылки и документы</strong>
                <small>Медиа пока нет</small>
              </span>
            </span>
            <ChevronRight size={20} />
          </button>
        </div>
        <ul className="chat-menu__info">
          <li className="chat-menu__info-item">
            <span>
              <Phone size={25} />
            </span>
            {participant?.phone ?? 'Личные заметки'}
          </li>
          <li className="chat-menu__info-item">
            <span>
              <Info size={25} />
            </span>
            {participant?.about ??
              (isSavedMessages ? 'Сообщения, сохраненные для себя' : 'Описание не указано')}
          </li>
          <li className="chat-menu__info-item">
            <span>
              <Gift size={25} />
            </span>{' '}
            {participant?.username ? `@${participant.username}` : 'Системный чат'}
          </li>
        </ul>
        <ul className="chat-menu__actions">
          <li className="chat-menu__action-item">
            <span>
              <BrushCleaning size={25} color="rgb(185, 0, 0)" />
            </span>
            отчистить чат
          </li>
          <li className="chat-menu__action-item">
            <span>
              <Trash size={25} color="rgb(185, 0, 0)" />
            </span>
            удалить чат
          </li>
          <li className="chat-menu__action-item">
            <span>
              <Ban size={25} color="rgb(185, 0, 0)" />
            </span>
            заблокировать
          </li>
        </ul>
      </div>
    </div>
  )
}
