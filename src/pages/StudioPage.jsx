import React, {useState, useEffect} from 'react'
import { supabase, isSupabaseConfigured, uploadImage, signInWithGoogle, signOut } from '../supabase'

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
    if(!supabase) return
    supabase.auth.getUser().then(({ data })=>{
      const current = data?.user || null
      setUser(current)
      const isAdmin = current?.email === ADMIN_EMAIL
      setAdminReady(isAdmin)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session)=>{
      const current = session?.user || null
      setUser(current)
      const isAdmin = current?.email === ADMIN_EMAIL
      setAdminReady(isAdmin)
      if(current && !isAdmin){
        setAuthError('This account is not allowed to access Studio.')
        signOut()
      } else {
        setAuthError('')
      }
    })

    return ()=>{
      authListener?.subscription?.unsubscribe()
    }
  },[])

  async function ensureSignIn(){
    if(!isSupabaseConfigured || !supabase) return false
    const { data } = await supabase.auth.getUser()
    if(!data?.user){
      await signInWithGoogle()
      return false
    }
    const isAdmin = data.user.email === ADMIN_EMAIL
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
    if(!isSupabaseConfigured || !supabase) {
      alert('Connect Supabase before using Studio')
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
      const { error } = await supabase.from('posts').insert({
        images: urls,
        caption,
        hidden_message: hiddenMessage
      })
      if(error) throw error
      setUploadProgress(100)
      setFiles([])
      setCaption('')
      setHiddenMessage('')
      alert('Uploaded')
    }catch(err){
      console.error(err)
      setUploadError(err?.message || 'Upload failed. Check Supabase Storage rules and bucket configuration.')
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
          <button onClick={submit} disabled={uploading || !isFirebaseConfigured || !adminReady} className="rounded-2xl bg-[#6f8aa3] px-4 py-2 text-white shadow-sm disabled:opacity-50">{uploading? 'Uploading...' : 'Submit'}</button>
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
