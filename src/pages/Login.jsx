import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { C, s } from '../lib/styles'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handleLogin = async () => {
    if (!email || !pass) return setErr('Completa todos los campos.')
    setLoading(true); setErr('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) { setErr('Credenciales incorrectas.'); setLoading(false); return }
    const { data: perfil } = await supabase.from('perfiles').select('*').eq('id', data.user.id).single()
    onLogin(data.user, perfil)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${C.darkRed} 0%, ${C.red} 50%, #e53935 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380, background: C.white, borderRadius: 16, padding: '32px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="30" height="30" viewBox="0 0 30 30"><rect x="12" y="2" width="6" height="26" rx="2" fill="white"/><rect x="2" y="12" width="26" height="6" rx="2" fill="white"/></svg>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: C.darkRed, margin: 0 }}>Cruz Roja Peruana</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Coordinación Nacional de Voluntariado</p>
        </div>

        {err && <div style={{ background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{err}</div>}

        <label style={s.label}>Correo electrónico</label>
        <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" onKeyDown={e => e.key === 'Enter' && handleLogin()} />

        <label style={s.label}>Contraseña</label>
        <input style={s.input} type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />

        <button onClick={handleLogin} disabled={loading} style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 16 }}>
          Si es tu primer ingreso, usa la contraseña temporal que te asignó tu coordinador.
        </p>
      </div>
    </div>
  )
}
