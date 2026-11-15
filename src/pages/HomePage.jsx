import { useAuth } from '../auth/context'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="app" data-testid="home-page">
      <header className="app__header">
        <div>
          <p className="app__brand">Сервис бронирования ресурсов</p>
          <p className="app__user">
            {user?.email} · {user?.role}
          </p>
        </div>
        <button className="button button--ghost" type="button" onClick={logout}>
          Выйти
        </button>
      </header>

      <main className="app__main">
        <h1 className="app__title">Главная страница</h1>
        <p className="app__hint">
          Здесь появятся ресурсы, свободные интервалы и свои брони.
        </p>
      </main>
    </div>
  )
}
