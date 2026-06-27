import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  cover_image: z.string().url().nullable().optional().or(z.literal('').transform(() => null)),
  video_url: z.string().url().nullable().optional().or(z.literal('').transform(() => null)),
  category_id: z.number().int().positive().nullable().optional(),
  author_name: z.string().nullable().optional(),
  status: z.enum(['draft', 'pending_review', 'published']).optional(),
  is_featured: z.boolean().optional(),
  is_premium: z.boolean().optional(),
  article_type: z.enum(['standard', 'video', 'sponsored']).nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  og_image: z.string().url().nullable().optional().or(z.literal('').transform(() => null)),
})

type Props = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data.' }, { status: 400 })

  const updates: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.status === 'published') {
    const { data: existing } = await supabase.from('articles').select('published_at, status').eq('id', id).single()
    if (existing && existing.status !== 'published') {
      updates.published_at = new Date().toISOString()
    }
  }

  const optionalCols = ['article_type', 'meta_title', 'meta_description', 'og_image'] as const
  let { data, error } = await supabase
    .from('articles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  // If the update failed due to missing optional columns, retry without them
  if (error && optionalCols.some((k) => error!.message?.includes(k))) {
    optionalCols.forEach((k) => delete (updates as Record<string, unknown>)[k])
    const retry = await supabase
      .from('articles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    data = retry.data
    error = retry.error
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Bust ISR cache whenever an article is saved or published
  revalidatePath('/')
  revalidatePath('/articles')
  if (data?.slug) revalidatePath(`/articles/${data.slug}`)

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { error } = await supabase.from('articles').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
