'use client'

import { useEffect, useState } from 'react'

export function MatrixRain() {
  const [characters, setCharacters] = useState<Array<{
    id: number
    x: number
    y: number
    char: string
    speed: number
  }>>([])

  useEffect(() => {
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
    const newCharacters = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      char: chars[Math.floor(Math.random() * chars.length)],
      speed: Math.random() * 2 + 1,
    }))
    setCharacters(newCharacters)

    const interval = setInterval(() => {
      setCharacters(prev => 
        prev.map(char => ({
          ...char,
          y: char.y + char.speed,
          char: Math.random() > 0.95 ? chars[Math.floor(Math.random() * chars.length)] : char.char,
        })).map(char => 
          char.y > window.innerHeight ? { ...char, y: -20 } : char
        )
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="matrix-rain">
      {characters.map(char => (
        <div
          key={char.id}
          className="matrix-character absolute"
          style={{
            left: char.x,
            top: char.y,
            animationDelay: `${char.id * 0.1}s`,
          }}
        >
          {char.char}
        </div>
      ))}
    </div>
  )
} 