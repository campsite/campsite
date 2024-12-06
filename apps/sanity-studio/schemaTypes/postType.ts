import { defineField, defineType } from 'sanity'

export const postType = defineType({
  name: 'glossary',
  title: 'Glossary',
  type: 'document',
  fields: [
    defineField({
      title: 'Category',
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Slack', value: 'slack' },
          { title: 'Linear', value: 'linear' }
        ]
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'shortDescription',
      type: 'string',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'markdown',
      type: 'markdown',
      description: 'A Github flavored markdown field with image uploading'
    })
  ]
})
