import React, {useState, useRef} from 'react'

export default function ImageCarousel({images=[], hiddenMessage}){
  const [i, setI] = useState(0)
  const startX = useRef(null)
  const longPressTimer = useRef(null)
  const [reveal, setReveal] = useState(false)

  function next(){ setI(p=>Math.min(p+1, images.length-1)) }
  function prev(){ setI(p=>Math.max(p-1,0)) }

  function onTouchStart(e){ startX.current = e.touches[0].clientX }
  function onTouchMove(e){ if(!startX.current) return; const dx = e.touches[0].clientX - startX.current; if(dx>50) prev(); if(dx<-50) next(); startX.current=null }

  function startPress(){ longPressTimer.current = setTimeout(()=>setReveal(true),700) }
  function endPress(){ clearTimeout(longPressTimer.current); if(reveal) setTimeout(()=>setReveal(false),1200) }

  return (
    <div className="relative">
      <div className="flex h-[60vh] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-100 to-white sm:h-[70vh]" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress} onTouchStartCapture={startPress} onTouchEnd={endPress}>
        {images[i] ? <img src={images[i]} alt="slide" className="w-full h-full object-contain"/> : <div className="text-soft p-12">No image</div>}
        {hiddenMessage && reveal && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 p-6 text-lg text-[#243447] backdrop-blur-sm">{hiddenMessage}</div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="text-soft">{i+1} / {images.length}</div>
        <div className="space-x-2">
          <button onClick={prev} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[#243447]">◀</button>
          <button onClick={next} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[#243447]">▶</button>
        </div>
      </div>
    </div>
  )
}
