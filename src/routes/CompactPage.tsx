import type { ReactNode } from 'react'
import { useChatMenuStore } from '../controllers/chatMenuController'

type CompactPageProps = {
  title: string
  description: string
  children: ReactNode
}

function CompactPage({ title, description, children }: CompactPageProps) {
  const { isOpen } = useChatMenuStore()

  return (
    <section className={`App ${isOpen ? '' : 'App--menu-closed'}`}>
      <div className="compact-page">
        <header className="compact-page__header">
          <div>
            <p className="compact-page__eyebrow">Messenger</p>
            <h1 className="compact-page__title">{title}</h1>
            <p className="compact-page__description">{description}</p>
          </div>
        </header>

        <div className="compact-page__content">{children}</div>
      </div>
    </section>
  )
}

export default CompactPage
