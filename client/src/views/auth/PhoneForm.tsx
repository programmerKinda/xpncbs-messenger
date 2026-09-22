const PhoneForm = () => {
  return (
    <form className="auth-card" onSubmit={handlePhoneSubmit}>
      <div className="auth-brand" aria-hidden="true">
        <MessageSquareText size={56} strokeWidth={2} />
      </div>

      <p className="auth-kicker">XPNCBS Messenger</p>

      <h1 className="auth-title">Войдите в аккаунт</h1>

      <p className="auth-subtitle">
        Проверьте код страны и введите
        <br />
        номер телефона для входа.
      </p>

      <div className="auth-field auth-country-field" ref={divRef}>
        <span className="auth-field__label">Страна</span>

        <DropdownWithArrow
          id="countries"
          items={countriesItems}
          valueSelector=".country-name"
          search={true}
          width={width}
        />
      </div>

      <label className="auth-field auth-phone-field">
        <span className="auth-field__label">Номер телефона</span>

        <PhoneInput value={inputValue} onChange={handleInput} placeholder="" />
      </label>

      <button className="auth-next-button" type="submit">
        Продолжить
      </button>
    </form>
  )
}
