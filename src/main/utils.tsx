import _ from 'lodash'

export const parseBase64 = (content: string) => {
  const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(content)
  let decodedData

  if (isBase64) {
    try {
      decodedData = Buffer.from(content, 'base64').toString('utf-8')
    } catch {
      console.error('parse fial')
    }
  }
  return decodedData
}

export const parseJsonString = (str: string) => {
  const jsonString = str?.slice(str?.indexOf('{'))
  try {
    if (jsonString && jsonString.startsWith('{') && jsonString.endsWith('}')) {
      return JSON.parse(jsonString)
    }
  } catch {
    return null
  }
}

export const genTempId = (() => {
  let tempCounter = 0
  return () => {
    tempCounter = (tempCounter + 1) % 1000
    const timePart = Date.now() % 1e9
    const randPart = Math.floor(Math.random() * 100)
    return timePart * 100000 + tempCounter * 100 + randPart
  }
})()

export function findUrlInfo<T extends Record<string, string>>(url: string, urlsMap: T) {
  try {
    const u = new URL(url)
    const path = u.pathname.replace(/^\/+|\/+$/g, '')
    const matchedEntry = Object.entries(urlsMap).find(([_, value]) => path.endsWith(value))

    return {
      key: matchedEntry ? (matchedEntry[0] as keyof T) : null,
      hostname: u.origin
    }
  } catch {
    return { key: null, hostname: null }
  }
}

export function findChangedKey<T extends object>(
  _oldObj: T,
  _newObj: T,
  omitKeys?: Array<keyof T>
): keyof T | null {
  const oldObj = _.omit(_oldObj, omitKeys)
  const newObj = _.omit(_newObj, omitKeys)
  const allKeys = _.union(Object.keys(oldObj), Object.keys(newObj))

  for (const key of allKeys) {
    if (!_.isEqual(oldObj[key], newObj[key])) {
      return key
    }
  }

  return null
}
