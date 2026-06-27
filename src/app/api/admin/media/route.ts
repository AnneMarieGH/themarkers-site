import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BUCKET = 'media'

async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  if (buckets?.find((b) => b.name === BUCKET)) return
  await supabaseAdmin.storage.createBucket(BUCKET, { public: true })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const altText = (formData.get('alt') as string) ?? ''

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'File must be an image' }, { status: 400 })

  await ensureBucket()

  const ext = file.name.split('.').pop() ?? 'jpg'
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(name, bytes, {
      contentType: file.type,
      metadata: { alt: altText, originalName: file.name },
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(name)
  return NextResponse.json({ url: publicUrl, name, alt: altText }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name || typeof name !== 'string') return NextResponse.json({ error: 'Missing name' }, { status: 400 })

  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([name])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await ensureBucket()

  const { data: files, error } = await supabaseAdmin.storage.from(BUCKET).list('', {
    limit: 200,
    sortBy: { column: 'created_at', order: 'desc' },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const items = (files ?? [])
    .filter((f) => f.name !== '.emptyFolderPlaceholder')
    .map((f) => ({
      name: f.name,
      url: supabaseAdmin.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
      createdAt: f.created_at,
      size: f.metadata?.size,
      alt: (f.metadata as Record<string, string> | null)?.alt ?? '',
    }))

  return NextResponse.json(items)
}
