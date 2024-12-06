/* eslint-disable no-console */
import fs from 'fs'

import 'dotenv/config'

import { AnthropicProvider, createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI, OpenAIProvider } from '@ai-sdk/openai'
import { generateText, LanguageModelV1 } from 'ai'
import { Campsite } from 'campsite-client'
import jsdom from 'jsdom'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300 // 5 minutes; maximum on the Pro plan
export const dynamic = 'force-dynamic'

const ROLLUP_CHANNEL_ID = '95ubrnsovwd9'
const TMP_PATH = 'tmp'

const EXCLUDE_CHANNEL_IDS = [
  ROLLUP_CHANNEL_ID,
  '42ipkj6bp0of', // replays
  'izu9x0b54xy2' // daily updates
]

const DAILY_SUMMARY_SYSTEM_PROMPT = `
You are an AI assistant integrated into a team communication platform called Campsite.
Campsite uses posts as the main form of communication, similar to social media posts or email threads.
Your job is to roll up all the posts from today into a single "executive summary" post.
Someone viewing the summary should be able to understand what happened at the company today without having to read through all the individual posts.
Consider adding titles when appropriate, or organize posts into sections by the name of the channel.

Structure:
- Use a "daily report" format with opinionated organization.
- Begin with the title, "Here's what happened at the company today:"
- A "Highlights" section that summarizes the most important, highest-signal posts from the day.
- An hr divider (---)
- A middle section that groups posts by channel, and summarizes the discussion in 1-3 sentences.
- A final section that notes any announcements or low-signal information from the day.

Guidelines:
- Summarize each discussion in 1-2 sentences. Only use more sentences when a long discussion unfolded in the comments.
- Be concise, clear, and thorough. Use simple language and the 2000 most common words in the English language.
- Maintain a professional, friendly tone.
- Use sentence case for titles and headings.
- Ignore links to "dashboard" type services like Stripe, Plain, etc.
- Group posts from the "MRR" channel in a "New Customers" section. List each company, the amount they paid, and the MRR effect.
- Include a link to the original post in the summary, formatted as the word "link" as a markdown link.

Output format:
- Use markdown
- Use bullet points and bold text to highlight important information
- Include a "Links" section with any relevant EXTERNAL links that were shared, one per line.

Remember, you're an AI assistant integrated into a team communication platform.
Your goal is to enhance the discussion and provide valuable input that helps employees feel connected and informed.`

// environment variables aren't available outside of the request handler so we'll set these values in the handler
let campsite: Campsite
let anthropic: AnthropicProvider
let openai: OpenAIProvider
let model: LanguageModelV1

async function summarizePost(post: string) {
  // adapted from our internal post summarization prompt
  const system = `
		You are an expert at summarizing posts and comments. Your task is to create a list of points summarizing the most important main topics, decisions, and outcomes from a post, comments, and replies. Clearly indicate who is responsible for any decisions or outcomes if they are present.

		Follow this plan to create the summary:
		1. Analyze the entire post, comments, and replies and identify the main topics, decisions, and outcomes.
		2. Write a single sentence summary for each main topic, decision, or outcome. Each sentence should be no more than 15 words.
		3. Select no more than 5 of the most important summary sentences. Use your best judgement.
		4. Write a bulleted list of sentences you selected.

		When writing your response:
		- Always mention who is responsible for any decisions or outcomes if they are present.
		- Format each bullet in plain text.
		- Write in an active voice, using clear and concise sentences. Avoid using forms of "be" verbs and rearrange sentences to ensure the subject is acting, not being acted upon.
		- Use past tense when referring to events that have already occurred.
	`

  const { text } = await generateText({
    model,
    system,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: post }
    ]
  })

  return text
}

async function getTodayPosts() {
  const oneDayAgo = new Date()

  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  const posts = []

  for await (const post of campsite.posts.list({ sort: 'last_activity_at' })) {
    if (new Date(post.last_activity_at) < oneDayAgo) {
      break
    }

    if (EXCLUDE_CHANNEL_IDS.includes(post.channel.id)) {
      continue
    }

    posts.push(post)
  }

  return posts
}

