export const C = {
  red: '#C8102E', darkRed: '#8B0000', gold: '#C9962A',
  white: '#FFFFFF', light: '#f9f9f9', gray: '#f0f0f0',
  border: '#e5e5e5', text: '#1a1a1a', muted: '#888'
}

export const s = {
  // Layout
  page: { maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.light, paddingBottom: 80 },
  // Header
  header: { background: C.red, color: C.white, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
  // Content
  content: { padding: '14px' },
  // Cards
  card: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8 },
  // Form
  label: { display: 'block', fontSize: 12, color: C.muted, marginBottom: 4, fontWeight: 500 },
  input: { display: 'block', width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box', outline: 'none', background: C.white, color: C.text },
  select: { display: 'block', width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box', outline: 'none', background: C.white, color: C.text },
  textarea: { display: 'block', width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box', outline: 'none', background: C.white, color: C.text, minHeight: 80, resize: 'vertical' },
  // Buttons
  btnPrimary: { display: 'block', width: '100%', padding: '12px', background: C.red, color: C.white, border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
  btnSecondary: { display: 'block', width: '100%', padding: '12px', background: C.white, color: C.red, border: `1.5px solid ${C.red}`, borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  btnSmall: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 12px', background: C.red, color: C.white, border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  btnIcon: { display: 'inline-flex', alignItems: 'center', padding: 6, background: C.gray, border: 'none', borderRadius: 6, cursor: 'pointer' },
  // Badge
  badgePending: { fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#fff8e1', color: '#b8860b', fontWeight: 600 },
  badgeApproved: { fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#e8f5e9', color: '#2e7d32', fontWeight: 600 },
  badgeRejected: { fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#ffebee', color: '#c62828', fontWeight: 600 },
  // Misc
  back: { display: 'flex', alignItems: 'center', gap: 6, color: C.red, border: 'none', background: 'none', padding: '4px 0', cursor: 'pointer', fontSize: 14, marginBottom: 16 },
  row: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: (size=36) => ({ width: size, height: size, borderRadius: '50%', background: '#fce8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size*0.35, fontWeight: 700, color: C.red, flexShrink: 0 }),
  sectionTitle: { fontSize: 16, fontWeight: 600, margin: '0 0 14px', color: C.text },
  empty: { color: C.muted, fontSize: 14, textAlign: 'center', marginTop: 48, padding: '0 20px' }
}

export const fmtMins = m => {
  if (!m) return '0:00'
  const h = Math.floor(m / 60), min = m % 60
  return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`
}

export const initials = str => {
  if (!str) return '?'
  const parts = str.trim().split(' ')
  return parts.length >= 2 ? parts[0][0]+parts[1][0] : parts[0].slice(0,2)
}
