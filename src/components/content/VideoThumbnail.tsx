'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'

interface VideoThumbnailProps {
  videoUrl: string
  fallbackImage?: string | null
  alt: string
  className?: string
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
  } catch {}
  return null
}

export function VideoThumbnail({ videoUrl, fallbackImage, alt, className = '' }: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)

  const youtubeId = getYouTubeId(videoUrl)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onTimeUpdate = () => {
      if (video.currentTime >= 10) {
        video.currentTime = 0
      }
    }
    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [])

  if (youtubeId) {
    const embedSrc = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&end=10`
    return (
      <iframe
        src={embedSrc}
        title={alt}
        allow="autoplay; encrypted-media"
        allowFullScreen={false}
        className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
        style={{ border: 'none' }}
      />
    )
  }

  if (failed && fallbackImage) {
    return <Image src={fallbackImage} alt={alt} fill className={`object-cover ${className}`} />
  }

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      autoPlay
      muted
      playsInline
      loop
      poster={fallbackImage ?? undefined}
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
