import useSWRMutation from 'swr/mutation'
import _ from 'lodash'
import { LoginInfo } from 'src/model/type'

export const useLogin = () => {
  return useSWRMutation(
    'login',
    async (url: string, { arg: { code } }: { arg: { code: string } }): Promise<LoginInfo> => {
      return new Promise((resolve) => {
        _.delay(() => resolve({ token: '12315', tabCount: 3 }), 2000)
      })
    }
  )
}
