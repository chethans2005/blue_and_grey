import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export function getAuthUser(){
  return supabase?.auth?.getUser?.()
}

export async function signInWithGoogle(){
  if(!supabase) throw new Error('Supabase is not configured')
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/studio`
    }
  })
}

export async function signOut(){
  if(!supabase) return
  await supabase.auth.signOut()
}

export async function uploadImage({file, onProgress}){
  if(!supabase) throw new Error('Supabase is not configured')
  const safeName = file?.name || 'upload'
  const path = `posts/${Date.now()}_${safeName}`

  if(onProgress){
    onProgress(0)
  }
  const { error } = await supabase.storage.from('posts').upload(path, file)
  if(error) throw error

  const { data } = supabase.storage.from('posts').getPublicUrl(path)
  if(onProgress){
    onProgress(100)
  }
  return data.publicUrl
}
