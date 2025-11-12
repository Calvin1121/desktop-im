import useSWRMutation from 'swr/mutation'
import _ from 'lodash'

export const useLogin = () => {
  return useSWRMutation(
    'login',
    async (url: string, { arg: { code } }: { arg: { code: string } }) => {
      return new Promise((resolve) => {
        _.delay(() => resolve({ url, code }), 2000)
      })
    }
  )
}
