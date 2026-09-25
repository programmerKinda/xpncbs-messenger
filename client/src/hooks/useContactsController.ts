import { useEffect } from 'react'
import { getChats } from '@/api/file'
import { useAuthStore } from '@/controllers/authController'
import { useContactStore } from '@/controllers/contactController'
import type { ContactEntry } from '@/models/contact'

export function getContactDisplayName(contact: ContactEntry): string {
  return (
    contact.customName?.trim() ||
    `${contact.firstName} ${contact.lastName ?? ''}`.trim() ||
    contact.username ||
    'Контакт'
  )
}

export function useContactsController() {
  const user = useAuthStore((state) => state.user)
  const contacts = useContactStore((state) => state.contacts)
  const hydrateFromChats = useContactStore((state) => state.hydrateFromChats)
  const addContact = useContactStore((state) => state.addContact)
  const updateContact = useContactStore((state) => state.updateContact)
  const removeContact = useContactStore((state) => state.removeContact)

  useEffect(() => {
    void getChats()
      .then((chats) => hydrateFromChats(chats, user?.id))
      .catch(() => undefined)
  }, [hydrateFromChats, user?.id])

  return {
    user,
    contacts,
    addContact,
    updateContact,
    removeContact,
  }
}

export function useContactActions() {
  return {
    addContact: useContactStore((state) => state.addContact),
    updateContact: useContactStore((state) => state.updateContact),
    removeContact: useContactStore((state) => state.removeContact),
  }
}
