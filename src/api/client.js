const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const TOKEN_KEY = 'rbs.access_token'

export class ApiError extends Error {
  constructor(status, payload) {
    super(payload?.detail ?? payload?.title ?? 'Ошибка запроса')
    this.name = 'ApiError'
    this.status = status
    this.code = payload?.code ?? 'unknown'
    this.payload = payload
  }
}

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY)
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  const token = auth ? getToken() : null
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, { code: 'network_error', detail: 'Сервис недоступен' })
  }

  const text = await response.text()
  let payload = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { detail: text }
    }
  }
  if (!response.ok) {
    throw new ApiError(response.status, payload)
  }
  return payload
}

export function errorMessage(exception) {
  if (!(exception instanceof ApiError)) {
    return 'Не удалось выполнить запрос'
  }
  if (exception.code === 'network_error') {
    return 'Сервис недоступен: проверьте, что бэкенд запущен'
  }
  if (exception.code === 'rate_limited') {
    return 'Слишком много неудачных попыток входа, попробуйте позже'
  }
  if (exception.code === 'email_taken') {
    return 'Этот email уже зарегистрирован — войдите или используйте другой'
  }
  if (exception.status === 401) {
    return 'Неверный email или пароль'
  }
  if (exception.code === 'validation_error') {
    return exception.message
  }
  return exception.message
}
