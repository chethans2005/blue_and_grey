import React from 'react'
import { motion } from 'framer-motion'
import LikeButton from './LikeButton'

export default function PostCard({ post, onOpen, onLike, liked }){
  const img = post.images?.[0]
  return (
    <motion.article whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }} className="relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_28px_rgba(89,110,133,0.08)]" onClick={onOpen}>
      <div className="flex aspect-[4/5] w-full items-center justify-center bg-slate-100">
        {img ? (
          <img src={img} alt={post.caption||'poem image'} className="w-full h-full object-cover" />
        ) : (
          <div className="text-soft p-6">No image</div>
        )}
      </div>
      <div className="absolute bottom-3 right-3">
        <div onClick={(e) => { e.stopPropagation(); onLike?.(post.id) }}>
          <LikeButton count={post.likesCount || 0} liked={liked} variant="compact" />
        </div>
      </div>
    </motion.article>
  )
}
