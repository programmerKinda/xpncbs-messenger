import ColorHash from 'color-hash'
import chroma from 'chroma-js'

export default function UserAvatar({ name, avatarURL }: { name: string; avatarURL: string }) {
  const colorHash = new ColorHash()
  const nameArray = name.split(' ')
  const colorMain = colorHash.hex(name)
  const lighterColor = chroma(colorMain).brighten(1.2).hex()
  const darkenColor = chroma(colorMain).darken(0.5).hex()
  const styles = avatarURL ? {} : { backgroundColor: colorMain, border: `2px solid ${darkenColor}` }
  const letters = `${nameArray[0][0]}${nameArray[1][0]}`
  const isAllLower = letters === letters.toLowerCase()

  const offset = isAllLower ? '-0.06em' : '0'

  return (
    <div className="user-avatar" style={styles}>
      {avatarURL ? (
        <img src={avatarURL} alt="" className="user-avatar__img" />
      ) : (
        <span
          className="user-avatar__name"
          style={{ color: lighterColor, transform: `translateY(${offset})` }}
        >
          {letters}
        </span>
      )}
    </div>
  )
}
