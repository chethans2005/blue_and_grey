import React from 'react'
import iconImage from '../assets/icon.png'

export default function Navbar({ visible }) {
  if (!visible) return null
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-sky-200/70 bg-white/80 py-4 backdrop-blur-sm">
      <div className="container-center flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={iconImage} alt="Rameesa icon" className="h-8 w-8 shrink-0 block" />
          {/* Removed mt-3 — it was misaligning the title with the icon */}
          <h1 className="text-2xl font-light tracking-wide font-cursive text-[#1f3b66] leading-none">
            Rameesa
          </h1>
        </div>
        <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.28em] text-[#6b86ab] md:flex">
          <a href="#about" className="hover:text-[#243447] transition-colors">About</a>
          <a href="#works" className="hover:text-[#243447] transition-colors">Works</a>
        </nav>
      </div>
    </header>
  )
}