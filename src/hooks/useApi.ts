import { useState, useEffect, useCallback } from 'react'
import { withRetry } from '@/utils/retryHandler'
import { supabase } from '../../supabase/client'
import { IApiResponse } from '../../api/utils/response'

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
        const { data: { session } } = await supabase.auth.getSession()
        const headers: Record<string, string> = {}

        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }

        const response = await fetch(`${API_BASE}${endpoint}`, { headers })

        // Handle no-content
        if (response.status === 204) return null as T

        const rawResult = await response.json()

        // Check if it's an envelope (IApiResponse)
        if (rawResult && typeof rawResult === 'object' && 'success' in rawResult) {
          const apiResult = rawResult as IApiResponse<T>
          if (!apiResult.success) {
            throw new Error(apiResult.error?.message || `HTTP error! status: ${response.status}`)
          }
          return apiResult.data as T
        }

        // Otherwise, assume raw data (legacy/simple endpoints)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return rawResult as T
      }

      const result = enableRetry
        ? await withRetry(fetchWithRetry, { maxRetries: 3, retryDelay: 1000 }, `api-${endpoint}`)
        : await fetchWithRetry()

      setData(result as T)
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

export function useApiLazy<T, P = any>(endpoint: string | ((params: P) => string), enableRetry: boolean = true) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trigger = useCallback(async (params?: P) => {
    setLoading(true)
    setError(null)

    const finalEndpoint = typeof endpoint === 'function' ? endpoint(params as P) : endpoint

    try {
      const fetchWithRetry = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const headers: Record<string, string> = {}

        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }

        const response = await fetch(`${API_BASE}${finalEndpoint}`, { headers })

        if (response.status === 204) return null as T
        const rawResult = await response.json()

        if (rawResult && typeof rawResult === 'object' && 'success' in rawResult) {
          const apiResult = rawResult as IApiResponse<T>
          if (!apiResult.success) {
            throw new Error(apiResult.error?.message || `HTTP error! status: ${response.status}`)
          }
          return apiResult.data as T
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return rawResult as T
      }

      const result = enableRetry
        ? await withRetry(fetchWithRetry, { maxRetries: 3, retryDelay: 1000 }, `api-lazy-${finalEndpoint}`)
        : await fetchWithRetry()

      setData(result as T)
      return result as T
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint, enableRetry])

  return { data, loading, error, trigger }
}

export function useApiPost<T, B = any>(endpoint: string, enableRetry: boolean = true) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const postData = useCallback(async (body: B) => {
    setLoading(true)
    setError(null)

    try {
      const postWithRetry = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })

        if (response.status === 204) return null as T
        const rawResult = await response.json()

        if (rawResult && typeof rawResult === 'object' && 'success' in rawResult) {
          const apiResult = rawResult as IApiResponse<T>
          if (!apiResult.success) {
            throw new Error(apiResult.error?.message || `HTTP error! status: ${response.status}`)
          }
          return apiResult.data as T
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return rawResult as T
      }

      const result = enableRetry
        ? await withRetry(() => postWithRetry(), { maxRetries: 3, retryDelay: 1000 }, `post-${endpoint}`)
        : await postWithRetry()

      setData(result as T)
      return result as T
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint, enableRetry])

  return { data, loading, error, postData }
}

export function useApiPut<T, B = any>(endpoint: string | ((id: string) => string), enableRetry: boolean = true) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const putData = useCallback(async (body: B, id?: string) => {
    setLoading(true)
    setError(null)

    const finalEndpoint = typeof endpoint === 'function' ? endpoint(id || '') : endpoint

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

      const response = await fetch(`${API_BASE}${finalEndpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      })

      if (response.status === 204) {
        setData(null)
        return null as any
      }

      const rawResult = await response.json()

      if (rawResult && typeof rawResult === 'object' && 'success' in rawResult) {
        if (!rawResult.success) throw new Error(rawResult.error?.message || `HTTP error! status: ${response.status}`)
        setData(rawResult.data || null)
        return rawResult.data
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      setData(rawResult)
      return rawResult
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  return { data, loading, error, putData }
}

export function useApiDelete<T>(endpoint: string | ((id: string) => string)) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteData = useCallback(async (id?: string) => {
    setLoading(true)
    setError(null)

    const finalEndpoint = typeof endpoint === 'function' ? endpoint(id || '') : endpoint

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = {}
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

      const response = await fetch(`${API_BASE}${finalEndpoint}`, {
        method: 'DELETE',
        headers
      })

      const result: IApiResponse<T> = await response.json()
      if (!result.success) throw new Error(result.error?.message || `HTTP error! status: ${response.status}`)

      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  return { loading, error, deleteData }
}
