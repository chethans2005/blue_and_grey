import React, {useState, useEffect} from 'react'
import { db, auth, signInWithGoogle } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'

export default function CommentSection({postId}){
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [user, setUser] = useState(auth.currentUser)

  useEffect(()=>{
    const q = query(collection(db,'posts',postId,'comments'), orderBy('createdAt','asc'))
    const unsub = onSnapshot(q, snap=> setComments(snap.docs.map(d=>({id:d.id, ...d.data()}))))
    const unsubAuth = onAuthStateChanged(auth, u=>setUser(u))
    return ()=>{unsub(); unsubAuth()}
  },[postId])

  async function submit(){
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
    if(!auth.currentUser || !adminEmails.includes(auth.currentUser.email)) return
    await deleteDoc(doc(db,'posts',postId,'comments',id))
  }

  return (
    <div>
      <div className="space-y-3">
        {comments.map(c=> (
          <div key={c.id} className="bg-[#1f1a19] p-3 rounded">
            <div className="text-xs text-soft">{c.author}</div>
            <div className="mt-1">{c.text}</div>
            {auth.currentUser && (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(s=>s.trim()).includes(auth.currentUser.email) && (
              <button onClick={()=>del(c.id)} className="text-xs mt-2 text-red-400">Delete</button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Leave a quiet thought" className="flex-1 px-3 py-2 rounded bg-[#141212]" />
        <button onClick={submit} className="px-3 py-2 rounded bg-[#3a332f]">Post</button>
      </div>
    </div>
  )
}
