import Message from "./views/message/Message"
function App() {
  return (
    <>
      <Message
        message={{
          uuid: '1',
          content: 'Привет, мир!',
          type: 'text',
          createdAt: new Date(),
          updated: true,
          watched: true,
        }}
      />
    </>
  )
}
export default App
