import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { C, s, fmtMins, initials } from '../lib/styles'
import { Users, CalendarDays, ClipboardCheck, BarChart2, LogOut, Plus, ArrowLeft, Trash2, Edit2, Check, X, Download } from 'lucide-react'

const today = () => new Date().toISOString().slice(0, 10)

const genUsuario = (nombres, apellidos) => {
  if (!nombres || !apellidos) return ''
  const norm = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'')
  return norm(nombres.trim().split(' ')[0]).slice(0,1) + norm(apellidos.trim().split(' ')[0])
}

function Field({ label, fkey, type='text', required=false, value, onChange }) {
  return (
    <div>
      <label style={s.label}>{label}{required ? ' *' : ''}</label>
      <input style={s.input} type={type} value={value||''} onChange={e => onChange(fkey, e.target.value)} />
    </div>
  )
}

// ── VOLUNTARIOS ──────────────────────────────────────────────────────────────
function GestionVoluntarios() {
  const [vols, setVols] = useState([])
  const [form, setForm] = useState(null)
  const [f, setF] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('voluntarios').select('*').order('apellidos')
    setVols(data || []); setLoading(false)
  }

  useEffect(() => { load() }, [])

  const emptyF = { codigo:'', nombres:'', apellidos:'', dni:'', fecha_nacimiento:'', telefono:'', email:'', direccion:'', contacto_emergencia_nombre:'', contacto_emergencia_telefono:'', area_intervencion:'', nivel_formacion:'', fecha_ingreso: today(), activo: true }

  const open = (v = null) => { setF(v ? {...v} : emptyF); setForm(v?.id || 'new') }

  const handleField = (key, val) => setF(prev => ({...prev, [key]: val}))

  const usuario = genUsuario(f.nombres, f.apellidos)
  const tempPass = usuario ? `CruzRoja.${usuario}!` : 'CruzRoja2024!'

  const save = async () => {
    if (!f.nombres || !f.apellidos) return alert('Nombres y apellidos son obligatorios.')
    setSaving(true)

    if (form === 'new') {
      const emailFicticio = `${usuario}@voluntarios.cruzrojapisco.pe`
      const { data: signupData, error: signupErr } = await supabase.auth.signUp({
        email: emailFicticio, password: tempPass,
        options: { data: { rol: 'voluntario' } }
      })
      if (signupErr && !signupErr.message.includes('already')) {
        alert('Error: ' + signupErr.message)
        setSaving(false); return
      }
      const userId = signupData?.user?.id
      if (userId) {
        await supabase.from('voluntarios').upsert({ ...f, id: userId, email: f.email || emailFicticio })
        await supabase.from('perfiles').upsert({ id: userId, rol: 'voluntario', primer_ingreso: true })
      }
      alert('Voluntario creado! Usuario: ' + usuario + ' | Contrasena: ' + tempPass)
    } else {
      await supabase.from('voluntarios').update(f).eq('id', form)
    }
    setSaving(false); setForm(null); load()
  }

  const del = async id => {
    if (!window.confirm('¿Eliminar voluntario?')) return
    await supabase.from('voluntarios').delete().eq('id', id)
    load()
  }

  if (form) return (
    <div>
      <button onClick={() => setForm(null)} style={s.back}><ArrowLeft size={16}/> Volver</button>
      <h3 style={s.sectionTitle}>{form==='new' ? 'Nuevo voluntario' : 'Editar voluntario'}</h3>
      <Field label="Código" fkey="codigo" value={f.codigo} onChange={handleField}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <Field label="Nombres" fkey="nombres" required value={f.nombres} onChange={handleField}/>
        <Field label="Apellidos" fkey="apellidos" required value={f.apellidos} onChange={handleField}/>
      </div>
      {form==='new' && usuario && (
        <div style={{background:'#fce8e8',borderRadius:8,padding:'10px 14px',marginBottom:12}}>
          <div style={{fontSize:12,color:C.muted,marginBottom:2}}>Usuario generado automáticamente</div>
          <div style={{fontWeight:700,color:C.red,fontSize:16}}>👤 {usuario}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:2}}>🔑 Contraseña temporal: <strong>{tempPass}</strong></div>
        </div>
      )}
      <Field label="DNI" fkey="dni" value={f.dni} onChange={handleField}/>
      {<Field label="Correo electrónico" fkey="email" type="email" required value={f.email} onChange={handleField}/>}
      <Field label="Fecha de nacimiento" fkey="fecha_nacimiento" type="date" value={f.fecha_nacimiento} onChange={handleField}/>
      <Field label="Teléfono" fkey="telefono" value={f.telefono} onChange={handleField}/>
      <Field label="Dirección" fkey="direccion" value={f.direccion} onChange={handleField}/>
      <label style={s.label}>Área de intervención</label>
      <select style={s.select} value={f.area_intervencion||''} onChange={e => setF(prev=>({...prev,area_intervencion:e.target.value}))}>
        <option value="">Seleccionar...</option>
        {['Gestión de Riesgos y Desastres','Salud y Seguridad Humana','Desarrollo Comunitario','Juventud','Género'].map(a => <option key={a}>{a}</option>)}
      </select>
      <label style={s.label}>Nivel de formación</label>
      <select style={s.select} value={f.nivel_formacion||''} onChange={e => setF(prev=>({...prev,nivel_formacion:e.target.value}))}>
        <option value="">Seleccionar...</option>
        {['Formación Básica Institucional','Voluntario Activo','Instructor','Especializado'].map(n => <option key={n}>{n}</option>)}
      </select>
      <Field label="Fecha de ingreso" fkey="fecha_ingreso" type="date" value={f.fecha_ingreso} onChange={handleField}/>
      <Field label="Contacto de emergencia (nombre)" fkey="contacto_emergencia_nombre" value={f.contacto_emergencia_nombre} onChange={handleField}/>
      <Field label="Contacto de emergencia (teléfono)" fkey="contacto_emergencia_telefono" value={f.contacto_emergencia_telefono} onChange={handleField}/>
      <button onClick={save} disabled={saving} style={{...s.btnPrimary, opacity: saving?0.7:1}}>
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
      <button onClick={() => setForm(null)} style={s.btnSecondary}>Cancelar</button>
    </div>
  )

  if (loading) return <p style={s.empty}>Cargando...</p>

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h3 style={{...s.sectionTitle, margin:0}}>Voluntarios ({vols.length})</h3>
        <button onClick={() => open()} style={s.btnSmall}><Plus size={14}/> Agregar</button>
      </div>
      {vols.length===0 && <p style={s.empty}>No hay voluntarios registrados.</p>}
      {vols.map(v => (
        <div key={v.id} style={s.card}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={s.avatar(38)}>{initials(`${v.nombres} ${v.apellidos}`)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:14,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.nombres} {v.apellidos}</div>
              <div style={{fontSize:12,color:C.muted}}>{v.codigo||'Sin código'} · {v.area_intervencion||'Sin área'}</div>
            </div>
            <div style={{display:'flex',gap:6}}>
              <button onClick={() => open(v)} style={{...s.btnIcon,color:'#555'}}><Edit2 size={14}/></button>
              <button onClick={() => del(v.id)} style={{...s.btnIcon,color:'#c00'}}><Trash2 size={14}/></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── ACTIVIDADES ──────────────────────────────────────────────────────────────
function GestionActividades() {
  const [acts, setActs] = useState([])
  const [form, setForm] = useState(null)
  const [f, setF] = useState({})

  const load = async () => {
    const { data } = await supabase.from('actividades').select('*').order('fecha', { ascending: false })
    setActs(data || [])
  }
  useEffect(() => { load() }, [])

  const empty = { nombre:'', descripcion:'', fecha: today(), lugar:'', activa: true }
  const open = (a=null) => { setF(a ? {...a} : empty); setForm(a?.id||'new') }

  const save = async () => {
    if (!f.nombre) return alert('El nombre es obligatorio.')
    const { data: { user } } = await supabase.auth.getUser()
    if (form==='new') await supabase.from('actividades').insert({ ...f, coordinador_id: user.id })
    else await supabase.from('actividades').update(f).eq('id', form)
    setForm(null); load()
  }

  const del = async id => {
    if (!window.confirm('¿Eliminar actividad?')) return
    await supabase.from('actividades').delete().eq('id', id)
    load()
  }

  if (form) return (
    <div>
      <button onClick={() => setForm(null)} style={s.back}><ArrowLeft size={16}/> Volver</button>
      <h3 style={s.sectionTitle}>{form==='new' ? 'Nueva actividad' : 'Editar actividad'}</h3>
      <label style={s.label}>Nombre *</label>
      <input style={s.input} value={f.nombre||''} onChange={e => setF({...f,nombre:e.target.value})} placeholder="Ej: Campaña de salud"/>
      <label style={s.label}>Descripción</label>
      <textarea style={s.textarea} value={f.descripcion||''} onChange={e => setF({...f,descripcion:e.target.value})}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div>
          <label style={s.label}>Fecha *</label>
          <input type="date" style={s.input} value={f.fecha||''} onChange={e => setF({...f,fecha:e.target.value})}/>
        </div>
        <div>
          <label style={s.label}>Lugar</label>
          <input style={s.input} value={f.lugar||''} onChange={e => setF({...f,lugar:e.target.value})}/>
        </div>
      </div>
      <label style={{...s.label, display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
        <input type="checkbox" checked={f.activa} onChange={e => setF({...f,activa:e.target.checked})}/>
        Actividad activa (visible para voluntarios)
      </label>
      <div style={{marginTop:12}}>
        <button onClick={save} style={s.btnPrimary}>Guardar</button>
        <button onClick={() => setForm(null)} style={s.btnSecondary}>Cancelar</button>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h3 style={{...s.sectionTitle, margin:0}}>Actividades ({acts.length})</h3>
        <button onClick={() => open()} style={s.btnSmall}><Plus size={14}/> Agregar</button>
      </div>
      {acts.length===0 && <p style={s.empty}>No hay actividades registradas.</p>}
      {acts.map(a => (
        <div key={a.id} style={s.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14}}>{a.nombre}</div>
              <div style={{fontSize:12,color:C.muted}}>{a.fecha}{a.lugar?` · ${a.lugar}`:''}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:11,padding:'2px 8px',borderRadius:10,background:a.activa?'#e8f5e9':'#f5f5f5',color:a.activa?'#2e7d32':'#999'}}>{a.activa?'Activa':'Inactiva'}</span>
              <button onClick={() => open(a)} style={{...s.btnIcon,color:'#555'}}><Edit2 size={14}/></button>
              <button onClick={() => del(a.id)} style={{...s.btnIcon,color:'#c00'}}><Trash2 size={14}/></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── ASISTENCIA Y APROBACIÓN ──────────────────────────────────────────────────
function GestionAsistencia() {
  const [acts, setActs] = useState([])
  const [selAct, setSelAct] = useState(null)
  const [vols, setVols] = useState([])
  const [att, setAtt] = useState([])
  const [form, setForm] = useState(null)
  const [f, setF] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: a }, { data: v }] = await Promise.all([
        supabase.from('actividades').select('*').order('fecha', { ascending: false }),
        supabase.from('voluntarios').select('*').order('apellidos')
      ])
      setActs(a || []); setVols(v || []); setLoading(false)
    }
    load()
  }, [])

  const loadAtt = async actId => {
    const { data } = await supabase.from('asistencia')
      .select('*, voluntarios(nombres,apellidos,codigo)')
      .eq('actividad_id', actId)
      .order('created_at')
    setAtt(data || [])
  }

  const selectAct = a => { setSelAct(a); loadAtt(a.id) }

  const openForm = (r=null) => {
    setF(r ? { volId:r.voluntario_id, entrada:r.hora_entrada||'', salida:r.hora_salida||'', obs:r.observacion||'', id:r.id } : { volId:'', entrada:'', salida:'', obs:'' })
    setForm(r?.id||'new')
  }

  const saveAtt = async () => {
    if (!f.volId || !f.entrada) return alert('Voluntario y hora de entrada son obligatorios.')
    const row = { actividad_id: selAct.id, voluntario_id: f.volId, hora_entrada: f.entrada, hora_salida: f.salida||null, observacion: f.obs }
    if (form==='new') await supabase.from('asistencia').upsert(row, { onConflict: 'actividad_id,voluntario_id' })
    else await supabase.from('asistencia').update(row).eq('id', form)
    setForm(null); loadAtt(selAct.id)
  }

  const aprobar = async (id, estado) => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('asistencia').update({ estado, aprobado_por: user.id, aprobado_at: new Date().toISOString() }).eq('id', id)
    loadAtt(selAct.id)
  }

  const del = async id => {
    if (!window.confirm('¿Eliminar registro?')) return
    await supabase.from('asistencia').delete().eq('id', id)
    loadAtt(selAct.id)
  }

  if (loading) return <p style={s.empty}>Cargando...</p>

  if (!selAct) return (
    <div>
      <h3 style={s.sectionTitle}>Selecciona una actividad</h3>
      {acts.length===0 && <p style={s.empty}>No hay actividades registradas.</p>}
      {acts.map(a => {
        return (
          <div key={a.id} onClick={() => selectAct(a)} style={{...s.card, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div style={{fontWeight:600,fontSize:14}}>{a.nombre}</div>
              <div style={{fontSize:12,color:C.muted}}>{a.fecha}{a.lugar?` · ${a.lugar}`:''}</div>
            </div>
            <ArrowLeft size={16} style={{transform:'rotate(180deg)',color:C.muted}}/>
          </div>
        )
      })}
    </div>
  )

  if (form) return (
    <div>
      <button onClick={() => setForm(null)} style={s.back}><ArrowLeft size={16}/> Volver</button>
      <h3 style={s.sectionTitle}>{form==='new' ? 'Registrar asistencia' : 'Editar registro'}</h3>
      <p style={{color:C.muted,fontSize:13,marginBottom:16}}>{selAct.nombre}</p>
      <label style={s.label}>Voluntario *</label>
      <select style={s.select} value={f.volId||''} onChange={e => setF({...f,volId:e.target.value})}>
        <option value="">Seleccionar...</option>
        {vols.map(v => <option key={v.id} value={v.id}>{v.nombres} {v.apellidos}</option>)}
      </select>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div>
          <label style={s.label}>Hora entrada *</label>
          <input type="time" style={s.input} value={f.entrada||''} onChange={e => setF({...f,entrada:e.target.value})}/>
        </div>
        <div>
          <label style={s.label}>Hora salida</label>
          <input type="time" style={s.input} value={f.salida||''} onChange={e => setF({...f,salida:e.target.value})}/>
        </div>
      </div>
      <label style={s.label}>Observación</label>
      <input style={s.input} value={f.obs||''} onChange={e => setF({...f,obs:e.target.value})} placeholder="Opcional"/>
      <button onClick={saveAtt} style={s.btnPrimary}>Guardar</button>
      <button onClick={() => setForm(null)} style={s.btnSecondary}>Cancelar</button>
    </div>
  )

  const totalMins = att.filter(r => r.estado==='aprobado').reduce((sum,r) => sum+(r.minutos||0), 0)

  return (
    <div>
      <button onClick={() => setSelAct(null)} style={s.back}><ArrowLeft size={16}/> Actividades</button>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
        <div>
          <h3 style={{...s.sectionTitle,margin:0}}>{selAct.nombre}</h3>
          <p style={{color:C.muted,fontSize:12,marginTop:2}}>{selAct.fecha}{selAct.lugar?` · ${selAct.lugar}`:''}</p>
        </div>
        <button onClick={() => openForm()} style={s.btnSmall}><Plus size={14}/> Agregar</button>
      </div>
      {att.length===0 && <p style={s.empty}>Sin registros de asistencia aún.</p>}
      {att.map(r => {
        const vol = r.voluntarios
        const nombre = vol ? `${vol.nombres} ${vol.apellidos}` : '–'
        return (
          <div key={r.id} style={s.card}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
              <div style={s.avatar(34)}>{initials(nombre)}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14}}>{nombre}</div>
                <div style={{fontSize:12,color:C.muted}}>{r.hora_entrada||'–'} → {r.hora_salida||'–'} · <span style={{color:C.red,fontWeight:600}}>{fmtMins(r.minutos)}</span></div>
              </div>
              <span style={r.estado==='aprobado'?s.badgeApproved:r.estado==='rechazado'?s.badgeRejected:s.badgePending}>
                {r.estado==='aprobado'?'Aprobado':r.estado==='rechazado'?'Rechazado':'Pendiente'}
              </span>
            </div>
            <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
              {r.estado!=='aprobado' && <button onClick={() => aprobar(r.id,'aprobado')} style={{...s.btnIcon,color:'#2e7d32',background:'#e8f5e9'}}><Check size={14}/></button>}
              {r.estado!=='rechazado' && <button onClick={() => aprobar(r.id,'rechazado')} style={{...s.btnIcon,color:'#c62828',background:'#ffebee'}}><X size={14}/></button>}
              <button onClick={() => openForm(r)} style={{...s.btnIcon,color:'#555'}}><Edit2 size={14}/></button>
              <button onClick={() => del(r.id)} style={{...s.btnIcon,color:'#c00'}}><Trash2 size={14}/></button>
            </div>
          </div>
        )
      })}
      {att.length>0 && (
        <div style={{background:'#fce8e8',borderRadius:8,padding:'10px 14px',display:'flex',justifyContent:'space-between',marginTop:4}}>
          <span style={{fontSize:13,color:C.red}}>{att.length} registro(s)</span>
          <span style={{fontSize:13,color:C.red,fontWeight:700}}>Aprobado: {fmtMins(totalMins)}</span>
        </div>
      )}
    </div>
  )
}

// ── REPORTES ──────────────────────────────────────────────────────────────────
function Reportes() {
  const [mode, setMode] = useState('mensual')
  const [mes, setMes] = useState(new Date().toISOString().slice(0,7))
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [acts, setActs] = useState([])
  const [selAct, setSelAct] = useState('')

  useEffect(() => {
    supabase.from('actividades').select('*').order('fecha',{ascending:false}).then(({data}) => setActs(data||[]))
  }, [])

  const buscar = async () => {
    setLoading(true)
    if (mode==='mensual') {
      const desde = `${mes}-01`, hasta = `${mes}-31`
      const { data: att } = await supabase.from('asistencia')
        .select('*, voluntarios(nombres,apellidos,codigo), actividades(nombre,fecha)')
        .eq('estado','aprobado')
        .gte('actividades.fecha', desde).lte('actividades.fecha', hasta)
      // Agrupar por voluntario
      const grupos = {}
      ;(att||[]).forEach(r => {
        if (!r.voluntarios) return
        const k = r.voluntario_id
        if (!grupos[k]) grupos[k] = { nombre:`${r.voluntarios.nombres} ${r.voluntarios.apellidos}`, codigo:r.voluntarios.codigo, actividades:[], mins:0 }
        grupos[k].actividades.push(r.actividades?.nombre||'–')
        grupos[k].mins += r.minutos||0
      })
      setData(Object.values(grupos).sort((a,b)=>b.mins-a.mins))
    } else {
      const { data: att } = await supabase.from('asistencia')
        .select('*, voluntarios(nombres,apellidos,codigo)')
        .eq('actividad_id', selAct)
        .eq('estado','aprobado')
      setData((att||[]).map(r => ({
        nombre: r.voluntarios ? `${r.voluntarios.nombres} ${r.voluntarios.apellidos}` : '–',
        codigo: r.voluntarios?.codigo,
        entrada: r.hora_entrada, salida: r.hora_salida, mins: r.minutos||0
      })).sort((a,b)=>b.mins-a.mins))
    }
    setLoading(false)
  }

  const exportCSV = () => {
    let csv = '\uFEFF'
    if (mode==='mensual') {
      csv += 'Código,Voluntario,Actividades,Total Horas\n'
      data.forEach(r => { csv += `${r.codigo||''},${r.nombre},${r.actividades.length},${fmtMins(r.mins)}\n` })
    } else {
      csv += 'Código,Voluntario,Entrada,Salida,Horas\n'
      data.forEach(r => { csv += `${r.codigo||''},${r.nombre},${r.entrada||''},${r.salida||''},${fmtMins(r.mins)}\n` })
    }
    const url = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}))
    const a = document.createElement('a'); a.href=url; a.download=`reporte_${mode}_${mes||selAct}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h3 style={s.sectionTitle}>Reportes</h3>
      <div style={{display:'flex',background:'#f0f0f0',borderRadius:8,padding:3,marginBottom:14}}>
        {[['mensual','Por mes'],['actividad','Por actividad']].map(([k,l]) => (
          <button key={k} onClick={()=>{setMode(k);setData([])}} style={{flex:1,padding:'7px',border:'none',borderRadius:6,cursor:'pointer',fontSize:13,fontWeight:500,background:mode===k?C.white:'transparent',color:mode===k?C.red:'#888'}}>
            {l}
          </button>
        ))}
      </div>

      {mode==='mensual' && (
        <div>
          <label style={s.label}>Mes</label>
          <input type="month" style={s.input} value={mes} onChange={e=>setMes(e.target.value)}/>
        </div>
      )}

      {mode==='actividad' && (
        <div>
          <label style={s.label}>Actividad</label>
          <select style={s.select} value={selAct} onChange={e=>setSelAct(e.target.value)}>
            <option value="">Seleccionar...</option>
            {acts.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.fecha})</option>)}
          </select>
        </div>
      )}

      <button onClick={buscar} style={s.btnPrimary} disabled={loading}>
        {loading ? 'Buscando...' : 'Generar reporte'}
      </button>

      {data.length > 0 && (
        <div style={{marginTop:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <span style={{fontSize:13,color:C.muted}}>{data.length} voluntario(s)</span>
            <button onClick={exportCSV} style={{...s.btnSmall,background:'#2e7d32'}}><Download size={14}/> Exportar CSV</button>
          </div>
          {data.map((r,i) => (
            <div key={i} style={s.card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:12,color:C.muted,fontWeight:600,minWidth:20}}>#{i+1}</span>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>{r.nombre}</div>
                    <div style={{fontSize:12,color:C.muted}}>{r.codigo||''}{mode==='mensual'?` · ${r.actividades?.length} actividad(es)`:` · ${r.entrada||'–'} → ${r.salida||'–'}`}</div>
                  </div>
                </div>
                <span style={{color:C.red,fontWeight:700,fontSize:15,flexShrink:0}}>{fmtMins(r.mins)}</span>
              </div>
            </div>
          ))}
          <div style={{background:'#fce8e8',borderRadius:8,padding:'10px 14px',display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:13,color:C.red,fontWeight:500}}>Total general</span>
            <span style={{fontSize:14,color:C.red,fontWeight:700}}>{fmtMins(data.reduce((s,r)=>s+r.mins,0))}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── PANEL COORDINADOR ROOT ───────────────────────────────────────────────────
export default function PanelCoordinador({ user, onLogout }) {
  const [tab, setTab] = useState(0)

  const tabs = [
    { icon: Users, label: 'Voluntarios', view: <GestionVoluntarios/> },
    { icon: CalendarDays, label: 'Actividades', view: <GestionActividades/> },
    { icon: ClipboardCheck, label: 'Asistencia', view: <GestionAsistencia/> },
    { icon: BarChart2, label: 'Reportes', view: <Reportes/> },
  ]

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={{width:32,height:32,borderRadius:'50%',background:C.white,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg width="17" height="17" viewBox="0 0 17 17"><rect x="6.5" y="1" width="4" height="15" rx="1.5" fill={C.red}/><rect x="1" y="6.5" width="15" height="4" rx="1.5" fill={C.red}/></svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14}}>Cruz Roja Peruana</div>
          <div style={{fontSize:11,opacity:0.8}}>Panel Coordinador · {tabs[tab].label}</div>
        </div>
        <button onClick={onLogout} style={{background:'none',border:'none',color:C.white,cursor:'pointer',padding:4}}><LogOut size={18}/></button>
      </div>

      <div style={s.content}>{tabs[tab].view}</div>

      <div style={{position:'fixed',bottom:0,left:0,right:0,background:C.white,borderTop:`1px solid ${C.border}`,display:'flex',zIndex:20,maxWidth:480,margin:'0 auto'}}>
        {tabs.map((t,i) => {
          const Icon = t.icon; const active = tab===i
          return (
            <button key={i} onClick={() => setTab(i)} style={{flex:1,padding:'8px 4px 10px',border:'none',background:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3,color:active?C.red:'#aaa',borderTop:active?`2px solid ${C.red}`:'2px solid transparent'}}>
              <Icon size={20}/><span style={{fontSize:10,fontWeight:active?700:400}}>{t.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
