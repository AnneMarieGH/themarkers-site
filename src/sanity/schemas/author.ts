import { defineField, defineType } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Name', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', type: 'slug', title: 'Slug', options: { source: 'name' } }),
    defineField({ name: 'image', type: 'image', title: 'Image', options: { hotspot: true } }),
    defineField({ name: 'bio', type: 'array', title: 'Bio', of: [{ type: 'block' }] }),
    defineField({ name: 'title', type: 'string', title: 'Job Title / Role' }),
    defineField({ name: 'twitter', type: 'string', title: 'Twitter handle' }),
    defineField({ name: 'linkedin', type: 'url', title: 'LinkedIn URL' }),
  ],
  preview: {
    select: { title: 'name', media: 'image' },
  },
})
