'use client'

import { useState, useRef, useEffect } from 'react'

const BRAND_SYSTEM_PROMPT = `You are the editorial AI for The Markers — a premium media brand for Asian Australians. You research topics and write compelling articles that reflect the brand's voice and values.

BRAND VALUES:
- Uplift The Community: Elevate Asian Australians through meaningful storytelling. Champion ambition, creativity and impact. Celebrate wins. Spotlight builders. Honour cultural nuances. Be proud, not precious. Critique thoughtfully. Challenge constructively.
- Respect The Audience: Attention is earned, not assumed. Every piece must inform, inspire or entertain — ideally all three.
- Credibility: Reputation compounds. Content must be rooted in facts and research. Be bold, not careless. Trust is the long-term asset.
- Intentional Reach: The audience is specific but nationally significant. Maximise reach without compromising standards.
- Discipline: Execution defines identity. If published, stand behind it.

TONE & VOICE:
- Positive and optimistic — never victim-based or "glass ceiling" narratives
- Focus on progress, wins, builders, makers
- Confident, sharp, culturally aware
- Inspired by: Tatler Asia (tone/branding), AFR Good Weekend (tone), The Juggernaut (structure/tone), Boss Hunting (structure)
- NOT: preachy, sensationalist, hype-driven, or condescending

AUDIENCE: Asian Australians — ambitious, culturally proud, entrepreneurial, creative

ARTICLE STRUCTURE:
1. A punchy, bold headline
2. A 1-2 sentence deck/subheadline
3. The body (800-1200 words typically): engaging intro hook, well-researched body paragraphs, quotes or data where relevant, cultural context, forward-looking close
4. A tagline or closing line that lands with impact

When researching, find recent and relevant facts, statistics, and examples. Synthesise them into the article naturally — don't just list facts. Write like a journalist, not an AI.

Format your final article output clearly with:
HEADLINE: [headline]
DECK: [subheadline]
ARTICLE:
[full article body]`

const STATUS_MESSAGES = [
  'Sourcing the story...',
  'Researching the landscape...',
  'Finding the angle...',
  'Crafting the narrative...',
  'Polishing the draft...',
]

interface ParsedArticle {
  headline: string | null
  deck: string | null
  body: string
}

