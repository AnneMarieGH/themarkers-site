import { groq } from 'next-sanity'

export const articleFields = groq`
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  readingTime,
  isPremium,
  mainImage {
    ...,
    "alt": alt
  },
  "author": author->{
    name,
    "slug": slug.current,
    image,
    bio
  },
  "categories": categories[]->{
    title,
    "slug": slug.current
  }
`

export const articlesQuery = groq`
  *[_type == "article" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    ${articleFields}
  }
`

export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    ${articleFields},
    body
  }
`

export const featuredArticlesQuery = groq`
  *[_type == "article" && featured == true && !(_id in path("drafts.**"))] | order(publishedAt desc)[0...3] {
    ${articleFields}
  }
`

export const categoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description
  }
`

export const articlesByCategoryQuery = groq`
  *[_type == "article" && $slug in categories[]->slug.current && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    ${articleFields}
  }
`
