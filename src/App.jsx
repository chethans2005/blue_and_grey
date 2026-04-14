import React, {useState, useEffect} from 'react'
import Navbar from './components/Navbar'
import GalleryGrid from './components/GalleryGrid'
import PostModal from './components/PostModal'
import { AnimatePresence } from 'framer-motion'
import { db, isFirebaseConfigured } from './firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

const demoPosts = [
  {
    id: 'demo-1',
    images: ['https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80'],
    caption: 'A quiet place for image poems.',
    hiddenMessage: 'The page is alive even before Firebase is connected.'
  },
  {
    id: 'demo-2',
    images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'],
    caption: 'Soft light, stillness, and long pauses.',
    hiddenMessage: 'Long-press or hold to reveal the hidden line.'
  }
]

export default function App(){
  const [posts, setPosts] = useState(demoPosts)
  const [active, setActive] = useState(null)

  useEffect(()=>{
    if(!isFirebaseConfigured || !db) {
      setPosts(demoPosts)
      return
    }

    const q = query(collection(db,'posts'), orderBy('createdAt','desc'))
    const unsub = onSnapshot(q, snap=>{
      setPosts(snap.docs.map(d=>({id:d.id, ...d.data()})))
    })
    return unsub
  },[])

  return (
    <div className="min-h-screen">
      <Navbar/>
      <main className="container-center py-8">
        {!isFirebaseConfigured && (
          <div className="mb-6 rounded border border-[#4a403a] bg-[#231c19] px-4 py-3 text-sm text-soft">
            Firebase is not configured yet, so Rameesa is showing demo poems. Add your `VITE_...` env values to enable uploads, comments, and the studio.
          </div>
        )}
        <GalleryGrid posts={posts} onOpen={p=>setActive(p)} />
      </main>

      <AnimatePresence>
        {active && <PostModal post={active} onClose={()=>setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}
