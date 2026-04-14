import React, {useState, useEffect} from 'react'
import { db, auth, signInWithGoogle, isFirebaseConfigured } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'

export default function CommentSection({postId}){
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [user, setUser] = useState(auth?.currentUser ?? null)

  useEffect(()=>{
    if(!isFirebaseConfigured || !db || !auth) return
    const q = query(collection(db,'posts',postId,'comments'), orderBy('createdAt','asc'))
    const unsub = onSnapshot(q, snap=> setComments(snap.docs.map(d=>({id:d.id, ...d.data()}))))
    const unsubAuth = onAuthStateChanged(auth, u=>setUser(u))
    return ()=>{unsub(); unsubAuth()}
  },[postId])

  async function submit(){
    if(!isFirebaseConfigured || !db || !auth) return
    if(!user) {
      await signInWithGoogle()
    }
    if(!auth.currentUser) return
    if(!text.trim()) return
    await addDoc(collection(db,'posts',postId,'comments'), {text: text.trim(), author: auth.currentUser.email, createdAt: serverTimestamp()})
    setText('')
  }

  async function del(id){
    // admin check: simple email guard
    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(s=>s.trim())
    if(!isFirebaseConfigured || !auth?.currentUser || !adminEmails.includes(auth.currentUser.email)) return
    await deleteDoc(doc(db,'posts',postId,'comments',id))
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
        <input value={text} onChange={e=>setText(e.target.value)} placeholder={isFirebaseConfigured ? 'Leave a quiet thought' : 'Enable Firebase to comment'} disabled={!isFirebaseConfigured} className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[#243447] placeholder:text-slate-400 disabled:opacity-50" />
        <button onClick={submit} disabled={!isFirebaseConfigured} className="rounded-2xl bg-[#6f8aa3] px-4 py-2 text-white shadow-sm disabled:opacity-50">Post</button>
      </div>
      {!isFirebaseConfigured && <p className="mt-2 text-xs text-soft">Comments are hidden until Firebase is connected.</p>}
    </div>
  )
}
