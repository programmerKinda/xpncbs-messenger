export type AppTheme = 'light' | 'dark'
export type ChatBackground = 'pattern' | 'none'

const THEME_STORAGE_KEY = 'xpncbs-theme'
const CHAT_BACKGROUND_STORAGE_KEY = 'xpncbs-chat-background'

export const getTheme = (): AppTheme =>
  window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'

export const setTheme = (theme: AppTheme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export const getChatBackground = (): ChatBackground =>
  window.localStorage.getItem(CHAT_BACKGROUND_STORAGE_KEY) === 'none' ? 'none' : 'pattern'

export const setChatBackground = (background: ChatBackground) => {
  document.documentElement.classList.toggle('chat-background-none', background === 'none')
  window.localStorage.setItem(CHAT_BACKGROUND_STORAGE_KEY, background)
}

export const initializeTheme = () => {
  setTheme(getTheme())
  setChatBackground(getChatBackground())
}