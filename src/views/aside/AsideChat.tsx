import { Menu ,Plus,Search} from "lucide-react"

export default function AsideChat() {
  let chatChapters = ['все', 'групповые', 'личные', 'избранные']

  return (
    <>
      <aside className="aside__chat">
        <header className="aside__chat-header">
          <a href="" className="aside__chat-header-logo">
            <img src='images/mainLogo.png' alt="ANTI MAX"></img>
          </a>
          <button className="aside__chat-header-menu"><Menu size={35}/></button>
        </header>
        <div className="aside__body">
          <div className="search"
          ><Search size={30}/><input type="text" placeholder="" className="search__input"/>
          </div>
          <div style={{display:'flex' , alignItems:'center' , justifyContent:'space-between'}}>
          <ul className="aside__body-chatChapters">
            {chatChapters.map((el) => (
              <li className="aside__body-chatCharapter">{el}</li>
            ))}
          </ul>
           <button className="button-c">
               <Plus size={30}/>
           </button>
          </div>
        </div>
        <footer className="aside__footer"></footer>
      </aside>
    </>
  )
}
