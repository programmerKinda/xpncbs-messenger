import Sidebar from './views/sidebar/Sidebar'
import Chats from './views/chat/Chats'
import Message from './views/message/Message'

function App() {
  return (
    <>
      <section className="App">
        <Sidebar />
        <Chats />
      </section>
    </>
  )
}
export default App
