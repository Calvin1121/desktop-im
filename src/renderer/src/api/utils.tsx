import { fetcher } from '@renderer/utils/fetcher'
import useSWRMutation from 'swr/mutation'
import _ from 'lodash'

export const useIPLocation = () => {
  const url = 'https://api.ip.sb/geoip/'
  return useSWRMutation(url, async (url, { arg }: { arg: { uuid: string; ip?: string } }) => {
    const _url = url + (arg.ip ?? '')
    const res = await fetcher(_url)
    const data = _.pick(res, ['ip', 'timezone', 'country', 'city'])
    return { ...data, uuid: arg.uuid }
  })
}

// import { fetcher } from '@renderer/utils/fetcher'
// import useSWR from 'swr'
// import _ from 'lodash'
// import { ToolType } from '@renderer/view/app-select/index.constant'

// export const useIPLocation = (uuid?: string, tabState?: Map<string, Partial<Tab>>) => {
//     console.log(uuid)
//   const { ip, serve } = _.get(tabState?.get(uuid || '')?.configMap, ToolType.onSetTabProxy) || {}
//   const _ip = serve ? ip || '' : ''
//   const url = 'https://api.ip.sb/geoip/' + _ip + '?uuid=' + uuid
//   return useSWR(uuid ? url : null, async (url: string) => {
//     const res = await fetcher(url)
//     const data = _.pick(res, ['ip', 'timezone', 'country', 'city'])
//     const config = { ...data, uuid }
//     console.log(config)
//     return config
//   })
// }
