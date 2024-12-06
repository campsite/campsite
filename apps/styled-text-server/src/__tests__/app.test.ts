/* eslint-disable max-lines */
import supertest from 'supertest'
import { describe, expect, it } from 'vitest'

import { app } from '../app'

const KITCHEN_SYNC_MARKDOWN = `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

<!-- this is a comment -->

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

describe('app', () => {
  describe('POST /html_to_slack', () => {
    it('accepts html and returns Slack blocks', async () => {
      const html = `<h1>My markdown</h1>

<p>It has <b>bold</b> and <i>italics</i> and a <a href="https://campsite.com"><b>bold link</b></a>.</p>

<p>It has multiple paragraphs.</p>`

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*My markdown*',
            verbatim: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'It has *bold* and _italics_ and a <https://campsite.com|*bold link*>.',
            verbatim: true
          }
        },
        {
          type: 'section',
          text: {
            text: 'It has multiple paragraphs.',
            type: 'mrkdwn',
            verbatim: true
          }
        }
      ]

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('converts task lists into emoji', async () => {
      const html = `<ul class="task-list" data-type="taskList">
      <li class="task-item" data-checked="false" data-type="taskItem">
        <label><input type="checkbox"><span></span></label>
        <div><p>Unchecked</p></div>
      </li>
      <li class="task-item" data-checked="true" data-type="taskItem">
        <label><input type="checkbox" checked="checked"><span></span></label>
        <div><p>Checked</p></div>
      </li>
    </ul>`

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `• :white_medium_small_square: Unchecked
• ✓ Checked`,
            verbatim: true
          }
        }
      ]

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('converts task lists with empty checked value into emoji', async () => {
      const html = `<ul class="task-list" data-type="taskList">
      <li class="task-item" data-checked="false" data-type="taskItem">
        <label><input type="checkbox"><span></span></label>
        <div><p>Unchecked</p></div>
      </li>
      <li class="task-item" data-checked="true" data-type="taskItem">
        <label><input type="checkbox" checked><span></span></label>
        <div><p>Checked</p></div>
      </li>
    </ul>`

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `• :white_medium_small_square: Unchecked
• ✓ Checked`,
            verbatim: true
          }
        }
      ]

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('strips empty sections', async () => {
      const html = `<p>Foo bar</p>
    <p><br><br></p>
    <p>Cat dog<br><br>Boy howdy</p>`

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Foo bar`,
            verbatim: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Cat dog\n\nBoy howdy`,
            verbatim: true
          }
        }
      ]

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('retains blockquotes and wraps in section', async () => {
      const html = `<blockquote>Foo bar</blockquote>`

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            // extra newline added by jsx-slack and trimmed by slack
            text: `&gt; Foo bar
