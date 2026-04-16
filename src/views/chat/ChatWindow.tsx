import Menu from "@/shared/components/menu";
import { Plus, Sticker, Mic, EllipsisVertical} from "lucide-react";
import { ChatsMenuButton } from "./ChatsMenuButton";
import { PopupProvider } from "@/shared/components/PopupProvider";
import { User,Settings,LogOut } from "lucide-react";
import Message from "../message/Message";
import { messageTypes } from "@/models/message";

export default function ChatWindow() {
  return (
    <div className="chat-window">
      <header className="chat-window__header">
           <div>
              тут будет пользователь
           </div>
          
    <PopupProvider
      popup={
        <Menu
          items={[
            {
              icon: <User />,
              label: 'Профиль',
              onClick: () => console.log('Профиль'),
            },
            {
              icon: <Settings />,
              label: 'Настройки',
              onClick: () => console.log('Настройки'),
            },
            {
              icon: <LogOut />,
              label: 'Выход',
              onClick: () => console.log('Выход'),
            },
          ]}
        />
      }
    >
    <button><EllipsisVertical /></button>
           </PopupProvider>
          
      </header>
      <div className="chat-window__body">
        <Message message={{uuid:'1',type:'text',content:'Привет, как дела?',createdAt:new Date(),updated:false,watched:false}} />
      </div>
      <footer className="chat-window__footer">
        <form action="" className="chat-window__form">
        <label htmlFor="" className="chat-window__label">
            <button><Plus size={25}/></button>
            <button><Sticker size={25}/></button>
            <input type="text" className="chat-window__input" placeholder="Введите сообщение"/>
            <button><Mic size={25}/></button>
            </label>
        </form>
      </footer>
    </div>
  )
}