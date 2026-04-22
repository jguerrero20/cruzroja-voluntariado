import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { C, s, fmtMins, initials } from '../lib/styles'
import { ClipboardCheck, Clock, User, LogOut, ChevronRight } from 'lucide-react'

export default function PanelVoluntario({ user, perfil, onLogout }) {
  const [tab, setTab] = useState(0)
  const [vol, setVol] = useState(null)
  const [actividades, setActividades] = useState([])
  const [miAsistencia, setMiAsistencia] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: v }, { data: acts }, { data: att }] = await Promise.all([
        supabase.from('voluntarios').select('*').eq('id', user.id).single(),
        supabase.from('actividades').select('*').eq('activa', true).order('fecha', { ascending: false }),
        supabase.from('asistencia').select('*, actividades(nombre,fecha,lugar)').eq('voluntario_id', user.id).order('created_at', { ascending: false })
      ])
      setVol(v); setActividades(acts || []); setMiAsistencia(att || [])
      setLoading(false)
    }
    load()
  }, [user.id])

  const totalMins = miAsistencia.filter(a => a.estado === 'aprobado').reduce((s, a) => s + (a.minutos || 0), 0)
  const nombre = vol ? `${vol.nombres} ${vol.apellidos}` : user.email

  const tabs = [
    { icon: ClipboardCheck, label: 'Actividades' },
    { icon: Clock, label: 'Mis Horas' },
    { icon: User, label: 'Mi Perfil' }
  ]

  if (loading) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: C.muted }}>Cargando...</p></div>

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.avatar(34)}>{initials(nombre)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{nombre}</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>Voluntario/a</div>
        </div>
        <button onClick={onLogout} style={{ background: 'none', border: 'none', color: C.white, cursor: 'pointer', padding: 4 }}>
          <LogOut size={18} />
        </button>
      </div>

      <div style={s.content}>
        {/* Resumen rápido */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: C.red, borderRadius: 10, padding: '12px 14px', color: C.white }}>
            <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 4 }}>Horas aprobadas</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{fmtMins(totalMins)}</div>
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Actividades</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.text }}>{miAsistencia.length}</div>
          </div>
        </div>

        {/* TAB: Actividades */}
        {tab === 0 && (
          <div>
            <h3 style={s.sectionTitle}>Actividades disponibles</h3>
            {actividades.length === 0 && <p style={s.empty}>No hay actividades activas por ahora.</p>}
            {actividades.map(act => {
              const yaInscrito = miAsistencia.find(a => a.actividad_id === act.id)
              return (
                <div key={act.id} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{act.nombre}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{act.fecha}{act.lugar ? ` · ${act.lugar}` : ''}</div>
                      {act.descripcion && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{act.descripcion}</div>}
                    </div>
                    {yaInscrito && (
                      <span style={yaInscrito.estado === 'aprobado' ? s.badgeApproved : yaInscrito.estado === 'rechazado' ? s.badgeRejected : s.badgePending}>
                        {yaInscrito.estado === 'aprobado' ? 'Aprobado' : yaInscrito.estado === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* TAB: Mis Horas */}
        {tab === 1 && (
          <div>
            <h3 style={s.sectionTitle}>Historial de horas</h3>
            {miAsistencia.length === 0 && <p style={s.empty}>Aún no tienes horas registradas.</p>}
            {miAsistencia.map(a => (
              <div key={a.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{a.actividades?.nombre}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{a.actividades?.fecha}{a.actividades?.lugar ? ` · ${a.actividades.lugar}` : ''}</div>
                    <div style={{ fontSize: 13, color: C.red, fontWeight: 600, marginTop: 4 }}>{fmtMins(a.minutos)} horas</div>
                    {a.hora_entrada && <div style={{ fontSize: 11, color: C.muted }}>{a.hora_entrada} → {a.hora_salida || '–'}</div>}
                  </div>
                  <span style={a.estado === 'aprobado' ? s.badgeApproved : a.estado === 'rechazado' ? s.badgeRejected : s.badgePending}>
                    {a.estado === 'aprobado' ? 'Aprobado' : a.estado === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Mi Perfil */}
        {tab === 2 && (
          <div>
            <h3 style={s.sectionTitle}>Mi perfil</h3>
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ ...s.avatar(52), fontSize: 20 }}>{initials(nombre)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{nombre}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{vol?.codigo || 'Sin código'}</div>
                </div>
              </div>
              {[
                ['DNI', vol?.dni],
                ['Teléfono', vol?.telefono],
                ['Correo', user.email],
                ['Dirección', vol?.direccion],
                ['Área', vol?.area_intervencion],
                ['Nivel de formación', vol?.nivel_formacion],
                ['Fecha de ingreso', vol?.fecha_ingreso],
                ['Emergencias', vol?.contacto_emergencia_nombre ? `${vol.contacto_emergencia_nombre} – ${vol.contacto_emergencia_telefono}` : null],
              ].map(([label, val]) => val ? (
                <div key={label} style={{ borderTop: `1px solid ${C.border}`, padding: '10px 0', display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: C.muted, fontSize: 13 }}>{label}</span>
                  <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: 200 }}>{val}</span>
                </div>
              ) : null)}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 20, maxWidth: 480, margin: '0 auto' }}>
        {tabs.map((t, i) => {
          const Icon = t.icon
          const active = tab === i
          return (
            <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: '8px 4px 10px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: active ? C.red : '#aaa', borderTop: active ? `2px solid ${C.red}` : '2px solid transparent' }}>
              <Icon size={20} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{t.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
