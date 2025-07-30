'use client'

import { useEffect, useState } from 'react'

export function CosmicBackground() {
  const [stars, setStars] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    opacity: number
    twinkle: boolean
  }>>([])

  useEffect(() => {
    const newStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() > 0.5,
    }))
    setStars(newStars)

    const interval = setInterval(() => {
      setStars(prev => 
        prev.map(star => ({
          ...star,
          opacity: star.twinkle ? Math.random() * 0.8 + 0.2 : star.opacity,
        }))
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute bg-panther-gold rounded-full"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animation: star.twinkle ? 'twinkle 2s ease-in-out infinite' : 'none',
          }}
        />
      ))}
    </div>
  )
} 