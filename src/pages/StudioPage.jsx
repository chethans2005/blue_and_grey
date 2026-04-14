import React, {useState} from 'react'
import { auth, signInWithGoogle, storage, db, isFirebaseConfigured } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS||'').split(',').map(s=>s.trim())

export default function StudioPage(){
  const [user, setUser] = useState(auth?.currentUser ?? null)
  const [files, setFiles] = useState([])
  const [caption, setCaption] = useState('')
  const [hiddenMessage, setHiddenMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  async function ensureSign(){
    if(!isFirebaseConfigured || !auth) return false
    if(!auth.currentUser) await signInWithGoogle()
    setUser(auth.currentUser)
    if(!ADMIN_EMAILS.includes(auth.currentUser?.email)){
      alert('Not authorized')
      return false
    }
    return true
  }

  function onSelect(e){
    setFiles(Array.from(e.target.files))
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
      for(const f of files){
        const sref = ref(storage, `posts/${Date.now()}_${f.name}`)
        await uploadBytes(sref, f)
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
      <h2 className="text-xl mb-4">Studio (hidden)</h2>
      {!isFirebaseConfigured && (
        <div className="mb-4 rounded border border-[#4a403a] bg-[#231c19] px-4 py-3 text-sm text-soft">
          Firebase is not configured, so Studio is read-only for now.
        </div>
      )}
      <div className="space-y-4 max-w-xl">
        <input type="file" multiple accept="image/*" onChange={onSelect} />
        <div className="grid grid-cols-3 gap-2">
          {files.map((f,idx)=> (
            <img key={idx} src={URL.createObjectURL(f)} alt="preview" className="w-full h-24 object-cover rounded" />
          ))}
        </div>
        <input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption (optional)" className="w-full px-3 py-2 rounded bg-[#141212]" />
        <input value={hiddenMessage} onChange={e=>setHiddenMessage(e.target.value)} placeholder="Hidden message (long-press reveal)" className="w-full px-3 py-2 rounded bg-[#141212]" />
        <div>
          <button onClick={submit} disabled={uploading || !isFirebaseConfigured} className="px-4 py-2 rounded bg-[#3a332f] disabled:opacity-50">{uploading? 'Uploading...' : 'Submit'}</button>
        </div>
      </div>
    </div>
  )
}
