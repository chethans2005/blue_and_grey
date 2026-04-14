import React, {useState, useEffect} from 'react'
import { auth, signInWithGoogle, storage, db, isFirebaseConfigured } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const ADMIN_EMAILS = ['chetansoyal@gmail.com']

export default function StudioPage(){
  const [user, setUser] = useState(auth?.currentUser ?? null)
  const [files, setFiles] = useState([])
  const [caption, setCaption] = useState('')
  const [hiddenMessage, setHiddenMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [adminReady, setAdminReady] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(()=>{
    if(!auth) return
    const unsub = onAuthStateChanged(auth, (u)=>{
      setUser(u)
      const isAdmin = ADMIN_EMAILS.includes(u?.email || '')
      setAdminReady(isAdmin)
      setAuthChecked(true)
      if(u && !isAdmin){
        setAuthError('This account is not allowed to access Studio.')
        signOut(auth)
      } else {
        setAuthError('')
      }
    })
    return ()=>unsub()
  },[])

  async function ensureSign(){
    if(!isFirebaseConfigured || !auth) return false
    if(!auth.currentUser) await signInWithGoogle()
    setUser(auth.currentUser)
    const isAdmin = ADMIN_EMAILS.includes(auth.currentUser?.email)
    setAdminReady(isAdmin)
    if(!isAdmin){
      setAuthError('This account is not allowed to access Studio.')
      await signOut(auth)
      return false
    }
    return true
  }

  function onSelect(e){
    const picked = Array.from(e.target.files).map((file, idx)=>({
      id: `${Date.now()}-${idx}-${file.name}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }))
    setFiles(picked)
  }

  function removeFile(id){
    setFiles(prev=>prev.filter(item=>item.id !== id))
  }

  function moveFile(id, direction){
    setFiles(prev=>{
      const index = prev.findIndex(item=>item.id === id)
      if(index < 0) return prev
      const nextIndex = direction === 'up' ? index - 1 : index + 1
      if(nextIndex < 0 || nextIndex >= prev.length) return prev
      const copy = [...prev]
      const [item] = copy.splice(index, 1)
      copy.splice(nextIndex, 0, item)
      return copy
    })
  }

  async function submit(){
    if(!isFirebaseConfigured || !storage || !db) {
      alert('Connect Firebase before using Studio')
      return
    }
    if(!(await ensureSign())) return
    setUploading(true)
    try{
      const urls = []
      for(const item of files){
        const sref = ref(storage, `posts/${Date.now()}_${item.file.name}`)
        await uploadBytes(sref, item.file)
        const url = await getDownloadURL(sref)
        urls.push(url)
      }
      await addDoc(collection(db,'posts'), {images: urls, caption, hiddenMessage, createdAt: serverTimestamp()})
      setFiles([])
      setCaption('')
      setHiddenMessage('')
      alert('Uploaded')
    }catch(err){
      console.error(err)
      alert('Upload failed')
    }finally{ setUploading(false) }
  }

  return (
    <div className="min-h-screen p-6 container-center">
      <h2 className="mb-4 text-xl text-[#243447]">Studio (hidden)</h2>
      {!isFirebaseConfigured && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white/75 px-4 py-3 text-sm text-soft backdrop-blur-sm">
          Firebase is not configured, so Studio is read-only for now.
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {user && adminReady ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-[#243447]">
            Signed in as {user.email}
          </div>
        ) : (
          <div className="text-sm text-soft">Sign in to access Studio.</div>
        )}
        <div className="flex items-center gap-2">
          <button onClick={signInWithGoogle} disabled={!isFirebaseConfigured} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-[#243447] disabled:opacity-50">Sign in with Google</button>
          <button onClick={()=>signOut(auth)} disabled={!user} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-soft disabled:opacity-50">Sign out</button>
        </div>
        {authChecked && authError && (
          <div className="text-xs text-soft">{authError}</div>
        )}
      </div>
      {!adminReady && (
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 text-sm text-soft">
          Only chetansoyal@gmail.com can access Studio.
        </div>
      )}
      {adminReady && (
      <div className="space-y-4 max-w-xl">
        <input type="file" multiple accept="image/*" onChange={onSelect} className="block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#243447] file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:text-[#243447]" />
        <div className="grid gap-3">
          {files.map((item, idx)=> (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2">
              <img src={item.previewUrl} alt="preview" className="h-20 w-24 rounded-xl object-cover ring-1 ring-slate-200" />
              <div className="flex-1">
                <div className="text-xs text-soft">Image {idx + 1}</div>
                <div className="text-sm text-[#243447] truncate">{item.file.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>moveFile(item.id, 'up')} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-[#243447]">Up</button>
                <button onClick={()=>moveFile(item.id, 'down')} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-[#243447]">Down</button>
                <button onClick={()=>removeFile(item.id)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-soft">Remove</button>
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-center text-sm text-soft">
              Upload images to preview, reorder, or remove before submitting.
            </div>
          )}
        </div>
        <input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption (optional)" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[#243447] placeholder:text-slate-400" />
        <input value={hiddenMessage} onChange={e=>setHiddenMessage(e.target.value)} placeholder="Hidden message (long-press reveal)" className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[#243447] placeholder:text-slate-400" />
        <div>
          <button onClick={submit} disabled={uploading || !isFirebaseConfigured || !adminReady} className="rounded-2xl bg-[#6f8aa3] px-4 py-2 text-white shadow-sm disabled:opacity-50">{uploading? 'Uploading...' : 'Submit'}</button>
        </div>
      </div>
      )}
    </div>
  )
}
