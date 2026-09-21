import CommonSidebar from '@/shared/components/CommonSidebar'
import CallItem from '@/views/calls/CallItem'
import {
  Phone,
  Video,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  UsersRound,
  MoreHorizontal,
} from 'lucide-react'
import '@/styles/components/calls.css'
import { useState } from 'react'

type CallFilter = 'all' | 'missed' | 'incoming' | 'outgoing'

const callHistory = [
  {
    name: 'Анна К.',
    phone: '+7 999 123-45-67',
    time: 'Сегодня, 14:20',
    direction: 'incoming' as const,
    status: 'accepted' as const,
    type: 'phone' as const,
  },
  {
    name: 'Максим',
    phone: '+7 900 555-12-34',
    time: 'Вчера, 21:05',
    direction: 'outgoing' as const,
    status: 'missed' as const,
    type: 'video' as const,
  },
  {
    name: 'Ольга',
    phone: '+7 915 000-11-22',
    time: 'Вчера, 09:40',
    direction: 'incoming' as const,
    status: 'accepted' as const,
    type: 'video' as const,
  },
]

export default function Calls() {
  const [filter, setFilter] = useState<CallFilter>('all')
  const filteredCalls = callHistory.filter(
    (call) =>
      filter === 'all' ||
      call.direction === filter ||
      (filter === 'missed' && call.status === 'missed')
  )
  const filterTitle =
    filter === 'all'
      ? 'Недавние звонки'
      : filter === 'missed'
        ? 'Пропущенные'
        : filter === 'incoming'
          ? 'Входящие'
          : 'Исходящие'

  const renderCall = (call: (typeof callHistory)[number]) => (
    <CallItem
      key={`${call.name}-${call.time}`}
      name={call.name}
      phone={call.phone}
      time={call.time}
      direction={call.direction}
      status={call.status}
      callType={call.type === 'phone' ? <Phone size={18} /> : <Video size={18} />}
    />
  )

  return (
    <div className="compact-page calls-route">
      <CommonSidebar
        title="Звонки"
        resize={true}
        bodyContent={
          <nav className="calls-sidebar__nav" aria-label="Фильтры звонков">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`calls-sidebar__item ${filter === 'all' ? 'calls-sidebar__item--active' : ''}`}
            >
              <Phone size={18} />
              <span>Все звонки</span>
              <b>24</b>
            </button>
            <button
              type="button"
              onClick={() => setFilter('missed')}
              className={`calls-sidebar__item ${filter === 'missed' ? 'calls-sidebar__item--active' : ''}`}
            >
              <PhoneMissed size={18} />
              <span>Пропущенные</span>
              <b className="calls-sidebar__count--warning">3</b>
            </button>
            <button
              type="button"
              onClick={() => setFilter('incoming')}
              className={`calls-sidebar__item ${filter === 'incoming' ? 'calls-sidebar__item--active' : ''}`}
            >
              <PhoneIncoming size={18} />
              <span>Входящие</span>
              <b>12</b>
            </button>
            <button
              type="button"
              onClick={() => setFilter('outgoing')}
              className={`calls-sidebar__item ${filter === 'outgoing' ? 'calls-sidebar__item--active' : ''}`}
            >
              <PhoneOutgoing size={18} />
              <span>Исходящие</span>
              <b>9</b>
            </button>
            <div className="calls-sidebar__summary">
              <span>Время разговоров</span>
              <strong>4ч 18м</strong>
              <small>за последние 7 дней</small>
            </div>
          </nav>
        }
        popupButton={{
          icon: <MoreHorizontal size={24} strokeWidth={2} />,
          menuItems: [
            {
              label: 'Новый звонок',
              icon: <PhoneCall size={20} strokeWidth={2} />,
              onClick: () => console.log('Новый звонок'),
            },
            {
              label: 'Новая конференция',
              icon: <UsersRound size={20} strokeWidth={2} />,
              onClick: () => console.log('Новая конференция'),
            },
          ],
        }}
      />
      <main className="compact-page__content calls-route__content">
        <header className="compact-page__header calls-route__hero">
          <div>
            <p className="compact-page__eyebrow">На связи</p>
            <h1 className="compact-page__title">Звонки</h1>
            <p className="compact-page__description">
              История разговоров и быстрый доступ к знакомым.
            </p>
          </div>
          <button type="button" className="compact-page__primary-button">
            <PhoneCall size={17} /> Новый звонок
          </button>
        </header>
        <section className="calls-route__stats">
          <div>
            <span>Всего звонков</span>
            <strong>24</strong>
          </div>
          <div>
            <span>Пропущено</span>
            <strong className="calls-route__stat--warning">3</strong>
          </div>
          <div>
            <span>Время в звонках</span>
            <strong>4ч 18м</strong>
          </div>
        </section>
        <section className="calls-route__history">
          <div className="calls-route__section-title">
            <h2>{filterTitle}</h2>
            <span>{filteredCalls.length} из 24 звонков</span>
          </div>
          {filteredCalls.length > 0 ? (
            filteredCalls.map(renderCall)
          ) : (
            <div className="calls-route__empty">В этом разделе пока нет звонков</div>
          )}
        </section>
      </main>
    </div>
  )
}