type CommentWithReplies = Campsite.Posts.Comment & {
  replies: Campsite.Posts.Comment[]
}

// fetches all root comments and all replies to those comments
async function getFullCommentTree(postId: string): Promise<{ comments: CommentWithReplies[]; totalCount: number }> {
  const rootComments = await campsite.posts.comments.list(postId)
  const comments: CommentWithReplies[] = []
  let totalCount = rootComments.data.length

  for (const comment of rootComments.data) {
    const replies = await campsite.posts.comments.list(postId, {
      parent_id: comment.id
    })

    totalCount += replies.data.length
    comments.push({
      ...comment,
      replies: replies.data
    })
  }

  return { comments, totalCount }
}

function htmlToText(html: string) {
  const dom = new jsdom.JSDOM(html)

  return dom.window.document.body.textContent || '(no content found)'
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function writeToFile(path: string, content: string) {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  if (!fs.existsSync(TMP_PATH)) {
    fs.mkdirSync(TMP_PATH)
  }

  fs.writeFileSync(TMP_PATH + '/' + path, content)
}

export async function GET(request: NextRequest) {
  campsite = new Campsite({ apiKey: process.env.CAMPSITE_API_KEY })
  anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  if (request.nextUrl.searchParams.get('model') === 'openai') {
    model = openai('gpt-4o')
  } else {
    model = anthropic('claude-3-5-sonnet-20240620')
  }

  const posts = await getTodayPosts()

  console.log(`> Fetched ${posts.length} posts from the past 24 hours`)

  const postsToSummarize: string[] = []

  for (const post of posts) {
    console.log(`> Fetching discussion: ${post.title}`)

    let str = `POST TITLE: ${post.title}`

    str += `\nPOST AUTHOR: ${post.author.name}`
    str += '\nPOST CONTENT:\n```' + htmlToText(post.content) + '```'

    const { comments, totalCount } = await getFullCommentTree(post.id)

    if (comments.length > 0) {
      str += `\n\nCOMMENTS: (${totalCount} total)\n\n`

      for (const comment of comments) {
        str += ` ${comment.author.name}: ${htmlToText(comment.content)}\n`

        if (comment.replies.length > 0) {
          for (const reply of comment.replies) {
            str += `  ${reply.author.name} (in reply): ${htmlToText(reply.content)}\n`
          }
        }
      }

      str += '\n'
    }

    const summary = await summarizePost(str)

    const rollupSummary = `\
    POST TITLE: ${post.title}
    POST AUTHOR: ${post.author.name}
    POST CHANNEL: ${post.channel.name}
    POST URL: ${post.url}
    COMMENTS COUNT: ${post.comments_count}
    DISCUSSION SUMMARY:\n
    ${summary}`

    postsToSummarize.push(rollupSummary)

    await sleep(500)
  }

  const summarizedPosts = postsToSummarize.join('\n\n---\n\n')
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
  const dateStr = yesterday.toLocaleDateString().replace(/\//g, '-')

  writeToFile(`summarized-posts-${dateStr}.txt`, summarizedPosts)

  console.log(`> Summarizing ${postsToSummarize.length} posts`)

  const summary = await generateText({
    model,
    system: DAILY_SUMMARY_SYSTEM_PROMPT,
    prompt: summarizedPosts
  })

  if (process.env.NODE_ENV === 'production') {
    const finalPost = await campsite.posts.create({
      channel_id: ROLLUP_CHANNEL_ID,
      title: `Daily summary (${yesterday.toLocaleDateString()})`,
      content_markdown: summary.text
    })

    console.log(`> Posted daily summary to Campsite: ${finalPost.url}`)
  } else {
    console.log('> Writing summary to tmp file')
    writeToFile(`rollup-${dateStr}.txt`, summary.text)
  }

  return NextResponse.json({ success: true })
}
