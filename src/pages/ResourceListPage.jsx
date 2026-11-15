import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from '../api/client'
import { fetchResources } from '../api/resources'
import { useAuth } from '../auth/context'

const PAGE_SIZE = 20

const TYPE_OPTIONS = [
  { value: '', label: 'Все типы' },
  { value: 'room', label: 'Переговорные' },
  { value: 'equipment', label: 'Оборудование' },
  { value: 'vehicle', label: 'Транспорт' },
]

const TYPE_LABELS = {
  room: 'Переговорная',
  equipment: 'Оборудование',
  vehicle: 'Транспорт',
}

const EMPTY_FILTERS = { type: '', minCapacity: '', location: '' }

export default function ResourceListPage() {
  const { logout } = useAuth()
  const [form, setForm] = useState(EMPTY_FILTERS)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const handleFailure = useCallback(
    (exception) => {
      if (exception?.status === 401) {
        logout()
        return
      }
      setError(errorMessage(exception))
      setStatus('error')
    },
    [logout],
  )

  useEffect(() => {
    let cancelled = false
    fetchResources({ ...filters, limit: PAGE_SIZE, offset: 0 })
      .then((page) => {
        if (cancelled) {
          return
        }
        setItems(page.items ?? [])
        setTotal(page.total ?? 0)
        setStatus('ready')
      })
      .catch((exception) => {
        if (!cancelled) {
          handleFailure(exception)
        }
      })
    return () => {
      cancelled = true
    }
  }, [filters, handleFailure])

  function reload(nextFilters) {
    setStatus('loading')
    setError('')
    setFilters(nextFilters)
  }

  function handleSubmit(event) {
    event.preventDefault()
    reload({ ...form })
  }

  function handleReset() {
    setForm(EMPTY_FILTERS)
    reload(EMPTY_FILTERS)
  }

  async function handleLoadMore() {
    setPending(true)
    try {
      const page = await fetchResources({ ...filters, limit: PAGE_SIZE, offset: items.length })
      setItems((current) => [...current, ...(page.items ?? [])])
      setTotal(page.total ?? 0)
    } catch (exception) {
      handleFailure(exception)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="resources" data-testid="resource-list">
      <div className="resources__head">
        <h1 className="app__title">Ресурсы</h1>
        <p className="app__hint">Переговорные, оборудование и транспорт, доступные для брони</p>
      </div>

      <form className="filters" onSubmit={handleSubmit}>
        <label className="filters__field">
          <span className="field__label">Тип</span>
          <select
            className="field__input"
            name="type"
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="field__label">Местоположение</span>
          <input
            className="field__input"
            type="text"
            name="location"
            placeholder="Например, Корпус 3"
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
          />
        </label>

        <label className="filters__field filters__field--narrow">
          <span className="field__label">Вместимость от</span>
          <input
            className="field__input"
            type="number"
            name="minCapacity"
            min="0"
            placeholder="0"
            value={form.minCapacity}
            onChange={(event) => setForm({ ...form, minCapacity: event.target.value })}
          />
        </label>

        <div className="filters__actions">
          <button className="button" type="submit">
            Найти
          </button>
          <button className="button button--ghost" type="button" onClick={handleReset}>
            Сбросить
          </button>
        </div>
      </form>

      {status === 'loading' ? <p className="state">Загрузка ресурсов…</p> : null}

      {status === 'error' ? (
        <div className="state state--error">
          <p className="alert" role="alert">
            {error}
          </p>
          <button className="button button--ghost" type="button" onClick={() => reload({ ...filters })}>
            Повторить
          </button>
        </div>
      ) : null}

      {status === 'ready' && items.length === 0 ? (
        <p className="state">
          Ничего не найдено. Измените фильтры или попросите администратора добавить ресурсы.
        </p>
      ) : null}

      {status === 'ready' && items.length > 0 ? (
        <>
          <p className="resources__count">Найдено: {total}</p>
          <ul className="grid">
            {items.map((resource) => (
              <li className="resource" key={resource.id} data-testid="resource-card" data-resource-id={resource.id}>
                <div className="resource__head">
                  <h2 className="resource__name">{resource.name}</h2>
                  <span className="badge">{TYPE_LABELS[resource.type] ?? resource.type}</span>
                </div>
                <p className="resource__meta">{resource.location}</p>
                <p className="resource__meta">Вместимость: {resource.capacity}</p>
                {resource.features?.length ? (
                  <ul className="chips">
                    {resource.features.map((feature) => (
                      <li className="chip" key={feature}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="resource__code">{resource.code}</p>
              </li>
            ))}
          </ul>
          {items.length < total ? (
            <div className="resources__more">
              <button className="button button--ghost" type="button" onClick={handleLoadMore} disabled={pending}>
                {pending ? 'Загрузка…' : 'Показать ещё'}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
