'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Sesión cerrada correctamente')
      router.push('/auth/login')
    } catch (error) {
      toast.error('Error al cerrar sesión')
      console.error('Error:', error)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Cerrar Sesión
    </Button>
  )
}

