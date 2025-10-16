export interface FetchOptions extends RequestInit {
  retryCount?: number
  timeout?: number
  uuid?: string
}

const DEFAULT_RETRY = 1
const DEFAULT_TIMEOUT = 10_000

export function fetchWithRetry(
  url: string,
  options: FetchOptions
): Promise<[Error | null, any, () => void]> {
  const { retryCount = DEFAULT_RETRY, timeout = DEFAULT_TIMEOUT, ...init } = options

  const controller = new AbortController()
  let aborted = false

  const abort = () => {
    aborted = true
    controller.abort()
  }

  const task = (async (): Promise<[Error | null, any, () => void]> => {
    let attempts = 0

    while (attempts <= retryCount) {
      try {
        const timer = setTimeout(() => controller.abort(), timeout)
        const res = await fetch(url, { ...init, signal: controller.signal })
        clearTimeout(timer)

        const contentType = res.headers.get('content-type')
        if (!res.ok) throw new Error(`[${res.status}] ${res.statusText}`)

        const data = contentType?.includes('application/json') ? await res.json() : await res.text()

        return [null, data, abort]
      } catch (err) {
        if (aborted || attempts >= retryCount) return [err as Error, null, abort]

        if ((err as any).name === 'AbortError' && aborted) return [err as Error, null, abort]

        attempts++
      }
    }

    return [new Error('Unexpected retry failure'), null, abort]
  })()

  return task
}
