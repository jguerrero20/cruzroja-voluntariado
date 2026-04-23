import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { C, s } from '../lib/styles'

export default function CambiarPassword({ onDone }) {
  const [pass, setPass] = useState('')
  const [conf, setConf] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handleChange = async () => {
    if (pass.length < 6) return setErr('La contrasena debe tener al menos 6 caracteres.')
    if (pass !== conf) return setErr('Las contrasenas no coinciden.')
    setLoading(true); setErr('')

    const { error } = await supabase.auth.updateUser({ password: pass })
    if (error) { setErr('Error: ' + error.message); setLoading(false); return }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('perfiles').update({ primer_ingreso: false }).eq('id', user.id)
    }

    setLoading(false)
    onDone()
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${C.darkRed} 0%, ${C.red} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380, background: C.white, borderRadius: 16, padding: '32px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.darkRed }}>Bienvenido/a</h2>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Es tu primer ingreso. Crea una nueva contrasena personal.</p>
        </div>

        {err && <div style={{ background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{err}</div>}

        <label style={s.label}>Nueva contrasena</label>
        <input style={s.input} type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Minimo 6 caracteres" />

        <label style={s.label}>Confirmar contrasena</label>
        <input style={s.input} type="password" value={conf} onChange={e => setConf(e.target.value)} placeholder="Repite tu contrasena" />

        <button onClick={handleChange} disabled={loading} style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Guardando...' : 'Guardar contrasena'}
        </button>
      </div>
    </div>
  )
}
