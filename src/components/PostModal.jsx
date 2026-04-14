import React, {useState, useRef, useEffect} from 'react'
import { motion } from 'framer-motion'
import ImageCarousel from './ImageCarousel'
import CommentSection from './CommentSection'

export default function PostModal({post,onClose}){
  const overlayRef = useRef()
  useEffect(()=>{
    function onKey(e){ if(e.key === 'Escape') onClose() }
    window.addEventListener('keydown',onKey)
    return ()=>window.removeEventListener('keydown',onKey)
  },[onClose])

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div ref={overlayRef} onClick={(e)=>{ if(e.target===overlayRef.current) onClose() }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]" />

      <motion.div layout className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-sky-200/80 bg-white shadow-[0_24px_70px_rgba(71,114,180,0.24)]">
        <div className="p-4">
          <ImageCarousel images={post.images||[]} hiddenMessage={post.hiddenMessage} />
          {post.caption && <p className="mt-4 text-sm text-[#1f3b66]">{post.caption}</p>}
          <div className="mt-6">
            <CommentSection postId={post.id} />
          </div>
        </div>
        <button className="absolute right-3 top-3 rounded-full border border-sky-200 bg-white px-3 py-1 text-sm text-[#1f3b66]" onClick={onClose}>Close</button>
      </motion.div>
    </motion.div>
  )
}
