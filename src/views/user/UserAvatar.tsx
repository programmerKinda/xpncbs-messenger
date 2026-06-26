import ColorHash from 'color-hash'
import chroma from 'chroma-js'

export default function UserAvatar({
  name,
  avatarURL,
  size,
}: {
  name: string
  avatarURL: string
  size?: number
}) {
  const colorHash = new ColorHash()
  const nameArray = name.split(' ')
  const colorMain = colorHash.hex(name)
  const lighterColor = chroma(colorMain).brighten(1.2).hex()

  const styles: React.CSSProperties = avatarURL ? {} : { backgroundColor: colorMain }
  if (size) {
    styles.width = `${size}px`
    styles.height = `${size}px`
    styles.fontSize = `${size / 2.5}px`
  }
  const letters = `${nameArray[0][0]}${nameArray[1][0]}`
  const isAllLower = letters === letters.toLowerCase()

  const offset = isAllLower ? '-0.06em' : '0'

  return (
    <div className={`user-avatar ${size ? '' : 'w-12 h-12'}`} style={styles}>
      {avatarURL ? (
        <img src={avatarURL} alt="" className="user-avatar__img" />
      ) : (
        <span
          className={`user-avatar__name ${size ? '' : 'text-xl'}`}
          style={{ color: lighterColor, transform: `translateY(${offset})` }}
        >
          {letters}
        </span>
      )}
    </div>
  )
}
