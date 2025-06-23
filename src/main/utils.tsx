export const parseBase64 = (content: string) => {
  const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(content)
  let decodedData

  if (isBase64) {
    try {
      decodedData = Buffer.from(content, 'base64').toString('utf-8')
    } catch (e) {
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
  } catch (_) {
    return null
  }
}
