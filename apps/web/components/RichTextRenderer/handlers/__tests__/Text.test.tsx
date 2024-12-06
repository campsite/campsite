import { render } from '@testing-library/react'
import { JSONContent } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { Text } from '@/components/RichTextRenderer/handlers/Text'

describe('Text', () => {
  it('renders plain text without marks', () => {
    const node: JSONContent = {
      type: 'text',
      text: 'Hello, World!'
    }

    const { container } = render(<Text node={node} />)

    expect(container.textContent).toBe('Hello, World!')
  })

  it('renders text with bold mark', () => {
    const node: JSONContent = {
      type: 'text',
      text: 'Hello, World!',
      marks: [{ type: 'bold' }]
    }

    const { container } = render(<Text node={node} />)
    const strongElement = container.querySelector('strong')

    expect(strongElement).not.toBeNull()
    expect(strongElement?.textContent).toBe('Hello, World!')
  })

  it('renders text with italic and bold marks nested', () => {
    const node: JSONContent = {
      type: 'text',
      text: 'Hello, World!',
      marks: [{ type: 'bold' }, { type: 'italic' }]
    }

    const { container } = render(<Text node={node} />)
    const strongElement = container.querySelector('strong')
    const emElement = container.querySelector('em')

    expect(strongElement).not.toBeNull()
    expect(emElement).not.toBeNull()
    expect(emElement?.parentElement).toBe(strongElement)
    expect(emElement?.textContent).toBe('Hello, World!')
  })

  it('renders text with link, bold, and italic marks nested', () => {
    const node: JSONContent = {
      type: 'text',
      text: 'Hello, World!',
      marks: [
        {
          type: 'link',
          attrs: { href: 'https://example.com', target: '_blank' }
        },
        { type: 'bold' },
        { type: 'italic' }
      ]
    }

    const { container } = render(<Text node={node} />)
    const linkElement = container.querySelector('a')
    const strongElement = container.querySelector('strong')
    const emElement = container.querySelector('em')

    expect(linkElement).not.toBeNull()
    expect(linkElement?.getAttribute('href')).toBe('https://example.com')
    expect(linkElement?.getAttribute('target')).toBe('_blank')
    expect(strongElement).not.toBeNull()
    expect(emElement).not.toBeNull()

    // Ensuring the correct nesting order
    expect(strongElement?.parentElement).toBe(linkElement)
    expect(emElement?.parentElement).toBe(strongElement)
    expect(emElement?.textContent).toBe('Hello, World!')
  })

  it('renders text with kbd mark', () => {
    const modNode: JSONContent = {
      type: 'text',
      text: 'Mod', // 'Mod' should be replaced by ⌘ in the renderer
      marks: [{ type: 'kbd' }]
    }
    const altNode: JSONContent = {
      type: 'text',
      text: 'Alt', // 'Alt' should be replaced by ⌥ in the renderer
      marks: [{ type: 'kbd' }]
    }

    const { container } = render(
      <>
        <Text node={modNode} />
        <Text node={altNode} />
      </>
    )
    const kbdElements = container.querySelectorAll('kbd')

    expect(kbdElements).toHaveLength(2)
    expect(kbdElements[0]?.textContent).toBe('⌘')
    expect(kbdElements[1]?.textContent).toBe('⌥')
  })
})
