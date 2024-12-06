import { Message, Position } from './types'

export function getBorderRadiusClasses(position: Position, message: Message) {
  if (message.viewer_is_sender) {
    switch (position) {
      case 'first':
        return 'rounded-[18px] rounded-br after:rounded-[18px] after:rounded-br'
      case 'middle':
        return 'rounded-r rounded-l-[18px] after:rounded-r after:rounded-l-[18px]'
      case 'last':
        return 'rounded-l-[18px] rounded-tr-[18px] rounded-br-[18px] after:rounded-l-[18px] after:rounded-tr-[18px] after:rounded-br-[18px]'
      case 'only':
        return 'rounded-[18px] after:rounded-[18px]'
    }
  } else {
    switch (position) {
      case 'first':
        return 'rounded-[18px] rounded-bl after:rounded-[18px] after:rounded-bl'
      case 'middle':
        return 'rounded-l rounded-r-[18px] after:rounded-l after:rounded-r-[18px]'
      case 'last':
        return 'rounded-r-[18px] rounded-tl rounded-bl-[18px] after:rounded-r-[18px] after:rounded-tl after:rounded-bl-[18px]'
      case 'only':
        return 'rounded-[18px] after:rounded-[18px]'
    }
  }
}
