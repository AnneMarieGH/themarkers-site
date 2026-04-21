import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

const articleSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  cover_image: z.string().url().optional().nullable().or(z.literal('')),
  category_id: z.number().int().positive().optional().nullable(),
  author_name: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']),
  is_featured: z.boolean().default(false),
  is_premium: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = articleSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data.' }, { status: 400 })

  const data = parsed.data
  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      ...data,
      cover_image: data.cover_image || null,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(article, { status: 201 })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(id, title, slug)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
