import CommonWindowHeader from '@/shared/components/CommonWindowHeader'
import SelectList from '@/shared/components/SelectList'
export default function SettingPageSecure() {
  const email = ['Все', 'Мои контакты', 'Никто']
  const avatar = ['Все', 'Мои контакты', 'Никто']
  const call = ['Все', 'Мои контакты', 'Никто']
  return (
    <div className="setting-page setting-page-secure">
      <CommonWindowHeader>
        <h2 className="setting-page__title">Безопасность</h2>
      </CommonWindowHeader>
      <div className="flex-1 min-h-0 w-full overflow-y-auto py-6 flex flex-col items-center gap-4">
        {' '}
        <div className="setting-page-secure__body">
          <h2 className="setting-page-secure__title">Кто видит мою информацию</h2>
          <ul className="setting-page-secure__list">
            <li className="setting-page-secure__item">
              <div className="setting-page-secure__item-title">Найти меня по почте</div>
              <SelectList list={email} />
            </li>
            <li className="setting-page-secure__item">
              <div className="setting-page-secure__item-title">Пригласить в чат</div>
              <SelectList list={avatar} />
            </li>
            <li className="setting-page-secure__item">
              <div className="setting-page-secure__item-title">Позвонить</div>
              <SelectList list={call} />
            </li>
          </ul>
        </div>{' '}
        <div className="setting-page-secure__body">
          <h2 className="setting-page-secure__title">Кто видит мою информацию</h2>
          <ul className="setting-page-secure__list">
            <li className="setting-page-secure__item">
              <div className="setting-page-secure__item-title">Видеть статус «в сети»</div>
              <SelectList list={email} />
            </li>
            <li className="setting-page-secure__item">
              <div className="setting-page-secure__item-title">Видеть мою почту</div>
              <SelectList list={avatar} />
            </li>
            <li className="setting-page-secure__item">
              <div className="setting-page-secure__item-title">День рождения</div>
              <SelectList list={call} />
            </li>
            <li className="setting-page-secure__item">
              <div className="setting-page-secure__item-title">Фотография профиля</div>
              <SelectList list={call} />
            </li>
          </ul>
        </div>{' '}
        <div className="setting-page-secure__body">
          <h2 className="setting-page-secure__title">Черный список</h2>
          <p className="">Список тех, кто не может вам писать, звонить и добавлять в чаты</p>
        </div>
      </div>
    </div>
  )
}
