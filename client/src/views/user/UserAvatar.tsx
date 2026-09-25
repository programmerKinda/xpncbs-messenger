import ColorHash from 'color-hash'
import chroma from 'chroma-js'

export default function UserAvatar({
  id,
  name,
  avatarURL,
  size,
}: {
  id: string
  name: string
  avatarURL: string
  size?: number
}) {
  const colorHash = new ColorHash()

  const safeName = name?.trim() || 'User'

  // Цвет всегда будет одинаковым для одного и того же id
  const colorMain = colorHash.hex(id)

  const darkerColor = chroma(colorMain).brighten(0.8).hex()
  const lighterColor = chroma(colorMain).brighten(2).hex()

  const styles: React.CSSProperties = avatarURL
    ? {}
    : {
        background: `linear-gradient(135deg, ${darkerColor} 0%, ${lighterColor} 100%)`,
      }

  if (size) {
    styles.width = `${size}px`
    styles.height = `${size}px`
    styles.fontSize = `${size / 2.5}px`
  }

  const nameArray = safeName.split(/\s+/).filter(Boolean)

  const firstPart = nameArray[0]?.[0]?.toUpperCase() ?? '?'
  const secondPart = nameArray[1]?.[0]?.toUpperCase() ?? ''

  const letters = `${firstPart}${secondPart}`

  const isAllLower = letters === letters.toLowerCase()
  const offset = isAllLower ? '-0.06em' : '0'

  return (
    <div
      className={`user-avatar ${size ? '' : 'w-14 h-14'}`}
      style={styles}
    >
      {avatarURL ? (
        <img
          src={avatarURL}
          alt=""
          className="user-avatar__img"
        />
      ) : (
        <span
          className={`user-avatar__name ${size ? '' : 'text-lg'}`}
          style={{
            color: 'white',
            transform: `translateY(${offset})`,
          }}
        >
          {letters}
        </span>
      )}
    </div>
  )
}