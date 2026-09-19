# XPNCBS Messenger

## О проекте

Это лёгкий мессенджер на React + TypeScript + Vite, упакованный с Tailwind-классами через директиву `@apply`, с поддержкой:

- левой навигации (`Sidebar`) и списка чатов;
- просмотра сообщений внутри выбранного чата;
- воспроизведения сообщений-голосовых заметок (`audio`);
- динамического ресайзера панели чатов (`ChatsResizer`);
- поиска по чатам/сообщениям и управления папками чатов.

Проект выполнен в стиле MVC (Model-View-Controller): модели в `src/models`, контроллеры в `src/controllers`, представления в `src/views` и компоненты.

---

## Стек

- Vite (быстрая сборка)
- React 18 (функциональные компоненты)
- TypeScript
- Tailwind CSS (классы и `@apply`)
- ESLint (конфигурация в `eslint.config.js`)
- CSS Modules (типизация `src/styles/css-modules.d.ts`)

Дополнительно:

- Модули для медиа, файлов и чатов в `src/api`/`src/controllers`
- Хуки в `src/hooks`
- Логика времени в `src/utils/formatTime.ts`

---

## Архитектура

1. `src/main.tsx` — точка входа, монтирует `<App />`.
2. `src/App.tsx` — корневой компонент, связывает `Sidebar` + `Chat` view.
3. `src/views/sidebar` — компоненты боковой панели:
   - `Sidebar.tsx`, `SidebarItems.tsx`, `SidebarItem.tsx`.
4. `src/views/chat` — компоненты области чатов:
   - `ChatFolders.tsx`, `Chats.tsx`, `AddChatFolderButton.tsx`, `ChatsMenuButton.tsx`, `ChatsResizer.tsx`.
5. `src/views/message` — компоненты сообщений:
   - `Message.tsx`, `MessageCircle.tsx`, `MessageContent.tsx`, `MessageText.tsx`, `MessageVoice.tsx`.
6. `src/controllers` + `src/api` — бизнес-логика: работа с чатом, медиа (воспроизведение), файлы.
7. `src/models` — типы и начальные данные для чат-модели, сообщений, папок.
8. `src/utils` — вспомогательные функции (время, data URL, элементы боковой панели).
9. `src/styles` — Tailwind-подход через CSS с модулями:
   - `components/*` для отдельных блоков интерфейса;
   - `shared/*` для однотипных стилей;
   - глобальный `index.css`, `normalize.css`, `tailwind.config.js`.

---

## Запуск

1. Установить зависимости
   - `npm install` или `yarn install`
2. Запустить dev-сервер
   - `npm run dev` или `yarn dev`
3. Построить для продакшена
   - `npm run build` или `yarn build`
4. Запустить проверку
   - `npm run lint` (при наличии команды)

---

## Что дальше

- Подключить бэкенд/сокеты для real-time сообщений;
- Добавить идемпотентную сохранность через IndexedDB / localStorage;
- Разделить логику на custom hooks и context API;
- Улучшить доступность (ARIA, клавиатура) и тесты.
