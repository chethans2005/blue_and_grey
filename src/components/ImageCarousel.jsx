import React, { useState, useRef } from 'react'

export default function ImageCarousel({ images = [], hiddenMessage }) {
  const [i, setI] = useState(0)
  const startX = useRef(null)
  const longPressTimer = useRef(null)
  const [reveal, setReveal] = useState(false)

  const atFirst = i === 0
  const atLast = i === images.length - 1

  function next() { if (!atLast) setI(p => p + 1) }
  function prev() { if (!atFirst) setI(p => p - 1) }

  function onTouchStart(e) { startX.current = e.touches[0].clientX }
  function onTouchMove(e) {
    if (startX.current === null) return
    const dx = e.touches[0].clientX - startX.current
    if (dx > 50) prev()
    if (dx < -50) next()
    startX.current = null
  }

  function startPress() {
    longPressTimer.current = setTimeout(() => setReveal(true), 700)
  }
  function endPress() {
    clearTimeout(longPressTimer.current)
    if (reveal) setTimeout(() => setReveal(false), 1200)
  }

  return (
    <div className="relative flex flex-col" style={{ flex: 1, minHeight: 0 }}>
      {/* Image area — height adapts to container, capped sensibly */}
      <div
        className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-100 to-white"
        style={{ height: 'min(45vh, 420px)' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStartCapture={startPress}
        onTouchEnd={endPress}
      >
        {images[i]
          ? <img src={images[i]} alt="slide" className="w-full h-full object-contain" />
          : <div className="text-slate-400 p-12">No image</div>
        }

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className="rounded-full transition-all"
                style={{
                  width: idx === i ? 16 : 6,
                  height: 6,
                  background: idx === i ? '#1f3b66' : 'rgba(31,59,102,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Hidden message reveal */}
        {hiddenMessage && reveal && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 p-6 text-lg text-[#243447] backdrop-blur-sm">
            {hiddenMessage}
          </div>
        )}
      </div>

      {/* Controls row */}
      <div className="mt-3 flex items-center justify-between text-sm shrink-0">
        <div className="text-slate-400 text-xs">
          {images.length > 1 ? `${i + 1} / ${images.length}` : ''}
          {hiddenMessage && (
            <span className="ml-2 text-slate-300">· hold to reveal</span>
          )}
        </div>
        {images.length > 1 && (
          <div className="space-x-2">
            <button
              onClick={prev}
              disabled={atFirst}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[#243447] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >◀</button>
            <button
              onClick={next}
              disabled={atLast}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[#243447] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >▶</button>
          </div>
        )}
      </div>
    </div>
  )
}