'use client'

import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import type { PortableTextBlock } from '@/lib/types'

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null
      const src = urlFor(value).width(1200).auto('format').url()
      return (
        <figure className="my-8">
          <div className="relative overflow-hidden rounded-sm" style={{ aspectRatio: '16/9' }}>
            <Image src={src} alt={value.alt ?? ''} fill className="object-cover" />
          </div>
          {value.caption && (
            <figcaption className="text-xs text-[#6B6B6B] text-center mt-2">{value.caption}</figcaption>
          )}
        </figure>
      )
    },
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" className="text-[#A8853A] underline underline-offset-2 hover:text-[#C9A96E]">
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
  block: {
    normal: ({ children }) => <p className="mb-6 leading-relaxed">{children}</p>,
    h2: ({ children }) => <h2 className="font-sans font-bold text-2xl mt-10 mb-4 text-[#1A1A1A]">{children}</h2>,
    h3: ({ children }) => <h3 className="font-sans font-semibold text-xl mt-8 mb-3 text-[#1A1A1A]">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#C9A96E] pl-6 italic text-[#6B6B6B] my-8 text-lg leading-relaxed">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside mb-6 space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside mb-6 space-y-2">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
}

export function PortableTextRenderer({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />
}
