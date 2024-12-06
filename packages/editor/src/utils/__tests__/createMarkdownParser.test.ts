import { getSchemaByResolvedExtensions } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { getChatExtensions } from '../../chat'
import { getMarkdownExtensions } from '../../markdown'
import { getNoteExtensions } from '../../note'
import { createMarkdownParser } from '../createMarkdownParser'

describe('createMarkdownParser', () => {
  const SAMPLE_MARKDOWN = `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

This is a paragraph with **bold** and italics.

- Bullet one
- Bullet two

1. Number one
2. Number two

\`\`\`
const foo = "bar"
\`\`\`

Hard break
Soft break

---

![CleanShot 2024-03-22 at 16 42 23@2x](https://github.com/campsite/campsite/assets/739696/49b398b1-8c03-4255-a759-21b8b53a3f5d)

| Header | Header | Header |
|--------|--------|--------|
| Cell | Cell | Cell |
| Cell | Cell | Cell | 

> Ullamco eiusmod laborum minim nulla adipisicing incididunt occaecat consequat non ipsum ex qui excepteur culpa.

And [here](https://linear.app/campsite/issue/CAM-6845/normalize-notes) is a link. With a \`inline code\` mark.
  `

  it('parses markdown extensions', () => {
    const extensions = getMarkdownExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(SAMPLE_MARKDOWN)

    expect(result).toMatchSnapshot()
  })

  it('parses note extensions', () => {
    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(SAMPLE_MARKDOWN)

    expect(result).toMatchSnapshot()
  })

  it('parses chat extensions', () => {
    const extensions = getChatExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(SAMPLE_MARKDOWN)

    expect(result).toMatchSnapshot()
  })

  it('converts softbreaks to hardbreaks with markdown', () => {
    const md = `
Foo
Bar
    `
    const extensions = getMarkdownExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })
  it('converts softbreaks to hardbreaks with note', () => {
    const md = `
Foo
Bar
    `
    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('ignores API mentions', () => {
    const md = `
Hey <@U123456> thanks for letting me know!
    `
    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('converts known HTML', () => {
    const md =
      'This is **bold** and this is a mention <span data-type="mention" data-id="abcdefabcdef" data-label="User Name" data-username="username">@User Name</span> and a member mention <span data-type="mention" data-id="abcdefabcdef" data-label="User Name" data-role="member" data-username="username">@User Name</span>.'

    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('converts marks in HTML', () => {
    const md = 'This is <strong>bold</strong>.'

    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('converts HTML blocks with markdown inside', () => {
    const md = `
<details>

## Heading

- List item
- List item

This is some *bold* text.

</details>
`

    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('converts self-closing HTML', () => {
    const md =
      'Hey <span data-type="mention" data-id="abcdefabcdef" data-label="User Name" data-username="username" />.'

    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('retains unknown inline HTML', () => {
    const md = `
Bad prompt:
<prompt>
"Help me with a presentation."
</prompt>
`

    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('retains unknown block HTML', () => {
    const md = `
Bad prompt:

<prompt>
"Help me with a presentation."
</prompt>
`

    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('handles ending with supported HTML', () => {
    const md = `
Foo bar baz

<span data-type="mention" data-id="abcdefabcdef" data-label="User Name" data-username="username" />
`

    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('handles unsupported self-closing tag', () => {
    const md = `
What should we do with this <prompt />?
`

    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('handles supported opening tag with no close', () => {
    const md = `
<p>
Foo bar baz
`

    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('handles unsupported opening tag with no close', () => {
    const md = `
<prompt>
Foo bar baz
`

    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('handles supported closing tag with no open', () => {
    const md = `
Foo bar baz
</p>
`

    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('handles supported closing tag with no open in middle of paragraph', () => {
    const md = `
Foo bar baz

</p>

Cat dog fish
`

    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('handles unsupported closing tag with no open', () => {
    const md = `
Foo bar baz
</prompt>
`

    const extensions = getNoteExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('handles task lists', () => {
    const md = `
- [ ] Task one
- [x] Task two
    `
    const extensions = getMarkdownExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })

  it('strips unsupported link attribute values', () => {
    const md =
      'This is <a href="https://campsite.com" rel="noopener noreferrer expect author preload" target="_parent" class="prose-link py-10 bg-red-500">link</a>.'

    const extensions = getMarkdownExtensions()
    const schema = getSchemaByResolvedExtensions(extensions)
    const parser = createMarkdownParser(schema, extensions)
    const result = parser.parse(md)

    expect(result).toMatchSnapshot()
  })
})
