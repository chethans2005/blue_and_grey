import React, { useState, useEffect } from 'react'
import { isApiConfigured, signInWithGoogle } from '../api'

const AVATAR_COLORS = [
  { bg: '#b5d4f4', text: '#0c447c' },
  { bg: '#f5c4b3', text: '#712b13' },
  { bg: '#c0dd97', text: '#3b6d11' },
  { bg: '#cecbf6', text: '#3c3489' },
  { bg: '#9fe1cb', text: '#085041' },
  { bg: '#fac775', text: '#633806' },
]

function getAvatarColor(str) {
  let hash = 0
  for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function Avatar({ name, avatar, size = 32 }) {
  const initials = (name || 'U').slice(0, 2).toUpperCase()
  const color = getAvatarColor(name)
  if (avatar) {
    return (
      <img
        src={avatar} alt="avatar"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color.bg, color: color.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 500, flexShrink: 0
    }}>
      {initials}
    </div>
  )
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!isApiConfigured) return
    let cancelled = false

    async function load() {
      const resp = await fetch(`/api/comments/${postId}`)
      if (cancelled) return
      if (!resp.ok) { console.error('Comments fetch failed'); return }
      const data = await resp.json()
      setComments((data || []).map(row => ({
        id: row._id || row.id,
        text: row.text,
        author: row.author_email,
        authorName: row.author_name,
        authorAvatar: row.author_avatar,
        createdAt: row.createdAt,
      })))
    }

    async function loadUser() {
      const token = localStorage.getItem('rameesa_token')
      if (!token) { setUser(null); return }
      try {
        const r = await fetch('/api/auth/user', { headers: { Authorization: `Bearer ${token}` } })
        if (!r.ok) { setUser(null); return }
        const u = await r.json()
        setUser(u)
      } catch (e) { setUser(null) }
    }

    load()
    loadUser()

    // No realtime yet; just poll on mount. Could add websockets later.
    return () => { cancelled = true }
  }, [postId])

  async function submit() {
    if (!isApiConfigured || !user || !text.trim()) return
    const authorName = user.name || user.displayName || user.email
    const authorAvatar = user.avatar || user.photo || ''

    const optimistic = {
      id: `temp-${Date.now()}`,
      text: text.trim(),
      author: user.email,
      authorName,
      authorAvatar,
      createdAt: new Date().toISOString(),
    }

    setComments(prev => [...prev, optimistic])
    setText('')
    try {
      const token = localStorage.getItem('rameesa_token')
      const r = await fetch(`/api/comments/${postId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ text: optimistic.text, author_email: user.email, author_name: authorName, author_avatar: authorAvatar }) })
      if (!r.ok) throw new Error('comment insert failed')
      const data = await r.json()
      setComments(prev => prev.map(c => c.id === optimistic.id ? { id: data._id || data.id, text: data.text, author: data.author_email, authorName: data.author_name, authorAvatar: data.author_avatar, createdAt: data.createdAt } : c))
    } catch (err) {
      console.error('Comment insert failed', err)
      setComments(prev => prev.filter(c => c.id !== optimistic.id))
      setText(optimistic.text)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  async function del(id) {
    // attempt delete via API; backend allows authors or admin
    try {
      const token = localStorage.getItem('rameesa_token')
      const r = await fetch(`/api/comments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!r.ok) {
        const err = await r.json().catch(()=>({}))
        console.error('Delete failed', err)
        alert('Delete failed: ' + (err?.error || r.statusText))
        return
      }
      setComments(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      console.error(e)
      alert('Delete failed')
    }
  }

  const isAdmin = user && (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(s => s.trim()).includes(user.email)

  return (
    // Fill parent height — parent must be a flex column with flex:1 / minHeight:0
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

      {/* Scrollable comment list */}
      <div
        className="comment-scroll-vertical custom-scroll"
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 4 }}
      >
        {comments.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 24 }}>
            No comments yet. Be the first!
          </p>
        )}
        {comments.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Avatar name={c.authorName || c.author} avatar={c.authorAvatar} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-primary, #1e293b)', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 500 }}>{c.authorName || c.author}</span>
                {' '}{c.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  {timeAgo(c.createdAt)}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => del(c.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, color: '#94a3b8', padding: 0, lineHeight: 1
                    }}
                    title="Delete"
                    aria-label="Delete comment"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky input area at bottom */}
      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 12, paddingTop: 12, flexShrink: 0 }}>
        {!user ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Sign in to leave a comment.</span>
            <button
              onClick={signInWithGoogle}
              disabled={!isApiConfigured}
              style={{
                background: 'none', border: '0.5px solid #cbd5e1', borderRadius: 20,
                padding: '7px 16px', fontSize: 13, fontWeight: 500,
                color: 'var(--color-text-primary, #1e293b)', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Sign in
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={user.user_metadata?.full_name || user.email} avatar={user.user_metadata?.avatar_url} size={32} />
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder={isApiConfigured ? 'Add a comment…' : 'Sign in to enable comments'}
              disabled={!isApiConfigured}
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontSize: 13, color: 'var(--color-text-primary, #1e293b)',
                minWidth: 0,
              }}
            />
            {text.trim() && (
              <button
                onClick={submit}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, color: '#378add', padding: 0,
                  flexShrink: 0,
                }}
              >
                Post
              </button>
            )}
          </div>
        )}
        {!isApiConfigured && (
          <p style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
            Comments are disabled until the backend is configured.
          </p>
        )}
      </div>
    </div>
  )
}