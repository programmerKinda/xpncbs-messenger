import { useState } from 'react'
import {
  Bell,
  Check,
  ChevronRight,
  HardDrive,
  Info,
  Keyboard,
  Palette,
  RefreshCw,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react'

type SettingPageProps = {
  eyebrow: string
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
}

function SettingPageShell({ eyebrow, title, description, icon, children }: SettingPageProps) {
  return (
    <div className="setting-page setting-page-catalog">
      <main className="setting-catalog__content">
        <header className="setting-catalog__hero">
          <div className="setting-catalog__hero-icon">{icon}</div>
          <div>
            <p className="setting-profile__eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}

export function SettingPageHome() {
  return (
    <SettingPageShell
      eyebrow="Центр управления"
      title="Настройки"
      description="Выберите раздел, который хотите настроить."
      icon={<SlidersHorizontal size={27} />}
    >
      <SettingGroup title="Разделы настроек">
        <p className="setting-catalog__note">
          Профиль, уведомления, чаты и остальные параметры доступны в меню слева.
        </p>
      </SettingGroup>
    </SettingPageShell>
  )
}

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="setting-catalog__group">
      <h2>{title}</h2>
      <div className="setting-catalog__card">{children}</div>
    </section>
  )
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="setting-catalog__row">
      <div className="setting-catalog__row-copy">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      <div className="setting-catalog__control">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      className={`setting-toggle ${checked ? 'setting-toggle--active' : ''}`}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  )
}

function SelectControl({ value, options }: { value: string; options: string[] }) {
  return (
    <select className="setting-select" defaultValue={value}>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  )
}

function KeyHint({ children }: { children: React.ReactNode }) {
  return <kbd className="setting-key-hint">{children}</kbd>
}

export function SettingPageChats() {
  const [enterToSend, setEnterToSend] = useState(true)
  const [autoDownload, setAutoDownload] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [readReceipts, setReadReceipts] = useState(true)

  return (
    <SettingPageShell
      eyebrow="Настройки общения"
      title="Чаты"
      description="Настройте отображение сообщений и поведение переписки под себя."
      icon={<SlidersHorizontal size={27} />}
    >
      <SettingGroup title="Поведение сообщений">
        <SettingRow title="Отправка по Enter" description="Shift + Enter добавляет новую строку">
          <Toggle checked={enterToSend} onChange={setEnterToSend} />
        </SettingRow>
        <SettingRow
          title="Предпросмотр ссылок"
          description="Показывать карточки ссылок в сообщениях"
        >
          <Toggle checked={true} onChange={() => undefined} />
        </SettingRow>
        <SettingRow
          title="Автоматическая загрузка медиа"
          description="Загружать изображения и видео в открытом чате"
        >
          <Toggle checked={autoDownload} onChange={setAutoDownload} />
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Внешний вид списка">
        <SettingRow title="Плотный список чатов" description="Больше диалогов помещается на экране">
          <Toggle checked={compactMode} onChange={setCompactMode} />
        </SettingRow>
        <SettingRow
          title="Индикатор прочтения"
          description="Показывать собеседникам, что сообщение прочитано"
        >
          <Toggle checked={readReceipts} onChange={setReadReceipts} />
        </SettingRow>
        <SettingRow
          title="Автовоспроизведение GIF"
          description="Запускать анимации при появлении в чате"
        >
          <Toggle checked={true} onChange={() => undefined} />
        </SettingRow>
        <SettingRow title="Размер текста">
          <SelectControl value="Средний" options={['Маленький', 'Средний', 'Большой']} />
        </SettingRow>
      </SettingGroup>
    </SettingPageShell>
  )
}

export function SettingPageNotifications() {
  const [desktop, setDesktop] = useState(true)
  const [sound, setSound] = useState(true)
  const [mentions, setMentions] = useState(true)
  const [previews, setPreviews] = useState(true)

  return (
    <SettingPageShell
      eyebrow="Всегда в курсе"
      title="Уведомления"
      description="Выберите, какие события должны привлекать ваше внимание."
      icon={<Bell size={27} />}
    >
      <SettingGroup title="Основные уведомления">
        <SettingRow
          title="Уведомления на рабочем столе"
          description="Показывать новые сообщения поверх окон"
        >
          <Toggle checked={desktop} onChange={setDesktop} />
        </SettingRow>
        <SettingRow
          title="Звуки уведомлений"
          description="Воспроизводить короткий звук для новых сообщений"
        >
          <Toggle checked={sound} onChange={setSound} />
        </SettingRow>
        <SettingRow
          title="Упоминания и ответы"
          description="Уведомлять, когда вас упоминают в чате"
        >
          <Toggle checked={mentions} onChange={setMentions} />
        </SettingRow>
        <SettingRow
          title="Предпросмотр сообщения"
          description="Показывать текст сообщения в уведомлении"
        >
          <Toggle checked={previews} onChange={setPreviews} />
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Звук">
        <SettingRow
          title="Мелодия уведомления"
          description="Текущая мелодия применяется ко всем чатам"
        >
          <div className="setting-control-with-icon">
            <Volume2 size={17} />
            <SelectControl value="Soft pop" options={['Soft pop', 'Glass', 'None']} />
          </div>
        </SettingRow>
      </SettingGroup>
    </SettingPageShell>
  )
}