export default function TheMarkersAgent() {
  const [topic, setTopic] = useState('')
  const [angle, setAngle] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusIdx, setStatusIdx] = useState(0)
  const [article, setArticle] = useState<ParsedArticle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const statusInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (loading) {
      statusInterval.current = setInterval(() => {
        setStatusIdx((i) => (i + 1) % STATUS_MESSAGES.length)
      }, 2200)
    } else {
      if (statusInterval.current) clearInterval(statusInterval.current)
      setStatusIdx(0)
    }
    return () => { if (statusInterval.current) clearInterval(statusInterval.current) }
  }, [loading])

  const parseArticle = (text: string): ParsedArticle => {
    const headlineMatch = text.match(/HEADLINE:\s*(.+)/i)
    const deckMatch = text.match(/DECK:\s*(.+)/i)
    const articleMatch = text.match(/ARTICLE:\s*([\s\S]+)/i)
    return {
      headline: headlineMatch ? headlineMatch[1].trim() : null,
      deck: deckMatch ? deckMatch[1].trim() : null,
      body: articleMatch ? articleMatch[1].trim() : text,
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError(null)
    setArticle(null)

    const userPrompt = `Research and write an article for The Markers on the following:

TOPIC: ${topic}
${angle ? `ANGLE / FOCUS: ${angle}` : ''}

Use web search to find current, relevant information. Then write a full article in The Markers' voice — positive, culturally specific to Asian Australians, credible, and compelling. Follow the article structure guidelines.`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: BRAND_SYSTEM_PROMPT,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{ role: 'user', content: userPrompt }],
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error.message)

      const fullText = (data.content as Array<{ type: string; text?: string }>)
        .filter((b) => b.type === 'text')
        .map((b) => b.text ?? '')
        .join('\n')

      setArticle(parseArticle(fullText))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setArticle(null)
    setTopic('')
    setAngle('')
    setError(null)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d1520',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: '#f0ebe0',
      padding: '0',
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(240,235,224,0.12)',
        padding: '28px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0a1018',
      }}>
        <div>
          <div style={{
            fontFamily: "'Arial Black', 'Franklin Gothic Heavy', sans-serif",
            fontSize: '11px',
            letterSpacing: '4px',
            color: '#f0ebe0',
            opacity: 0.5,
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>THE</div>
          <div style={{
            fontFamily: "'Arial Black', 'Franklin Gothic Heavy', sans-serif",
            fontSize: '26px',
            fontWeight: 900,
            letterSpacing: '6px',
            textTransform: 'uppercase',
            color: '#f0ebe0',
            lineHeight: 1,
          }}>MARKERS</div>
        </div>
        <div style={{
          fontFamily: "'Arial', sans-serif",
          fontSize: '11px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#e8e000',
          opacity: 0.9,
        }}>Editorial AI</div>
      </header>

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 40px' }}>
        {!article ? (
          <>
            {/* Intro */}
            <div style={{ marginBottom: '56px' }}>
              <h1 style={{
                fontFamily: "'Arial Black', 'Franklin Gothic Heavy', sans-serif",
                fontSize: 'clamp(32px, 5vw, 52px)',
                fontWeight: 900,
                letterSpacing: '-1px',
                lineHeight: 1.05,
                color: '#f0ebe0',
                marginBottom: '20px',
                textTransform: 'uppercase',
              }}>
                Research.<br />
                <span style={{ color: '#e8e000' }}>Write.</span><br />
                Publish.
              </h1>
              <p style={{
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'rgba(240,235,224,0.6)',
                fontStyle: 'italic',
                maxWidth: '480px',
              }}>
                Give the agent a topic and it will research the landscape, find the story, and write a draft article in The Markers&apos; voice.
              </p>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: "'Arial', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: '#e8e000',
                  marginBottom: '10px',
                }}>Topic / Story Idea *</label>
                <textarea
                  ref={textareaRef}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Asian Australians leading in the tech startup space"
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'rgba(240,235,224,0.05)',
                    border: '1px solid rgba(240,235,224,0.15)',
                    borderRadius: '4px',
                    padding: '16px 18px',
                    color: '#f0ebe0',
                    fontSize: '16px',
                    fontFamily: "'Georgia', serif",
                    lineHeight: 1.6,
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(232,224,0,0.5)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(240,235,224,0.15)' }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontFamily: "'Arial', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: 'rgba(240,235,224,0.4)',
                  marginBottom: '10px',
                }}>Angle / Focus (optional)</label>
                <textarea
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  placeholder="e.g. Focus on second-gen founders, data on funding gaps, optimistic tone"
                  rows={2}
                  style={{
                    width: '100%',
                    background: 'rgba(240,235,224,0.03)',
                    border: '1px solid rgba(240,235,224,0.1)',
                    borderRadius: '4px',
                    padding: '14px 18px',
                    color: '#f0ebe0',
                    fontSize: '15px',
                    fontFamily: "'Georgia', serif",
                    lineHeight: 1.6,
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(232,224,0,0.4)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(240,235,224,0.1)' }}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                style={{
                  alignSelf: 'flex-start',
                  background: loading || !topic.trim() ? 'rgba(232,224,0,0.3)' : '#e8e000',
                  color: '#0a1018',
                  border: 'none',
                  padding: '16px 40px',
                  fontFamily: "'Arial Black', sans-serif",
                  fontWeight: 900,
                  fontSize: '12px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer',
                  borderRadius: '2px',
                  transition: 'all 0.2s',
                  minWidth: '200px',
                }}
              >
                {loading ? STATUS_MESSAGES[statusIdx] : 'Generate Article →'}
              </button>

              {error && (
                <div style={{
                  background: 'rgba(255,80,80,0.1)',
                  border: '1px solid rgba(255,80,80,0.3)',
                  borderRadius: '4px',
                  padding: '14px 18px',
                  color: '#ff8080',
                  fontSize: '14px',
                  fontFamily: "'Arial', sans-serif",
                }}>
                  {error}
                </div>
              )}
            </div>

            {/* Values strip */}
            <div style={{
              marginTop: '80px',
              paddingTop: '40px',
              borderTop: '1px solid rgba(240,235,224,0.08)',
              display: 'flex',
              gap: '32px',
              flexWrap: 'wrap',
            }}>
              {['Uplift', 'Credibility', 'Discipline', 'Reach', 'Respect'].map((v) => (
                <div key={v} style={{
                  fontFamily: "'Arial', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: 'rgba(240,235,224,0.25)',
                }}>
                  {v}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Article output */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{
                fontFamily: "'Arial', sans-serif",
                fontSize: '10px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#e8e000',
              }}>Draft Ready</div>
              <button
                onClick={handleReset}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(240,235,224,0.2)',
                  color: 'rgba(240,235,224,0.6)',
                  padding: '8px 20px',
                  fontFamily: "'Arial', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                ← New Article
              </button>
            </div>

            {article.headline && (
              <h1 style={{
                fontFamily: "'Arial Black', 'Franklin Gothic Heavy', sans-serif",
                fontSize: 'clamp(28px, 4.5vw, 48px)',
                fontWeight: 900,
                lineHeight: 1.08,
                textTransform: 'uppercase',
                letterSpacing: '-0.5px',
                color: '#f0ebe0',
                marginBottom: '20px',
              }}>
                {article.headline}
              </h1>
            )}

            {article.deck && (
              <p style={{
                fontSize: '20px',
                lineHeight: 1.5,
                color: '#e8e000',
                fontStyle: 'italic',
                marginBottom: '48px',
                paddingBottom: '40px',
                borderBottom: '1px solid rgba(240,235,224,0.12)',
              }}>
                {article.deck}
              </p>
            )}

            <div style={{
              fontSize: '17px',
              lineHeight: 1.85,
              color: 'rgba(240,235,224,0.88)',
              whiteSpace: 'pre-wrap',
            }}>
              {article.body.split('\n').map((para, i) =>
                para.trim() ? <p key={i} style={{ marginBottom: '22px' }}>{para}</p> : null
              )}
            </div>

            {/* Copy button */}
            <div style={{ marginTop: '56px', paddingTop: '40px', borderTop: '1px solid rgba(240,235,224,0.08)' }}>
              <button
                onClick={() => {
                  const text = `${article.headline ?? ''}\n\n${article.deck ?? ''}\n\n${article.body}`
                  navigator.clipboard.writeText(text)
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(232,224,0,0.5)',
                  color: '#e8e000',
                  padding: '12px 28px',
                  fontFamily: "'Arial', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  marginRight: '16px',
                }}
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleReset}
                style={{
                  background: '#e8e000',
                  border: 'none',
                  color: '#0a1018',
                  padding: '12px 28px',
                  fontFamily: "'Arial Black', sans-serif",
                  fontWeight: 900,
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                New Article →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
