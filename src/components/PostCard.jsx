import React from 'react'
import { motion } from 'framer-motion'

export default function PostCard({post,onOpen}){
  const img = post.images?.[0]
  return (
    <motion.article whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }} className="cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-[0_12px_28px_rgba(89,110,133,0.08)]" onClick={onOpen}>
      <div className="flex aspect-[4/5] w-full items-center justify-center bg-slate-100/90">
        {img ? (
          <img src={img} alt={post.caption||'poem image'} className="w-full h-full object-cover" />
        ) : (
          <div className="text-soft p-6">No image</div>
        )}
      </div>
    </motion.article>
  )
}
