import CommonWindowHeader from '@/shared/components/CommonWindowHeader'
import SelectList from '@/shared/components/SelectList'
export default function SettingPageSecure() {
    const email = [
        'Все',
        'Мои контакты',
        'Никто'
    ]
    const avatar = [
        'Все',
        'Мои контакты',
        'Никто'
    ]
    const information = [
        'Все',
        'Мои контакты',
        'Никто'
    ]
  return (
    <div className="setting-page setting-page-secure">
      <CommonWindowHeader>
        <h2 className="setting-page__title">Безопасность</h2>
      </CommonWindowHeader>
      <div className='flex w-full h-full items-center justify-center'>      <div className="setting-page-secure__body">
        <h2>Кто видит мою информацию</h2>
        <ul className="setting-page-secure__list">

          <li className="setting-page-secure__item">
            <div className="setting-page-secure__item-title">Электронная почта</div>
            <SelectList list={email} />
          </li>
          <li className="setting-page-secure__item">
            <div className="setting-page-secure__item-title">Аватар</div>
            <SelectList list={avatar} />
          </li>
              <li className="setting-page-secure__item">
            <div className="setting-page-secure__item-title">Информация</div>
            <SelectList list={information} />
           </li>
        </ul>
      </div></div>

    </div>
  )
}
