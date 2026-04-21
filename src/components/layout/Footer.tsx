import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[#E5E5E0] bg-[#1A1A1A] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <p className="font-serif text-xl font-bold mb-3">The Markers</p>
            <p className="text-[#999] text-sm leading-relaxed max-w-sm">
              A refined publication celebrating Asian Australian entrepreneurs, businesses,
              and individuals making a positive impact on the broader community.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#999] mb-4">Read</p>
            <ul className="space-y-2">
              {[
                { label: 'All Stories', href: '/articles' },
                { label: 'Business', href: '/articles?category=business' },
                { label: 'Careers', href: '/articles?category=careers' },
                { label: 'Culture', href: '/articles?category=culture' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-[#999] hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#999] mb-4">Company</p>
            <ul className="space-y-2">
              {[
                { label: 'About', href: '/about' },
                { label: 'Advertise', href: '/advertise' },
                { label: 'Contact', href: '/contact' },
                { label: 'Privacy', href: '/privacy' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-[#999] hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[#333] text-[#666] text-xs">
          © {new Date().getFullYear()} The Markers. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
