import { defineField, defineType } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Title', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title' } }),
    defineField({ name: 'description', type: 'text', title: 'Description' }),
    defineField({ name: 'color', type: 'string', title: 'Accent colour (hex)', placeholder: '#C9A96E' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
  },
})
