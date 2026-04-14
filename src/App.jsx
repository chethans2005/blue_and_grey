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
  const [firebaseReady, setFirebaseReady] = useState(false)
  const [firebaseError, setFirebaseError] = useState('')

  useEffect(()=>{
    if(!isFirebaseConfigured || !db) {
      setPosts(demoPosts)
      setFirebaseReady(false)
      setFirebaseError('')
      return
    }

    const q = query(collection(db,'posts'), orderBy('createdAt','desc'))
    const unsub = onSnapshot(
      q,
      snap=>{
        setPosts(snap.docs.map(d=>({id:d.id, ...d.data()})))
        setFirebaseReady(true)
        setFirebaseError('')
      },
      err=>{
        setFirebaseError(err?.message || 'Firebase connection failed')
        setFirebaseReady(false)
      }
    )
    return unsub
  },[])

  return (
    <div className="min-h-screen">
      <Navbar/>
      <main className="container-center relative py-6 sm:py-10">
        <div className="pointer-events-none absolute -top-6 right-4 hidden h-48 w-48 rounded-full bg-slate-200/60 blur-3xl lg:block" />
        <div className="pointer-events-none absolute left-0 top-28 hidden h-56 w-56 rounded-full bg-slate-300/40 blur-3xl lg:block" />

        <section className="grid gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-16">
          <motion.div
            initial={{opacity: 0, y: 18}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.7, ease: 'easeOut'}}
            className="max-w-3xl"
          >
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-soft">Poetry gallery</p>
            <h2 className="text-5xl font-light leading-tight text-[#243447] sm:text-6xl lg:text-7xl">
              <i>Blue and Grey</i> is a quiet gallery for poems
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-soft sm:text-lg">
              A gentle space for visual poems, where each piece opens like an art print, reveals its hidden line on long press, and feels more like moving through a curated exhibition than scrolling a feed.
            </p>
          </motion.div>

          <motion.aside
            initial={{opacity: 0, y: 22}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.7, ease: 'easeOut', delay: 0.1}}
            className="relative grid gap-5 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_18px_44px_rgba(88,110,133,0.08)] backdrop-blur-sm"
          >
            <div className="absolute inset-0">
              <div className="h-full w-full bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${heroImage})` }} />
              <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/80 to-white/95" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-soft">Current note</p>
              <p className="mt-4 text-lg leading-8 text-[#243447]">
                Scroll down to enter the poet's notes, then the body of work.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-24 rounded-2xl bg-slate-100" />
              <div className="h-24 rounded-2xl bg-slate-200" />
              <div className="h-24 rounded-2xl bg-slate-100" />
            </div>
          </motion.aside>
        </section>

        {!isFirebaseConfigured && (
          <div className="mb-10 rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-3 text-sm text-soft backdrop-blur-sm">
            Firebase is not configured yet, so Rameesa is showing demo poems. Add your Vite env values to enable uploads, comments, and the studio.
          </div>
        )}
        {import.meta.env.DEV && isFirebaseConfigured && (firebaseError || firebaseReady) && (
          <div className="mb-10 rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-3 text-sm text-soft backdrop-blur-sm">
            Firebase status: {firebaseError ? `Error - ${firebaseError}` : 'Connected'}
          </div>
        )}

        <section id="about" className="grid gap-6 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <motion.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.4}}
            transition={{duration: 0.6, ease: 'easeOut'}}
            className="sticky top-6 self-start rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_18px_44px_rgba(88,110,133,0.08)] backdrop-blur-sm"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-soft">About the poet</p>
            <h3 className="mt-4 text-3xl font-light text-[#243447]">A study in stillness.</h3>
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
              <h3 className="mt-3 text-3xl font-light text-[#243447]">Poems as framed objects.</h3>
            </div>
            <p className="hidden max-w-md text-sm leading-7 text-soft md:block">
              Tap a card to open the poem. On mobile, long press to reveal the hidden line.
            </p>
          </div>
          <GalleryGrid posts={posts} onOpen={p=>setActive(p)} />
        </section>
      </main>

      <AnimatePresence>
        {active && <PostModal post={active} onClose={()=>setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}
