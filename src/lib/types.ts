export interface Author {
  name: string
  slug: string
  image?: SanityImage
  bio?: PortableTextBlock[]
}

export interface Category {
  _id?: string
  title: string
  slug: string
  description?: string
}

export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
}

export interface PortableTextBlock {
  _type: string
  _key: string
  style?: string
  children?: Array<{
    _type: string
    _key: string
    text: string
    marks?: string[]
  }>
}

export interface Article {
  _id: string
  _createdAt: string
  title: string
  slug: string
  excerpt?: string
  publishedAt: string
  readingTime?: number
  mainImage?: SanityImage
  author?: Author
  categories?: Category[]
  body?: PortableTextBlock[]
  isPremium?: boolean
}
