import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import CambiarPassword from './pages/CambiarPassword'
import PanelCoordinador from './pages/PanelCoordinador'
import PanelVoluntario from './pages/PanelVoluntario'

export default function App() {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: p } = await supabase.from('perfiles').select('*').eq('id', session.user.id).single()
        setUser(session.user); setPerfil(p)
      }
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: p } = await supabase.from('perfiles').select('*').eq('id', session.user.id).single()
        setUser(session.user); setPerfil(p)
      } else {
        setUser(null); setPerfil(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = (u, p) => { setUser(u); setPerfil(p) }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null); setPerfil(null)
  }

  const handlePasswordChanged = async () => {
    const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
    setPerfil(p)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f5' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background:'#C8102E', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
          <svg width="26" height="26" viewBox="0 0 26 26"><rect x="10" y="1" width="6" height="24" rx="2" fill="white"/><rect x="1" y="10" width="24" height="6" rx="2" fill="white"/></svg>
        </div>
        <p style={{ color:'#888', fontSize:14 }}>Cargando...</p>
      </div>
    </div>
  )

  if (!user) return <Login onLogin={handleLogin}/>

  if (perfil?.primer_ingreso) return <CambiarPassword onDone={handlePasswordChanged}/>

  if (perfil?.rol === 'coordinador') return <PanelCoordinador user={user} perfil={perfil} onLogout={handleLogout}/>

  return <PanelVoluntario user={user} perfil={perfil} onLogout={handleLogout}/>
}
