import Message from './views/message/Message'
function App() {
  return (
    <Message
      message={{
        uuid: '1',
        content: 'Привет, мир!',
        type: 'text',
        createdAt: new Date(),
        updated: false,
        watched: false,
      }}
    />
  )
}
export default App
