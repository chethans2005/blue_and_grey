import React, {useState, useEffect} from 'react'
import Navbar from './components/Navbar'
import GalleryGrid from './components/GalleryGrid'
import PostModal from './components/PostModal'
import { AnimatePresence, motion } from 'framer-motion'
import { db, isFirebaseConfigured } from './firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import heroImage from './assets/hero.png'

const demoPosts = [
  {
    id: 'demo-1',
    images: [
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
    ],
    caption: 'A quiet place for image poems.',
    hiddenMessage: 'The page is alive even before Firebase is connected.'
  },
  {
    id: 'demo-2',
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?auto=format&fit=crop&w=1200&q=80'
    ],
    caption: 'Soft light, stillness, and long pauses.',
    hiddenMessage: 'Long-press or hold to reveal the hidden line.'
  },
  {
    id: 'demo-3',
    images: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80'
    ],
    caption: 'A triptych of pause, drift, and return.',
    hiddenMessage: 'The sky keeps the poem, even when the page is silent.'
  }
]

export default function App(){
  const [posts, setPosts] = useState(demoPosts)
  const [active, setActive] = useState(null)
  const [showNav, setShowNav] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(true)

  useEffect(()=>{
    if(!isFirebaseConfigured || !db) {
      setPosts(demoPosts)
      return
    }

    const q = query(collection(db,'posts'), orderBy('createdAt','desc'))
    const unsub = onSnapshot(q, snap=>{
      setPosts(snap.docs.map(d=>({id:d.id, ...d.data()})))
    }, err=>{
      console.error('Firebase connection failed', err)
    })
    return unsub
  },[])

  useEffect(()=>{
    function onScroll(){
      const scrolled = window.scrollY > 10
      setShowNav(scrolled)
      setShowScrollHint(!scrolled)
    }
    onScroll()
    window.addEventListener('scroll', onScroll)
    return ()=>window.removeEventListener('scroll', onScroll)
  },[])

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col">
      <Navbar visible={showNav} />
      <main className="relative flex-1">
        <section className="relative min-h-screen w-full overflow-hidden">
          <div className="absolute inset-0">
            <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})`, filter: 'brightness(1.29) saturate(1)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/55 to-[#dceeff]" />
          </div>
          <div className="container-center relative z-10 flex min-h-screen items-center py-20">
            <motion.div
              initial={{opacity: 0, y: 18}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.7, ease: 'easeOut'}}
              className="max-w-3xl"
            >
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-soft">Workspace: Blue and Grey</p>
              <h2 className="text-5xl font-light leading-tight text-[#1f3b66] sm:text-6xl lg:text-7xl font-cursive">
                Blue and Grey<br />
              </h2>
              <h3 className="text-xl font-light leading-tight text-[#1f3b66] sm:text-5xl lg:text-4xl font-cursive">
                 &nbsp;                 &nbsp;
                 is a quiet gallery for poems.
              </h3>
              <p className="mt-6 max-w-2xl text-base leading-8 text-soft sm:text-lg">
                A gentle space for visual poems, where each piece opens like an art print, reveals its hidden line on long press, and feels more like moving through a curated exhibition than scrolling a feed.
              </p>
            </motion.div>
          </div>
          {showScrollHint && (
            <motion.div
              initial={{opacity: 0, y: 0}}
              animate={{opacity: 1, y: [0, 6, 0]}}
              transition={{duration: 2.2, ease: 'easeInOut', repeat: Infinity}}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.35em] text-[#1f3b66]"
            >
              <span className="flex flex-col items-center gap-2">
                Scroll down
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-300 bg-white/80">↓</span>
              </span>
            </motion.div>
          )}
        </section>

        <div className="container-center py-6 sm:py-10">

        <section id="about" className="grid gap-6 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <motion.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.4}}
            transition={{duration: 0.6, ease: 'easeOut'}}
            className="sticky top-6 self-start rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_18px_44px_rgba(88,110,133,0.08)] backdrop-blur-sm"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-soft">About the poet</p>
            <h3 className="mt-4 text-3xl font-light text-[#243447] font-serif">A study in stillness.</h3>
            <p className="mt-4 text-sm leading-7 text-soft">
              The poet behind Rameesa works with fragments, silence, and image sequences. Each poem is arranged like a small exhibition piece: minimal framing, slow pacing, and a hidden text layer for those who linger.
            </p>
            <div className="mt-6 grid gap-3 text-xs uppercase tracking-[0.3em] text-soft">
              <span>Image poems</span>
              <span>Hidden lines</span>
              <span>Slow scroll</span>
            </div>
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: 18}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.4}}
            transition={{duration: 0.6, ease: 'easeOut', delay: 0.05}}
            className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/60 p-6 shadow-[0_18px_44px_rgba(88,110,133,0.05)] backdrop-blur-sm sm:p-8"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-soft">The poet</p>
              <p className="mt-3 leading-7 text-[#243447]">
                Rameesa writes with restraint: sequence-driven poems that move from image to image, guided by cadence and breath. The work is shaped by quiet observation, soft light, and the poetry of everyday objects.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-soft">The practice</p>
              <p className="mt-3 leading-7 text-[#243447]">
                Each series begins as a visual meditation, later paired with a single line of text that appears only when you linger. The poet invites a slower rhythm: pause, look again, and keep the silence intact.
              </p>
            </div>
          </motion.div>
        </section>

        <section id="works" className="py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-soft">Selected works</p>
              <h3 className="mt-3 text-3xl font-light text-[#243447] font-serif">Poems as framed objects.</h3>
            </div>
          </div>
          <GalleryGrid posts={posts} onOpen={p=>setActive(p)} />
        </section>
        </div>
      </main>

      <footer className="mt-auto border-t border-sky-200/70 py-6 text-xs uppercase tracking-[0.28em] text-soft">
        <div className="container-center flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Rameesa</span>
          <a href="https://instagram.com/__blue.and.grey__" target="_blank" rel="noreferrer" className="text-[#1f3b66]">@__blue.and.grey__</a>
        </div>
      </footer>

      <AnimatePresence>
        {active && <PostModal post={active} onClose={()=>setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}
