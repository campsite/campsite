import { cn, Link } from '@campsite/ui'

import { Kbd } from '@/components/RichTextRenderer/handlers/Kbd'
import { convertAttributes } from '@/components/RichTextRenderer/utils/attributes'

import { NodeHandler } from '.'

export const Text: NodeHandler = ({ node }) => {
  const content = node.text

  if (!content) {
    return <></>
  }

  const attrs = node.attrs ?? {}
  const marks = node.marks ?? []

  // plain text node
  if (marks.length === 0) {
    return <span {...convertAttributes(attrs)}>{content}</span>
  }

  const [currentMark, ...restMarks] = marks

  let Element: React.ElementType = 'span'
  let markAttrs: Record<string, any> = { ...(currentMark.attrs ?? {}) }
  let hasHref = false

  switch (currentMark.type) {
    case 'bold':
      Element = 'strong'
      markAttrs.className = cn(markAttrs.className, 'font-semibold')
      break
    case 'code':
      Element = 'code'
      break
    case 'italic':
      Element = 'em'
      markAttrs.className = cn(markAttrs.className, 'italic')
      break
    case 'link':
      Element = 'a'
      hasHref = !!markAttrs.href
      if (hasHref) {
        Element = Link
      }
      break
    case 'strike':
      markAttrs.className = cn(markAttrs.className, 'line-through')
      break
    case 'underline':
      markAttrs.className = cn(markAttrs.className, 'underline')
      break
    case 'kbd':
      Element = Kbd
      markAttrs.textContent = content
      break
    default:
      break
  }

  const {
    // not sure about supporting `className` at all, but we do rely on some CSS classes inside TipTap
    className = '',
    // not used for output rendering
    truncated: _,
    // pass the rest of these to the element
    ...finalAttrs
  } = convertAttributes(markAttrs)

  return (
    <Element {...finalAttrs} href={markAttrs.href} className={cn(finalAttrs.class, className)}>
      <Text node={{ text: content, marks: restMarks }} />
    </Element>
  )
}
