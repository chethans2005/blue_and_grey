const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export const isApiConfigured = true // signals the backend API is available
export const isSupabaseConfigured = isApiConfigured // backward compatibility alias

export async function signInWithGoogle(){
  // redirect to backend OAuth
  window.location.href = `${API_BASE}/auth/google`
}

export async function getAuthUser(){
  const token = localStorage.getItem('rameesa_token')
  if(!token) return { data: { user: null } }
  return fetch(`${API_BASE}/auth/user`, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.json())
    .then(user => ({ data: { user } }))
    .catch(()=>({ data: { user: null } }))
}

export async function signOut(){
  localStorage.removeItem('rameesa_token')
}

export async function uploadImage({ file, onProgress }){
  const fd = new FormData()
  fd.append('file', file)
  const resp = await fetch(`${API_BASE}/uploads`, { method: 'POST', body: fd })
  if(!resp.ok) throw new Error('Upload failed')
  const data = await resp.json()
  return data.url
}

export default null