&gt; `,
            verbatim: true
          }
        }
      ]

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('converts <img> tags to images', async () => {
      const html = `<img src="https://campsite.com/image.png" alt="alt text" />`

      const expectedBlocks = [
        {
          type: 'image',
          image_url: 'https://campsite.com/image.png',
          alt_text: 'alt text'
        }
      ]

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('converts link unfurls into urls', async () => {
      const html = `<link-unfurl href="https://campsite.com"></link-unfurl>`

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'https://campsite.com',
            verbatim: true
          }
        }
      ]

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('parses inline attachments', async () => {
      const html = `<post-attachment id="1scvs2jokefh" file_type="" width="0" height="0"></post-attachment><post-attachment id="1scvs2jokefh" file_type="image/png" width="0" height="0"></post-attachment>`

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '_📄 Open this post on Campsite to view this attachment._',
            verbatim: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '_🖼️ Open this post on Campsite to view this attachment._',
            verbatim: true
          }
        }
      ]

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('parses media galleries', async () => {
      const html = `<media-gallery><media-gallery-item id="foo"></media-gallery-item></media-gallery>`

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '_🖼️ Open this post on Campsite to view attachments._',
            verbatim: true
          }
        }
      ]

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('strips extremely long links', async () => {
      const html = `<p>my <a href="${'a'.repeat(3000)}">link</a></p>`

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'my link',
            verbatim: true
          }
        }
      ]

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('splits long unordered lists into separate blocks', async () => {
      const html = `
        <ul>
          <li>
            <p>First item <a href="${'a'.repeat(1990)}">a</a></p>
            <ul>
              <li>First sub-item</li>
              <li>Second sub-item</li>
            </ul>
          </li>
          <li>
            <p>Second item</p>
            <ul>
              <li>First sub-item</li>
              <li>Second sub-item</li>
            </ul>
          </li>
        </ul>`

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            // eslint-disable-next-line no-irregular-whitespace
            text: `• First item <${'a'.repeat(1990)}|a>\n  ◦ First sub-item\n  ◦ Second sub-item`,
            verbatim: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '• Second item\n  ◦ First sub-item\n  ◦ Second sub-item',
            verbatim: true
          }
        }
      ]

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('splits long ordered lists into separate blocks', async () => {
      const html = `
        <ol>
          <li>
            <p>First item ${'a'.repeat(2000)}</p>
            <ol>
              <li>First sub-item</li>
              <li>Second sub-item</li>
            </ul>
          </li>
          <li>
            <p>Second item</p>
            <ol>
              <li>First sub-item</li>
              <li>Second sub-item</li>
            </ul>
          </li>
        </ol>`

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            // eslint-disable-next-line no-irregular-whitespace
            text: `1. First item ${'a'.repeat(2000)}\n   1. First sub-item\n   2. Second sub-item`,
            verbatim: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '2. Second item\n   1. First sub-item\n   2. Second sub-item',
            verbatim: true
          }
        }
      ]

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('replaces too long sections', async () => {
      const html = '<p>' + 'a'.repeat(3001) + '</p>'

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '_Removed a section too long to display in Slack._',
            verbatim: true
          }
        }
      ]

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('replaces custom reactions with names', async () => {
      const html =
        '<p>yo <img data-type="reaction" src="https://campsite.imgix.net/custom-reactions-packs/blobs/blob-smile-happy.png" alt="blob-smile-happy" draggable="false" data-id="dvyazibgmy8w" data-name="blob-smile-happy"></p>'

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'yo :blob-smile-happy:',
            verbatim: true
          }
        }
      ]

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('handles <details> tags', async () => {
      const html = '<details><summary>Summary</summary><div><p>Details</p></div></details>'

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            text: '*Summary*',
            type: 'mrkdwn',
            verbatim: true
          }
        },
        {
          type: 'section',
          text: {
            text: 'Details',
            type: 'mrkdwn',
            verbatim: true
          }
        }
      ]

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })

    it('handles <kbd> tags', async () => {
      const html = '<p>Shortcut: <kbd>Mod</kbd> <kbd>F</kbd></p>'

      const res = await supertest(app)
        .post('/html_to_slack')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ html })

      const expectedBlocks = [
        {
          type: 'section',
          text: {
            text: 'Shortcut: `Mod` `F`',
            type: 'mrkdwn',
            verbatim: true
          }
        }
      ]

      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(expectedBlocks)
    })
  })
  describe('POST /markdown_to_html', () => {
    it('errors on bad editor', async () => {
      const res = await supertest(app)
        .post('/markdown_to_html')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ markdown: 'foo **bar**', editor: 'wrong' })

      expect(res.statusCode).toEqual(500)
    })

    it('errors on non-string markdown', async () => {
      const res = await supertest(app)
        .post('/markdown_to_html')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ markdown: 2, editor: 'markdown' })

      expect(res.statusCode).toEqual(400)
    })

    it('it returns note html', async () => {
      const res = await supertest(app)
        .post('/markdown_to_html')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ markdown: KITCHEN_SYNC_MARKDOWN, editor: 'note' })

      expect(res.statusCode).toEqual(200)
      expect(res.body.html).toMatchSnapshot()
    })

    it('it returns markdown html', async () => {
      const res = await supertest(app)
        .post('/markdown_to_html')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ markdown: KITCHEN_SYNC_MARKDOWN, editor: 'markdown' })

      expect(res.statusCode).toEqual(200)
      expect(res.body.html).toMatchSnapshot()
    })

    it('it returns chat html', async () => {
      const res = await supertest(app)
        .post('/markdown_to_html')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ markdown: KITCHEN_SYNC_MARKDOWN, editor: 'chat' })

      expect(res.statusCode).toEqual(200)
      expect(res.body.html).toMatchSnapshot()
    })

    it('it retains input html', async () => {
      const input =
        'This is **bold** and this is a mention <span data-type="mention" data-id="abcdefabcdef" data-label="User Name" data-username="username">@User Name</span>.'

      const res = await supertest(app)
        .post('/markdown_to_html')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ markdown: input, editor: 'markdown' })

      expect(res.statusCode).toEqual(200)
      expect(res.body.html).toMatchSnapshot()
    })

    it('it trims whitespace', async () => {
      const input = `


# Foo bar

Cat dog                              
`

      const res = await supertest(app)
        .post('/markdown_to_html')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.AUTHTOKEN}`)
        .send({ markdown: input, editor: 'markdown' })

      expect(res.statusCode).toEqual(200)
      expect(res.body.html).toMatchSnapshot()
    })
  })
})
