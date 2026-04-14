import React from 'react'
import PostCard from './PostCard'

export default function GalleryGrid({posts,onOpen}){
  return (
    <section>
      {posts.length === 0 ? (
        <div className="py-24 text-center text-soft">
          No poems yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {posts.map(p=> (
            <PostCard key={p.id} post={p} onOpen={()=>onOpen(p)} />
          ))}
        </div>
      )}
    </section>
  )
}
