import { useState } from 'react'
import { errorMessage } from '../api/client'
import { useAuth } from '../auth/context'

const MODE_LOGIN = 'login'
const MODE_REGISTER = 'register'
const PASSWORD_MIN = 10
const PASSWORD_MAX = 72

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState(MODE_LOGIN)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const isRegister = mode === MODE_REGISTER

  function switchMode(next) {
    if (next === mode) {
      return
    }
    setMode(next)
    setPassword('')
    setConfirmation('')
    setError('')
  }

  function validate(cleanEmail) {
    if (!cleanEmail) {
      return 'Укажите email'
    }
    if (password.length < PASSWORD_MIN) {
      return `Пароль должен содержать не менее ${PASSWORD_MIN} символов`
    }
    if (password.length > PASSWORD_MAX) {
      return `Пароль должен быть не длиннее ${PASSWORD_MAX} символов`
    }
    if (isRegister && password !== confirmation) {
      return 'Пароли не совпадают'
    }
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanEmail = email.trim()
    const validationError = validate(cleanEmail)
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setPending(true)
    try {
      if (isRegister) {
        await register(cleanEmail, password)
      } else {
        await login(cleanEmail, password)
      }
    } catch (exception) {
      setError(errorMessage(exception))
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="auth">
      <form className="card" onSubmit={handleSubmit} noValidate>
        <header className="card__header">
          <p className="card__brand">Сервис бронирования ресурсов</p>
          <h1 className="card__title">{isRegister ? 'Регистрация' : 'Вход'}</h1>
          <p className="card__subtitle">
            {isRegister
              ? 'Создайте учётную запись по корпоративному email'
              : 'Введите email и пароль, чтобы продолжить'}
          </p>
        </header>

        <div className="tabs" role="tablist" aria-label="Вход или регистрация">
          <button
            type="button"
            role="tab"
            aria-selected={!isRegister}
            data-testid="auth-tab-login"
            className={isRegister ? 'tabs__item' : 'tabs__item tabs__item--active'}
            onClick={() => switchMode(MODE_LOGIN)}
          >
            Вход
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegister}
            data-testid="auth-tab-register"
            className={isRegister ? 'tabs__item tabs__item--active' : 'tabs__item'}
            onClick={() => switchMode(MODE_REGISTER)}
          >
            Регистрация
          </button>
        </div>

        <label className="field">
          <span className="field__label">Email</span>
          <input
            data-testid="login-email"
            className="field__input"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="ivanov@ssau.ru"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Пароль</span>
          <div className="field__control">
            <input
              data-testid="login-password"
              className="field__input field__input--with-action"
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder={`Не менее ${PASSWORD_MIN} символов`}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="field__action"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={passwordVisible ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {passwordVisible ? 'скрыть' : 'показать'}
            </button>
          </div>
        </label>

        {isRegister ? (
          <label className="field">
            <span className="field__label">Пароль ещё раз</span>
            <input
              data-testid="register-confirmation"
              className="field__input"
              type={passwordVisible ? 'text' : 'password'}
              name="password-confirmation"
              autoComplete="new-password"
              placeholder="Повторите пароль"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </label>
        ) : null}

        {error ? (
          <p className="alert" role="alert">
            {error}
          </p>
        ) : null}

        <button
          data-testid={isRegister ? 'register-submit' : 'login-submit'}
          className="button"
          type="submit"
          disabled={pending}
        >
          {pending
            ? isRegister
              ? 'Создаём…'
              : 'Вход…'
            : isRegister
              ? 'Зарегистрироваться'
              : 'Войти'}
        </button>

        <p className="card__footer">
          {isRegister ? 'Уже есть учётная запись? ' : 'Нет учётной записи? '}
          <button
            type="button"
            className="link"
            onClick={() => switchMode(isRegister ? MODE_LOGIN : MODE_REGISTER)}
          >
            {isRegister ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </p>
      </form>
    </main>
  )
}
