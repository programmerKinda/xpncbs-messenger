import { LogOut } from 'lucide-react'
import { auth } from '../../api/firebase'
import { signOut } from 'firebase/auth'
export default function LogOutButton() {
  const handleLogout = async () => {
    try {
      await signOut(auth)
      console.log('Вышли из аккаунта')
      localStorage.clear()
    } catch (error) {
      console.error('Ошибка выхода:', error)
    }
  }
  return (
    <button className="profile__leave" onClick={handleLogout}>
      <LogOut color="var(--color-red-700)" /> Выход из аккаунта
    </button>
  )
}
