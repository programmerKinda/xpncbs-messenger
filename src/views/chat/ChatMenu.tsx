import { Ban, BrushCleaning, Gift, Images, Info, PenIcon, Phone, Trash, X } from 'lucide-react'
import UserAvatar from '../user/UserAvatar'
import UserName from '../user/UserName'
import { useChatMenuStore } from '@/controllers/chatMenuController'

export default function ChatMenu() {
  const { toggleMenu } = useChatMenuStore()

  return (
    <div className={`chat-menu`}>
      <header className="chat-menu__header">
        <button className="chat-menu__exit" onClick={toggleMenu}>
          <X size={25} />
        </button>
        <h2 className="chat-menu__title">Данные контакта</h2>
        <button className="chat-menu__edit">
          <PenIcon size={25} />
        </button>
      </header>
      <div>
        <div className="user-info">
          <UserAvatar
            name="Иван Иванов"
            avatarURL="https://tse1.explicit.bing.net/th/id/OIP.pZVGv4PxQeGKMYHXYdXKAgHaE6?rs=1&pid=ImgDetMain&o=7&rm=3"
            size={100}
          />
          <UserName name="Иван Иванов" phone="+7 (999) 123-45-67" contactName="" />
          <span className="chat-menu__status">в сети</span>
        </div>
        <div className="chat-menu__media">
          <button className="chat-menu__media-button">
            <Images size={25} /> Медиа,ссылки и документы
          </button>
          <ul className="chat-menu__media-list">
            <li className="chat-menu__media-item">
              <img src="https://i.ytimg.com/vi/K4t_1dtr8-U/maxresdefault.jpg" alt="" />
            </li>
            <li className="chat-menu__media-item">
              <img src="https://i.ytimg.com/vi/K4t_1dtr8-U/maxresdefault.jpg" alt="" />
            </li>
            <li className="chat-menu__media-item">
              <img src="https://i.ytimg.com/vi/K4t_1dtr8-U/maxresdefault.jpg" alt="" />
            </li>
            <li className="chat-menu__media-item">
              <img src="https://i.ytimg.com/vi/K4t_1dtr8-U/maxresdefault.jpg" alt="" />
            </li>
          </ul>
        </div>
        <ul className="chat-menu__info">
          <li className="chat-menu__info-item">
            <span>
              <Phone size={25} />
            </span>
            +7 (999) 123-45-67
          </li>
          <li className="chat-menu__info-item">
            <span>
              <Info size={25} />
            </span>
            ем шашлык евери дэй
          </li>
          <li className="chat-menu__info-item">
            <span>
              <Gift size={25} />
            </span>{' '}
            1 января 1990 года
          </li>
        </ul>
      </div>
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
  )
}
