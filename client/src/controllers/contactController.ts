import { create } from 'zustand'
import type { ChatListItem } from '@/models/api'
import type { ContactEntry } from '@/models/contact'

export type { ContactEntry } from '@/models/contact'

const CONTACTS_STORAGE_KEY = 'xpncbs-messenger-contacts-v1'

const readContacts = (): ContactEntry[] => {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(CONTACTS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ContactEntry[]) : []
  } catch {
    return []
  }
}

const writeContacts = (contacts: ContactEntry[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts))
}

const normalizeContact = (contact: Partial<ContactEntry> & { id: string }): ContactEntry => ({
  id: contact.id,
  firstName: contact.firstName ?? 'Контакт',
  lastName: contact.lastName ?? null,
  username: contact.username ?? null,
  phone: contact.phone ?? '',
  avatarUrl: contact.avatarUrl ?? null,
  about: contact.about ?? null,
  customName: contact.customName ?? null,
  isBlocked: Boolean(contact.isBlocked),
  addedAt: contact.addedAt ?? new Date().toISOString(),
})

interface ContactState {
  contacts: ContactEntry[]
  addContact: (contact: Partial<ContactEntry> & { id: string }) => void
  updateContact: (id: string, patch: Partial<Omit<ContactEntry, 'id'>>) => void
  removeContact: (id: string) => void
  toggleBlock: (id: string) => void
  isContact: (id: string) => boolean
  hydrateFromChats: (chats: ChatListItem[], currentUserId?: string) => void
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: readContacts(),
  addContact: (contact) =>
    set((state) => {
      const normalized = normalizeContact(contact)
      const next = [normalized, ...state.contacts.filter((item) => item.id !== normalized.id)]
      writeContacts(next)
      return { contacts: next }
    }),
  updateContact: (id, patch) =>
    set((state) => {
      const next = state.contacts.map((contact) =>
        contact.id === id ? normalizeContact({ ...contact, ...patch, id }) : contact,
      )
      writeContacts(next)
      return { contacts: next }
    }),
  removeContact: (id) =>
    set((state) => {
      const next = state.contacts.filter((contact) => contact.id !== id)
      writeContacts(next)
      return { contacts: next }
    }),
  toggleBlock: (id) =>
    set((state) => {
      const next = state.contacts.map((contact) =>
        contact.id === id ? { ...contact, isBlocked: !contact.isBlocked } : contact,
      )
      writeContacts(next)
      return { contacts: next }
    }),
  isContact: (id) => get().contacts.some((contact) => contact.id === id),
  hydrateFromChats: (chats, currentUserId) =>
    set((state) => {
      const nextMap = new Map(state.contacts.map((contact) => [contact.id, contact]))

      chats.forEach((chat) => {
        const participant = chat.participant
        if (!participant || participant.id === currentUserId) return

        const existing = nextMap.get(participant.id)
        nextMap.set(participant.id, normalizeContact({
          ...existing,
          id: participant.id,
          firstName: participant.firstName,
          lastName: participant.lastName,
          username: participant.username,
          phone: participant.phone,
          avatarUrl: participant.avatarUrl,
          about: participant.about,
          customName: existing?.customName ?? null,
          addedAt: existing?.addedAt ?? chat.createdAt,
          isBlocked: existing?.isBlocked ?? false,
        }))
      })

      const next = Array.from(nextMap.values())
      writeContacts(next)
      return { contacts: next }
    }),
}))
