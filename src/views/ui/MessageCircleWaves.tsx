interface MessageCircleWavesProps {
  isPlaying: boolean
}

const MessageCircleWaves: React.FC<MessageCircleWavesProps> = ({ isPlaying }) => {
  return (
    <div className="waves-container">
      <div className={`wave wave1 ${isPlaying ? 'animate' : 'animate paused'}`}></div>
      <div className={`wave wave2 ${isPlaying ? 'animate' : 'animate paused'}`}></div>
      <div className={`wave wave3 ${isPlaying ? 'animate' : 'animate paused'}`}></div>
    </div>
  )
}

export default MessageCircleWaves
