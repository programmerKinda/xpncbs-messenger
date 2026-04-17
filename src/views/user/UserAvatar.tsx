import ColorHash from 'color-hash'

export default function UserAvatar({name,avatarURL}:{name:string,avatarURL:string}){
        const colorHash = new ColorHash()
        const nameArray = name.split(' ')
    return(
        <div className="user-avatar" style={{backgroundColor:colorHash.hex(name)}}>
            {avatarURL ? <img src={avatarURL} alt="" className="user-avatar__img"/> : <span className="user-avatar__name" >{nameArray[0][0]}{nameArray[1][0]}</span>}
            
           </div>
    )
}