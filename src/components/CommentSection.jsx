import React, {useState, useEffect} from 'react'
import { supabase, isSupabaseConfigured, signInWithGoogle } from '../supabase'

export default function CommentSection({postId}){
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [user, setUser] = useState(null)

  useEffect(()=>{
    if(!isSupabaseConfigured || !supabase) return
    let cancelled = false

    async function load(){
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if(cancelled) return
      if(error){
        console.error('Supabase comments fetch failed', error)
        return
      }
      setComments((data || []).map((row)=>({
        id: row.id,
        text: row.text,
        author: row.author_email,
        createdAt: row.created_at
      })))
    }

    async function loadUser(){
      const { data } = await supabase.auth.getUser()
      setUser(data?.user || null)
    }

    load()
    loadUser()

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        load
      )
      .subscribe()

    return ()=>{
      cancelled = true
      supabase.removeChannel(channel)
    }
  },[postId])

  async function submit(){
    if(!isSupabaseConfigured || !supabase) return
    if(!user){
      await signInWithGoogle()
      const { data } = await supabase.auth.getUser()
      if(!data?.user) return
      setUser(data.user)
    }
    if(!text.trim()) return
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      text: text.trim(),
      author_email: user.email
    })
    if(error){
      console.error('Supabase comment insert failed', error)
      return
    }
    setText('')
  }

  async function del(id){
    // admin check: simple email guard
    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(s=>s.trim())
    if(!user || !adminEmails.includes(user.email)) return
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if(error){
      console.error('Supabase comment delete failed', error)
    }
  }

  return (
    <div>
      <div className="space-y-3">
        {comments.map(c=> (
          <div key={c.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-soft">{c.author}</div>
            <div className="mt-1">{c.text}</div>
            {auth.currentUser && (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(s=>s.trim()).includes(auth.currentUser.email) && (
              <button onClick={()=>del(c.id)} className="mt-2 text-xs text-slate-500 underline decoration-slate-300 underline-offset-2">Delete</button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder={isSupabaseConfigured ? 'Leave a quiet thought' : 'Enable Supabase to comment'} disabled={!isSupabaseConfigured} className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[#243447] placeholder:text-slate-400 disabled:opacity-50" />
        <button onClick={submit} disabled={!isSupabaseConfigured} className="rounded-2xl bg-[#6f8aa3] px-4 py-2 text-white shadow-sm disabled:opacity-50">Post</button>
      </div>
      {!isSupabaseConfigured && <p className="mt-2 text-xs text-soft">Comments are hidden until Supabase is connected.</p>}
    </div>
  )
}
