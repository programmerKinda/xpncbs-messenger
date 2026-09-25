export interface ContactEntry {
  id: string
  firstName: string
  lastName: string | null
  username: string | null
  phone: string
  avatarUrl: string | null
  about: string | null
  customName: string | null
  isBlocked: boolean
  addedAt: string
}
