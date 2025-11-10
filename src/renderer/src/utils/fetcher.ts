export async function fetcher<JSON = any>(url: string, init?: RequestInit): Promise<JSON> {
  const defaultHeader = {
    'Content-Type': 'application/json'
  }
  const isFormData = init?.body instanceof FormData
  const initRequest: RequestInit = {
    ...init,
    headers: new Headers({
      ...(isFormData ? {} : defaultHeader),
      ...init?.headers
    })
  }
  if (init?.body && !isFormData && typeof init.body === 'object')
    initRequest.body = JSON.stringify(init.body)
  const res = await fetch(url, initRequest)

  if (res.ok) return res.json()
  throw res
}
