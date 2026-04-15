import React from 'react'

function HeartIcon({ filled, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#e24b4a' : 'none'}
      stroke={filled ? '#e24b4a' : 'currentColor'}
      strokeWidth="1.8"
      style={{ flexShrink: 0, color: '#94a3b8' }}
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export default function LikeButton({ count = 0, liked = false, onLike, variant = 'pill' }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#6b86ab',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  }
  const variants = {
    pill: { borderRadius: 999, padding: '6px 10px' },
    compact: { borderRadius: 999, padding: '5px 8px' },
  }

  return (
    <button onClick={onLike} style={{ ...base, ...variants[variant] }} aria-label={liked ? 'Liked post' : 'Like post'}>
      <HeartIcon filled={liked} size={14} />
      <span>{count}</span>
    </button>
  )
}
