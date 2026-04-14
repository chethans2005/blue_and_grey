import React, {useState} from 'react'
import { storage, db, isFirebaseConfigured } from '../firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const STUDIO_PASSCODE = import.meta.env.VITE_STUDIO_PASSCODE || ''

export default function StudioPage(){
  const [files, setFiles] = useState([])
  const [caption, setCaption] = useState('')
  const [hiddenMessage, setHiddenMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [passcode, setPasscode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [authError, setAuthError] = useState('')
  const [uploadError, setUploadError] = useState('')

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
    if(!unlocked) return
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
        const sref = ref(storage, `posts/${Date.now()}_${item.file.name}`)
        const task = uploadBytesResumable(sref, item.file)
        const url = await new Promise((resolve, reject)=>{
          task.on('state_changed',
            (snap)=>{
              const base = i / files.length
              const fraction = snap.totalBytes ? snap.bytesTransferred / snap.totalBytes : 0
              setUploadProgress(Math.round((base + (fraction / files.length)) * 100))
            },
            (err)=>reject(err),
            async ()=>resolve(await getDownloadURL(task.snapshot.ref))
          )
        })
        urls.push(url)
      }
      await addDoc(collection(db,'posts'), {images: urls, caption, hiddenMessage, createdAt: serverTimestamp()})
      setUploadProgress(100)
      setFiles([])
      setCaption('')
      setHiddenMessage('')
      alert('Uploaded')
    }catch(err){
      console.error(err)
      setUploadError(err?.message || 'Upload failed. Check Firebase Storage rules and bucket configuration.')
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
      {!unlocked && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 text-sm text-soft">
          <div className="mb-3">Enter the Studio passcode to continue.</div>
          <div className="flex flex-wrap gap-2">
            <input
              type="password"
              value={passcode}
              onChange={(e)=>setPasscode(e.target.value)}
              placeholder="Studio passcode"
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#243447] placeholder:text-slate-400"
            />
            <button
              onClick={()=>{
                if(passcode && passcode === STUDIO_PASSCODE){
                  setUnlocked(true)
                  setAuthError('')
                } else {
                  setAuthError('Incorrect passcode.')
                }
              }}
              className="rounded-2xl bg-[#6f8aa3] px-4 py-2 text-white"
            >
              Unlock
            </button>
          </div>
          {authError && <div className="mt-2 text-xs text-soft">{authError}</div>}
        </div>
      )}
      {unlocked && (
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
          <button onClick={submit} disabled={uploading || !isFirebaseConfigured || !unlocked} className="rounded-2xl bg-[#6f8aa3] px-4 py-2 text-white shadow-sm disabled:opacity-50">{uploading? 'Uploading...' : 'Submit'}</button>
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
