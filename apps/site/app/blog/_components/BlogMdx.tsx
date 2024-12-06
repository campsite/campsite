import React, { ComponentPropsWithoutRef } from 'react'
import { MDXRemote, MDXRemoteProps } from 'next-mdx-remote/rsc'
import NextImage from 'next/image'
import NextLink from 'next/link'
import { Refractor } from 'react-refractor'
import rehypeMdxCodeProps from 'rehype-mdx-code-props'

import { ALIAS_TO_LANGUAGE } from '@campsite/editor'

function Link({ href, ...props }: React.ComponentPropsWithoutRef<'a'>) {
  if (href && href.startsWith('/')) {
    return (
      <NextLink href={href} {...props}>
        {props.children}
      </NextLink>
    )
  }

  if (href?.startsWith('#')) {
    return <a href={href} {...props} />
  }

  return <a target='_blank' rel='noopener noreferrer' href={href} {...props} />
}

function Image(props: React.ComponentPropsWithoutRef<typeof NextImage>) {
  return <NextImage className='rounded-lg' {...props} />
}

function slugify(value: React.ReactNode) {
  return value
    ?.toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word characters except for -
    .replace(/--+/g, '-') // Replace multiple - with single -
}

function createHeading(level: number) {
  const Heading = ({ children }: React.PropsWithChildren) => {
    let slug = slugify(children)

    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor'
        })
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

const CodeBlock = (props: ComponentPropsWithoutRef<'pre'>) => {
  const preElement = props

  if (!preElement.children) return <></>
  const codeElement =
    typeof preElement.children === 'object' && 'type' in preElement.children && preElement.children.type === 'code'
      ? preElement.children
      : null

  if (!codeElement) return <>{preElement}</>
  const language = codeElement.props.className?.replace('language-', '')

  if (!language && !Object.keys(ALIAS_TO_LANGUAGE).includes(language)) return <>{preElement}</>
  return <Refractor language={language} plainText={false} value={codeElement.props.children} />
}

let components: MDXRemoteProps['components'] = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  pre: CodeBlock,
  Image,
  a: Link
}

export function BlogMDX(props: MDXRemoteProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
      options={{ mdxOptions: { rehypePlugins: [rehypeMdxCodeProps] } }}
    />
  )
}
