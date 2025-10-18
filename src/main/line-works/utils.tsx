import { BASE_IM_LIST, IM_TYPE, MessageTypeCode } from '../../model'
import { SendMsgParams } from '../../model/type'
import { FetchOptions } from '../fetcher'
import { genTempId } from '../utils'
import { URLS_MAP } from './constance'

export const getMessageType = (
  messageTypeCode: number,
  content: string,
  parsedExtras?: Record<string, string>
) => {
  let displayContent: string
  switch (messageTypeCode) {
    case MessageTypeCode.Text:
      displayContent = content
      break
    case MessageTypeCode.VoiceCall:
      displayContent = '「来电」'
      break
    case MessageTypeCode.ContactPoint:
      displayContent = '「联系人」'
      break
    case MessageTypeCode.Address:
      displayContent = `「位置消息」：${parsedExtras?.address}`
      break
    case MessageTypeCode.Image:
      displayContent = '「图片」'
      break
    case MessageTypeCode.File:
      displayContent = '「文件」'
      break
    case MessageTypeCode.Stk:
      displayContent = '「表情」'
      break
    case MessageTypeCode.Task:
      displayContent = '「任务」'
      break
    case MessageTypeCode.Survey:
      displayContent = '「问卷」'
      break
    case MessageTypeCode.Template:
      displayContent = '「模板」'
      break
    case MessageTypeCode.VoiceMsg:
      displayContent = '「语音」'
      break
    default:
      displayContent = '「未知类型消息」'
  }
  return displayContent
}

export const genHeaders = (headers: FetchOptions['headers']) => {
  return {
    'Content-Type': 'application/json',
    Connection: 'keep-alive',
    ...headers
  }
}

export const getBaseUrl = (): string => {
  return BASE_IM_LIST.find((item) => item.key === IM_TYPE.LineWorks)!.url
}

export const genContentMsg = (
  params: SendMsgParams
): { url: string; payload: Record<string, any> } => {
  const { content, channelNo, domainId, extras, type, userId } = params
  const tempId = genTempId()
  const url = getBaseUrl() + URLS_MAP.sendMessage
  const payload = {
    serviceId: 'works',
    channelNo,
    tempMessageId: tempId,
    caller: { domainId, userNo: userId },
    extras,
    content,
    msgTid: tempId,
    type
  }
  return { url, payload }
}

export const genMediaMsg = (
  params: SendMsgParams
): { url: string; payload: Record<string, any> } => {
  const { filename, filesize, channelType, type, channelNo } = params
  const url = getBaseUrl() + URLS_MAP.issueResourcePath
  const payload = {
    serviceId: 'works',
    filename,
    filesize,
    channelNo,
    msgType: type,
    channelType
  }
  return { url, payload }
}
