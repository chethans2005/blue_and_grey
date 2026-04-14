import React from 'react'
import { motion } from 'framer-motion'

export default function PostCard({post,onOpen}){
  const img = post.images?.[0]
  return (
    <motion.article whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }} className="rounded-lg overflow-hidden cursor-pointer" onClick={onOpen}>
      <div className="w-full aspect-[4/5] bg-[#1f1b19] flex items-center justify-center">
        {img ? (
          <img src={img} alt={post.caption||'poem image'} className="w-full h-full object-cover" />
        ) : (
          <div className="text-soft p-6">No image</div>
        )}
      </div>
    </motion.article>
  )
}
