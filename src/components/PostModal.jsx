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
      <div ref={overlayRef} onClick={(e)=>{ if(e.target===overlayRef.current) onClose() }} className="absolute inset-0 bg-black/50" />

      <motion.div layout className="relative max-w-3xl w-full bg-[#221b18] rounded-lg overflow-hidden">
        <div className="p-4">
          <ImageCarousel images={post.images||[]} hiddenMessage={post.hiddenMessage} />
          {post.caption && <p className="mt-4 text-sm text-soft">{post.caption}</p>}
          <div className="mt-6">
            <CommentSection postId={post.id} />
          </div>
        </div>
        <button className="absolute top-3 right-3 text-beige/80" onClick={onClose}>✕</button>
      </motion.div>
    </motion.div>
  )
}
