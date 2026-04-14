import React, {useState, useEffect} from 'react'
import Navbar from './components/Navbar'
import GalleryGrid from './components/GalleryGrid'
import PostModal from './components/PostModal'
import { AnimatePresence } from 'framer-motion'
import { db } from './firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

export default function App(){
  const [posts, setPosts] = useState([])
  const [active, setActive] = useState(null)

  useEffect(()=>{
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
        <GalleryGrid posts={posts} onOpen={p=>setActive(p)} />
      </main>

      <AnimatePresence>
        {active && <PostModal post={active} onClose={()=>setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}
