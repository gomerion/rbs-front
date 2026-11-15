import { apiFetch } from './client'

export async function fetchResources({ type, minCapacity, location, limit = 20, offset = 0 } = {}) {
  const params = new URLSearchParams()
  if (type) {
    params.set('type', type)
  }
  if (minCapacity !== '' && minCapacity !== null && minCapacity !== undefined) {
    params.set('min_capacity', String(minCapacity))
  }
  if (location && location.trim()) {
    params.set('location', location.trim())
  }
  params.set('limit', String(limit))
  params.set('offset', String(offset))
  return apiFetch(`/api/v1/resources?${params.toString()}`)
}
