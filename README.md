# rbs-front — веб-интерфейс сервиса бронирования ресурсов

SPA на React 19 + Vite. Реализованы вход по email и паролю и главная страница (пока заглушка);
остальные экраны — по мере готовности API.

## Запуск

Требуется запущенный бэкенд (`rbs`) на `http://localhost:8080`.

```bash
npm ci
npm run dev     # http://localhost:5173
npm run build   # сборка в dist/
npm run lint
```

Dev-сервер проксирует запросы `/api` на бэкенд, поэтому CORS не нужен. Адрес бэкенда можно
переопределить: `VITE_API_PROXY=http://localhost:8080 npm run dev`. Если фронтенд обращается к API
по абсолютному адресу, задайте `VITE_API_BASE_URL` при сборке.

## Аутентификация

- `POST /api/v1/auth/login` → access-токен, хранится в `localStorage` (`rbs.access_token`);
- при загрузке страницы токен проверяется через `GET /api/v1/auth/me`, при `401` удаляется;
- выход вызывает `POST /api/v1/auth/logout` (токен попадает в список отозванных) и очищает хранилище;
- неаутентифицированный пользователь всегда попадает на `/login`, аутентифицированный — на `/`.

## Структура

```
src/api/client.js        обёртка над fetch: базовый адрес, токен, разбор problem+json
src/auth/context.js      контекст и хук useAuth
src/auth/AuthProvider.jsx состояние сессии: загрузка, вход, выход
src/pages/LoginPage.jsx  экран входа
src/pages/HomePage.jsx   главная страница
src/App.jsx              выбор экрана по состоянию сессии
```

## Обязательные атрибуты разметки

По техническому заданию элементы для сквозных тестов помечены `data-testid`:
`login-email`, `login-password`, `login-submit` — на экране входа.

## Docker

`Dockerfile` собирает статику и отдаёт её через nginx; `nginx.conf` проксирует `/api/` на сервис
`backend` из `docker-compose`. Чтобы compose собирал образ из исходников, раскомментируйте
`build: ../rbs-front` в `docker-compose.yaml` сервиса `frontend`.