export function SettingPageHotKeys() {
  const shortcuts = [
    ['Новый чат', 'Ctrl', 'N'],
    ['Поиск', 'Ctrl', 'K'],
    ['Закрыть меню', 'Esc'],
    ['Отправить сообщение', 'Enter'],
  ]

  return (
    <SettingPageShell
      eyebrow="Быстрые действия"
      title="Сочетания клавиш"
      description="Работайте с мессенджером быстрее, не отрывая рук от клавиатуры."
      icon={<Keyboard size={27} />}
    >
      <SettingGroup title="Основные команды">
        {shortcuts.map(([label, ...keys]) => (
          <div className="setting-catalog__shortcut" key={label}>
            <span>{label}</span>
            <div>
              {keys.map((key) => (
                <KeyHint key={key}>{key}</KeyHint>
              ))}
            </div>
          </div>
        ))}
      </SettingGroup>
      <p className="setting-catalog__note">
        <Info size={15} /> Сочетания работают, когда фокус находится вне поля ввода.
      </p>
    </SettingPageShell>
  )
}

export function SettingPageAppearance() {
  const [animations, setAnimations] = useState(true)

  return (
    <SettingPageShell
      eyebrow="Ваше пространство"
      title="Внешний вид"
      description="Сделайте интерфейс комфортным для долгих разговоров."
      icon={<Palette size={27} />}
    >
      <SettingGroup title="Тема">
        <SettingRow title="Цветовая схема" description="Настройка темы устройства появится позже">
          <SelectControl value="Светлая" options={['Светлая', 'Системная', 'Тёмная']} />
        </SettingRow>
        <SettingRow title="Акцентный цвет">
          <div className="setting-swatches">
            <button
              type="button"
              className="setting-swatch setting-swatch--blue"
              aria-label="Синий"
            />
            <button
              type="button"
              className="setting-swatch setting-swatch--indigo setting-swatch--selected"
              aria-label="Индиго"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              className="setting-swatch setting-swatch--teal"
              aria-label="Бирюзовый"
            />
          </div>
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Детали интерфейса">
        <SettingRow
          title="Плавные переходы"
          description="Анимировать открытие меню и смену экранов"
        >
          <Toggle checked={animations} onChange={setAnimations} />
        </SettingRow>
        <SettingRow
          title="Показывать время сообщений"
          description="Отображать время рядом с каждым сообщением"
        >
          <Toggle checked={true} onChange={() => undefined} />
        </SettingRow>
        <SettingRow title="Фон чатов">
          <SelectControl value="Сетка" options={['Сетка', 'Однотонный', 'Мягкий градиент']} />
        </SettingRow>
      </SettingGroup>
    </SettingPageShell>
  )
}

export function SettingPageData() {
  return (
    <SettingPageShell
      eyebrow="Контроль данных"
      title="Данные и память"
      description="Понимайте, сколько места занимают файлы и управляйте локальными данными."
      icon={<HardDrive size={27} />}
    >
      <SettingGroup title="Хранилище">
        <div className="setting-storage-meter">
          <span />
        </div>
        <div className="setting-storage-summary">
          <strong>128 МБ</strong>
          <span>из 2 ГБ используется</span>
        </div>
        <SettingRow
          title="Медиа и документы"
          description="Изображения, видео и прикреплённые файлы"
        >
          <span className="setting-catalog__value">128 МБ</span>
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Действия">
        <SettingRow
          title="Очистить кэш"
          description="Удалить временные файлы, не затрагивая переписки"
        >
          <button type="button" className="setting-outline-button">
            <RefreshCw size={15} /> Очистить
          </button>
        </SettingRow>
        <SettingRow title="Экспорт данных" description="Скачать копию профиля и настроек">
          <button type="button" className="setting-outline-button">
            Экспортировать
          </button>
        </SettingRow>
        <SettingRow
          title="Удаление старых медиа"
          description="Автоматически очищать файлы старше 30 дней"
        >
          <SelectControl value="Никогда" options={['Никогда', '30 дней', '90 дней']} />
        </SettingRow>
      </SettingGroup>
    </SettingPageShell>
  )
}

