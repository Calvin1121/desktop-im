import { MessageTypeCode } from "../../model"

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
