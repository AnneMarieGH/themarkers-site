interface CategoryTagProps {
  title: string
  className?: string
}

export function CategoryTag({ title, className = '' }: CategoryTagProps) {
  return (
    <span
      className={`inline-block border border-[#E8A020] text-[#E8A020] hover:bg-[#E8A020] hover:text-white transition-colors duration-150 px-2.5 py-0.5 rounded text-[0.6875rem] font-semibold uppercase tracking-[0.1em] ${className}`}
    >
      {title}
    </span>
  )
}
