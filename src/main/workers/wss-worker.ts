import { parentPort } from 'node:worker_threads'
import { FetchOptions, fetchWithRetry } from '../fetcher'

if (!parentPort) throw new Error('Worker thread must be launched by parent')

parentPort.on('message', async (requestArg: { url: string; options: FetchOptions }) => {
  const { url, options } = requestArg

  const [err, data] = await fetchWithRetry(url, options)

  parentPort?.postMessage({ err, data })
})
