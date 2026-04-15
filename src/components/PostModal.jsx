import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import ImageCarousel from './ImageCarousel'
import CommentSection from './CommentSection'
import LikeButton from './LikeButton'

export default function PostModal({ post, onClose, onLike, liked }) {
  const overlayRef = useRef()

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]"
      />

      {/* Modal container — constrained to viewport height */}
      <motion.div
        layout
        className="relative w-full max-w-5xl rounded-3xl border border-sky-200/80 bg-white shadow-[0_24px_70px_rgba(71,114,180,0.24)]"
        style={{ maxHeight: 'min(86vh, 820px)', display: 'flex', flexDirection: 'column' }}
      >
        {/* Close button */}
        <button
          className="absolute right-3 top-3 z-10 rounded-full border border-sky-200 bg-white px-3 py-1 text-sm text-[#1f3b66]"
          onClick={onClose}
        >
          Close
        </button>

        {/* Content grid — fills available height, inner sections scroll independently */}
        <div
          className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]"
          style={{ flex: 1, minHeight: 0, overflow: 'hidden', borderRadius: 'inherit' }}
        >
          {/* Left: Image carousel — scrolls if needed */}
          <div
            className="p-4 md:p-6"
            style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
          >
            <ImageCarousel images={post.images || []} hiddenMessage={post.hiddenMessage} />
          </div>

          {/* Right: Caption + comments */}
          <div
            className="border-t border-sky-100/70 p-4 md:border-t-0 md:border-l md:p-6"
            style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            <div className="mb-4 flex items-start justify-between gap-4 shrink-0">
              {post.caption && (
                <p className="text-sm text-[#1f3b66]">{post.caption}</p>
              )}
              <div onClick={(e) => { e.stopPropagation(); onLike?.(post.id) }}>
                <LikeButton count={post.likesCount || 0} liked={liked} />
              </div>
            </div>
            {/* CommentSection fills remaining vertical space */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <CommentSection postId={post.id} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}