import Link from 'next/link'

export function PremiumGate() {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FAFAF8] pointer-events-none" style={{ top: '-80px', height: '160px' }} />
      <div className="border border-[#C9A96E] rounded-sm p-8 text-center bg-[#FAFAF8]">
        <p className="text-[#C9A96E] text-xs font-semibold uppercase tracking-widest mb-3">Members Only</p>
        <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-3">Continue Reading</h3>
        <p className="text-[#6B6B6B] mb-6 max-w-sm mx-auto">
          This article is exclusive to members. Join to support independent Asian Australian storytelling.
        </p>
        <Link
          href="/membership"
          className="inline-flex items-center px-6 py-3 bg-[#C9A96E] text-white font-semibold rounded-sm hover:bg-[#A8853A] transition-colors"
        >
          Become a Member →
        </Link>
      </div>
    </div>
  )
}
