export interface User {
  id: string
  phone: string

  firstName: string
  lastName: string | null

  username: string | null
  about: string | null
  avatarUrl: string | null

  createdAt: string
  updatedAt: string
}

export interface UpdateProfileData {
  firstName: string
  lastName: string
  username: string
  about: string
}
