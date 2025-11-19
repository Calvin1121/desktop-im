import { fetcher } from '@renderer/utils/fetcher'
import useSWRMutation from 'swr/mutation'

export const useIPLocation = () => {
  const url = 'https://api.ip.sb/geoip/'
  return useSWRMutation(url, async (url, { arg }: { arg: { ip?: string } }) => {
    const _url = url + (arg?.ip ?? '')
    // console.log(_url)
    const res = await fetcher(_url)
    // console.log(_url, res)
    return res
  })
}
