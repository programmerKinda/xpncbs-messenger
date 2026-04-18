export type UserStatus = 'online' | 'offline'
export interface User {
  uuid: string
  name: string // имя
  lastSeen: Date //последний онлайн
  status: UserStatus // статус
  description?: string // описание
  avatarUrl?: string // аватар
}
