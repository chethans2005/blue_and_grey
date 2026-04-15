import React, {useState, useEffect} from 'react'
import { isApiConfigured, uploadImage, signInWithGoogle, signOut, getAuthUser } from '../api'

const ADMIN_EMAIL = 'chetansoyal@gmail.com'

export default function StudioPage(){
  const [files, setFiles] = useState([])
  const [caption, setCaption] = useState('')
  const [hiddenMessage, setHiddenMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [user, setUser] = useState(null)
  const [adminReady, setAdminReady] = useState(false)
  const [authError, setAuthError] = useState('')
  const [uploadError, setUploadError] = useState('')

  useEffect(()=>{
    let cancelled = false
    async function load(){
      const { data } = await getAuthUser()
      if(cancelled) return
      const current = data?.user || data || null
      setUser(current)
      const isAdmin = current?.email === ADMIN_EMAIL
      setAdminReady(isAdmin)
    }
    load()
    return ()=>{ cancelled = true }
  },[])

  async function ensureSignIn(){
    if(!isApiConfigured) return false
    const { data } = await getAuthUser()
    const userObj = data?.user || data || null
    if(!userObj){
      await signInWithGoogle()
      return false
    }
    const isAdmin = userObj.email === ADMIN_EMAIL
    setAdminReady(isAdmin)
    if(!isAdmin){
      setAuthError('This account is not allowed to access Studio.')
      await signOut()
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
        if(!isApiConfigured) {
          alert('Backend API not configured')
          return
        }
    if(!(await ensureSignIn())) return
    if(files.length === 0) {
      setUploadError('Please select at least one image to upload.')
      return
    }
    setUploading(true)
    setUploadProgress(0)
    setUploadError('')
    try{
      const urls = []
      for(let i = 0; i < files.length; i += 1){
        const item = files[i]
        const url = await uploadImage({
          file: item.file,
          onProgress: (percent)=>{
            const base = i / files.length
            const blended = base + (percent / 100 / files.length)
            setUploadProgress(Math.round(blended * 100))
          }
        })
        urls.push(url)
      }
      // create post via API; server accepts admin via JWT or ADMIN_SECRET header
      const token = localStorage.getItem('rameesa_token')
      const r = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : undefined }, body: JSON.stringify({ images: urls, caption, hidden_message: hiddenMessage, likes_count: 0 }) })
      if(!r.ok) throw new Error('post creation failed')
      setUploadProgress(100)
      setFiles([])
      setCaption('')
      setHiddenMessage('')
      alert('Uploaded')
        }catch(err){
      console.error(err)
          setUploadError(err?.message || 'Upload failed. Check backend and storage configuration.')
    }finally{ setUploading(false) }
  }

  return (
    <div className="min-h-screen p-6 container-center">
      <h2 className="mb-4 text-xl text-[#243447]">Studio (hidden)</h2>
          {!isApiConfigured && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white/75 px-4 py-3 text-sm text-soft backdrop-blur-sm">
             Backend client not configured. Please set up the backend to use the studio.
        </div>
      )}
      {!adminReady && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 text-sm text-soft">
          <div className="mb-3">Sign in with Google to access Studio.</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={ensureSignIn}
              className="rounded-2xl bg-[#6f8aa3] px-4 py-2 text-white"
            >
              Sign in with Google
            </button>
          </div>
          {authError && <div className="mt-2 text-xs text-soft">{authError}</div>}
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
              <button onClick={submit} disabled={uploading || !isApiConfigured || !adminReady} className="rounded-2xl bg-[#6f8aa3] px-4 py-2 text-white shadow-sm disabled:opacity-50">{uploading? 'Uploading...' : 'Submit'}</button>
        </div>
        {uploading && (
          <div className="text-xs text-soft">Uploading... {uploadProgress}%</div>
        )}
        {uploadError && (
          <div className="text-xs text-soft">{uploadError}</div>
        )}
      </div>
      )}
    </div>
  )
}
