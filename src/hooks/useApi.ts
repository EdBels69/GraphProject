import { useState, useEffect, useCallback } from 'react'
import { withRetry } from '@/utils/retryHandler'

const API_BASE = '/api'

export function useApi<T>(endpoint: string, initialData: T | null = null, enableRetry: boolean = true) {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const fetchWithRetry = async () => {
        const response = await fetch(`${API_BASE}${endpoint}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.json()
      }

      const result = enableRetry
        ? await withRetry(fetchWithRetry, { maxRetries: 3, retryDelay: 1000 }, `api-${endpoint}`)
        : await fetchWithRetry()

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [endpoint, enableRetry])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    return fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

export function useApiPost<T>(endpoint: string, enableRetry: boolean = true) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const postData = useCallback(async (body: any) => {
    setLoading(true)
    setError(null)

    try {
      const postWithRetry = async () => {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
      }

      const result = enableRetry
        ? await withRetry(() => postWithRetry(), { maxRetries: 3, retryDelay: 1000 }, `post-${endpoint}`)
        : await postWithRetry()

      setData(result)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint, enableRetry])

  return { data, loading, error, postData }
}