export function SettingPageLanguage() {
  return (
    <SettingPageShell
      eyebrow="Персонализация"
      title="Язык и регион"
      description="Выберите язык интерфейса и формат отображения времени."
      icon={<SlidersHorizontal size={27} />}
    >
      <SettingGroup title="Язык">
        <SettingRow title="Язык приложения" description="Перевод интерфейса">
          <SelectControl value="Русский" options={['Русский', 'English', 'Українська']} />
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Формат">
        <SettingRow title="Часовой пояс" description="Время сообщений и уведомлений">
          <SelectControl
            value="Москва (UTC+3)"
            options={['Москва (UTC+3)', 'Лондон (UTC+0)', 'Нью-Йорк (UTC-5)']}
          />
        </SettingRow>
        <SettingRow title="Формат времени">
          <SelectControl value="24 часа" options={['24 часа', '12 часов']} />
        </SettingRow>
      </SettingGroup>
    </SettingPageShell>
  )
}

export function SettingPageAccessibility() {
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)

  return (
    <SettingPageShell
      eyebrow="Комфорт для каждого"
      title="Доступность"
      description="Настройте интерфейс так, чтобы им было удобно пользоваться каждый день."
      icon={<SlidersHorizontal size={27} />}
    >
      <SettingGroup title="Читаемость">
        <SettingRow title="Увеличенный текст" description="Увеличить подписи и элементы управления">
          <Toggle checked={largeText} onChange={setLargeText} />
        </SettingRow>
        <SettingRow title="Повышенный контраст" description="Сделать границы и текст заметнее">
          <Toggle checked={highContrast} onChange={setHighContrast} />
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Движение">
        <SettingRow
          title="Уменьшить анимации"
          description="Отключить большинство переходов интерфейса"
        >
          <Toggle checked={false} onChange={() => undefined} />
        </SettingRow>
      </SettingGroup>
    </SettingPageShell>
  )
}

export function SettingPageDevices() {
  return (
    <SettingPageShell
      eyebrow="Контроль доступа"
      title="Устройства"
      description="Проверьте, где открыт ваш аккаунт, и завершите лишние сеансы."
      icon={<HardDrive size={27} />}
    >
      <SettingGroup title="Текущий сеанс">
        <div className="setting-device-row">
          <span className="setting-device-row__dot" />
          <div>
            <strong>Это устройство</strong>
            <p>Windows · Сейчас активен</p>
          </div>
          <span className="setting-device-row__current">Активен</span>
        </div>
      </SettingGroup>
      <SettingGroup title="Другие сеансы">
        <div className="setting-device-row">
          <span className="setting-device-row__dot setting-device-row__dot--muted" />
          <div>
            <strong>Chrome на Android</strong>
            <p>Последняя активность 2 дня назад</p>
          </div>
          <button type="button" className="setting-outline-button">
            Завершить
          </button>
        </div>
        <div className="setting-device-row">
          <span className="setting-device-row__dot setting-device-row__dot--muted" />
          <div>
            <strong>Safari на iPhone</strong>
            <p>Последняя активность 5 дней назад</p>
          </div>
          <button type="button" className="setting-outline-button">
            Завершить
          </button>
        </div>
      </SettingGroup>
    </SettingPageShell>
  )
}

export function SettingPageAdvanced() {
  const [developerMode, setDeveloperMode] = useState(false)
  const [spellcheck, setSpellcheck] = useState(true)

  return (
    <SettingPageShell
      eyebrow="Для продвинутых"
      title="Расширенные настройки"
      description="Тонкая настройка поведения приложения и диагностических функций."
      icon={<SlidersHorizontal size={27} />}
    >
      <SettingGroup title="Инструменты">
        <SettingRow
          title="Проверка орфографии"
          description="Подсвечивать опечатки в поле сообщения"
        >
          <Toggle checked={spellcheck} onChange={setSpellcheck} />
        </SettingRow>
        <SettingRow
          title="Режим разработчика"
          description="Показывать техническую информацию интерфейса"
        >
          <Toggle checked={developerMode} onChange={setDeveloperMode} />
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Сброс">
        <SettingRow
          title="Сбросить настройки"
          description="Вернуть параметры приложения к значениям по умолчанию"
        >
          <button type="button" className="setting-outline-button">
            Сбросить
          </button>
        </SettingRow>
      </SettingGroup>
    </SettingPageShell>
  )
}

export function SettingPageAbout() {
  return (
    <SettingPageShell
      eyebrow="XPNCBS Messenger"
      title="О приложении"
      description="Простое пространство для сообщений, звонков и своих людей."
      icon={<Info size={27} />}
    >
      <SettingGroup title="Версия">
        <div className="setting-about-version">
          <span className="setting-about-version__mark">X</span>
          <div>
            <strong>XPNCBS Messenger</strong>
            <p>Версия 0.1.0 · стабильный канал</p>
          </div>
        </div>
      </SettingGroup>
      <SettingGroup title="Помощь и документы">
        <button type="button" className="setting-link-row">
          <span>Центр помощи</span>
          <ChevronRight size={18} />
        </button>
        <button type="button" className="setting-link-row">
          <span>Политика конфиденциальности</span>
          <ChevronRight size={18} />
        </button>
        <button type="button" className="setting-link-row">
          <span>Условия использования</span>
          <ChevronRight size={18} />
        </button>
      </SettingGroup>
    </SettingPageShell>
  )
}
