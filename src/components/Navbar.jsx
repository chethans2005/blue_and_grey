import React from 'react'

export default function Navbar({visible}){
  if(!visible) return null
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-sky-200/70 bg-white/80 py-4 backdrop-blur-sm">
      <div className="container-center flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="../assets/icon.png" alt="Rameesa icon" className="h-8 w-8 " />
          <h1 className="text-2xl font-light tracking-wide font-cursive text-[#1f3b66]">Rameesa</h1>
        </div>
        <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.28em] text-soft md:flex">
          <a href="#about" className="hover:text-[#243447]">About</a>
          <a href="#works" className="hover:text-[#243447]">Works</a>
        </nav>
      </div>
    </header>
  )
}
