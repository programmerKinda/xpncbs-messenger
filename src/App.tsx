import Message from './views/message/Message'
function App() {
  return (
    <Message
      message={{
        uuid: '1',
        content:
          'Привет, мир! https://github.com/programmerKinda/xpncbs-messenger/tree/feat/message',
        type: 'text',
        createdAt: new Date(),
        updated: true,
        watched: true,
      }}
    />
  )
}
export default App
