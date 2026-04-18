import ColorHash from 'color-hash'
import chroma from 'chroma-js'

export default function UserAvatar({ name, avatarURL }: { name: string; avatarURL: string }) {
  const colorHash = new ColorHash()
  const nameArray = name.split(' ')
  const colorMain = colorHash.hex(name)
  let lighterColor = chroma(colorMain).brighten(1).hex()
  
  return (
    <div className="user-avatar" style={{ backgroundColor: colorMain}}>
      {avatarURL ? (
        <img src={avatarURL} alt="" className="user-avatar__img" />
      ) : (
        <span className="user-avatar__name" style={{color:lighterColor}}>
          {nameArray[0][0]}
          {nameArray[1][0]}
        </span>
      )}
    </div>
  )
}
