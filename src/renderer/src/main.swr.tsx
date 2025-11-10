import React, { FC } from 'react'
import { SWRConfig } from 'swr'
import { fetcher } from './utils/fetcher'

export const SWRProviderCache = new Map()

export const ConfigSWR: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        provider: () => SWRProviderCache,
        fetcher
      }}
    >
      {children}
    </SWRConfig>
  )
}
