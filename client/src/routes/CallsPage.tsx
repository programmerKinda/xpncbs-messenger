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
import { useEffect, useMemo, useState } from 'react'
import { useCallStore } from '@/controllers/callController'
import type { CallLogEntry } from '@/models/call'

type CallFilter = 'all' | 'missed' | 'incoming' | 'outgoing'

const formatCallTime = (dateIso: string) => {
  const date = new Date(dateIso)
  if (Number.isNaN(date.getTime())) {
    return 'Нет данных'
  }

  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()

  if (sameDay) {
    return `Сегодня, ${date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`
  }

  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function Calls() {
  const callHistory = useCallStore((state) => state.callHistory)
  const [filter, setFilter] = useState<CallFilter>('all')
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 560)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 560px)')
    const updateMobileState = () => setIsMobile(mediaQuery.matches)

    updateMobileState()
    mediaQuery.addEventListener('change', updateMobileState)

    return () => mediaQuery.removeEventListener('change', updateMobileState)
  }, [])

  const totals = useMemo(() => {
    const total = callHistory.length
    const missed = callHistory.filter((call) => call.status === 'missed').length
    const incoming = callHistory.filter((call) => call.direction === 'incoming').length
    const outgoing = callHistory.filter((call) => call.direction === 'outgoing').length
    const durationMinutes = callHistory.reduce((sum, call) => sum + Math.max(0, call.durationSeconds), 0)

    return {
      total,
      missed,
      incoming,
      outgoing,
      durationMinutes: Math.floor(durationMinutes / 60),
    }
  }, [callHistory])

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

  const showSidebar = !isMobile || !mobileDetailOpen
  const showDetail = !isMobile || mobileDetailOpen

  const handleFilterChange = (nextFilter: CallFilter) => {
    setFilter(nextFilter)
    if (isMobile) {
      setMobileDetailOpen(true)
    }
  }

  const renderCall = (call: CallLogEntry) => (
    <CallItem
      id={call.peerId}
      key={`${call.callId}-${call.startedAt}`}
      name={call.peerName}
      phone={call.phone}
      time={formatCallTime(call.startedAt)}
      direction={call.direction}
      status={call.status}
      callType={call.type === 'audio' ? <Phone size={18} /> : <Video size={18} />}
    />
  )

  return (
    <div
      className={`compact-page calls-route ${isMobile && mobileDetailOpen ? 'calls-route--detail' : ''}`}
    >
      {showSidebar && (
        <CommonSidebar
          title="Звонки"
          resize={true}
          bodyContent={
            <nav className="calls-sidebar__nav" aria-label="Фильтры звонков">
              <button
                type="button"
                onClick={() => handleFilterChange('all')}
                className={`calls-sidebar__item ${filter === 'all' ? 'calls-sidebar__item--active' : ''}`}
              >
                <Phone size={18} />
                <span>Все звонки</span>
                <b>{totals.total}</b>
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('missed')}
                className={`calls-sidebar__item ${filter === 'missed' ? 'calls-sidebar__item--active' : ''}`}
              >
                <PhoneMissed size={18} />
                <span>Пропущенные</span>
                <b className="calls-sidebar__count--warning">{totals.missed}</b>
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('incoming')}
                className={`calls-sidebar__item ${filter === 'incoming' ? 'calls-sidebar__item--active' : ''}`}
              >
                <PhoneIncoming size={18} />
                <span>Входящие</span>
                <b>{totals.incoming}</b>
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('outgoing')}
                className={`calls-sidebar__item ${filter === 'outgoing' ? 'calls-sidebar__item--active' : ''}`}
              >
                <PhoneOutgoing size={18} />
                <span>Исходящие</span>
                <b>{totals.outgoing}</b>
              </button>
              <div className="calls-sidebar__summary">
                <span>Время разговоров</span>
                <strong>{totals.durationMinutes} мин</strong>
                <small>по истории звонков</small>
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
      )}
      {showDetail && (
        <main className="compact-page__content calls-route__content">
          {isMobile && (
            <button
              type="button"
              className="compact-page__back-button"
              onClick={() => setMobileDetailOpen(false)}
            >
              Назад
            </button>
          )}
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
              <strong>{totals.total}</strong>
            </div>
            <div>
              <span>Пропущено</span>
              <strong className="calls-route__stat--warning">{totals.missed}</strong>
            </div>
            <div>
              <span>Время в звонках</span>
              <strong>{totals.durationMinutes} мин</strong>
            </div>
          </section>
          <section className="calls-route__history">
            <div className="calls-route__section-title">
              <h2>{filterTitle}</h2>
              <span>
                {filteredCalls.length} из {totals.total} звонков
              </span>
            </div>
            {filteredCalls.length > 0 ? (
              filteredCalls.map(renderCall)
            ) : (
              <div className="calls-route__empty">В этом разделе пока нет звонков</div>
            )}
          </section>
        </main>
      )}
    </div>
  )
}
