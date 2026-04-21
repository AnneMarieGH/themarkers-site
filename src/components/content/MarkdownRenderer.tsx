import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => <h2 className="font-sans font-bold text-2xl mt-10 mb-4 text-[#1A1A1A]">{children}</h2>,
        h3: ({ children }) => <h3 className="font-sans font-semibold text-xl mt-8 mb-3 text-[#1A1A1A]">{children}</h3>,
        p: ({ children }) => <p className="mb-6 leading-relaxed">{children}</p>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#A8853A] underline underline-offset-2 hover:text-[#C9A96E]">
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-[#C9A96E] pl-6 italic text-[#6B6B6B] my-8 text-lg leading-relaxed">{children}</blockquote>
        ),
        ul: ({ children }) => <ul className="list-disc list-inside mb-6 space-y-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-6 space-y-2">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        img: ({ src, alt }) => typeof src === 'string' && src ? (
          <figure className="my-8">
            <div className="relative overflow-hidden rounded-sm" style={{ aspectRatio: '16/9' }}>
              <Image src={src} alt={alt ?? ''} fill className="object-cover" unoptimized />
            </div>
            {alt && <figcaption className="text-xs text-[#6B6B6B] text-center mt-2">{alt}</figcaption>}
          </figure>
        ) : null,
        hr: () => <hr className="border-[#E5E5E0] my-10" />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
