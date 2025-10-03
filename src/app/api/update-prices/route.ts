import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Verificar que el usuario esté autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Ejecutar la función de actualización de precios
    const { error } = await supabase.rpc('update_reference_prices')
    
    if (error) {
      console.error('Error updating reference prices:', error)
      return NextResponse.json({ error: 'Error al actualizar precios' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Precios actualizados correctamente' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
