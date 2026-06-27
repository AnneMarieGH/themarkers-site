import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-[#E8A020] text-xs font-semibold uppercase tracking-widest mb-4">404</p>
      <h1 className="font-playfair font-bold text-4xl sm:text-5xl text-[#1A1A1A] mb-4">
        Page not found
      </h1>
      <p className="text-[#6B6B6B] text-base mb-8 max-w-md">
        The story you&apos;re looking for has moved or doesn&apos;t exist. Try our latest stories instead.
      </p>
      <Link
        href="/articles"
        className="px-6 py-3 bg-[#E8A020] text-white text-sm font-semibold rounded-sm hover:bg-[#C8851A] transition-colors"
      >
        Browse all stories
      </Link>
    </div>
  )
}
