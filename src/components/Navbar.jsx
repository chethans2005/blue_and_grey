import React from 'react'

export default function Navbar(){
  return (
    <header className="w-full border-b border-slate-200/70 bg-white/70 py-5 backdrop-blur-sm">
      <div className="container-center flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide text-[#243447]">Rameesa</h1>
        <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.28em] text-soft md:flex">
          <a href="#about" className="hover:text-[#243447]">About</a>
          <a href="#works" className="hover:text-[#243447]">Works</a>
        </nav>
      </div>
    </header>
  )
}
