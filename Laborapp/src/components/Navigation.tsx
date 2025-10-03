'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

interface NavigationProps {
  userName: string
  userRole: string
}

export default function Navigation({ userName, userRole }: NavigationProps) {
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
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-xl font-bold text-gray-900">Agrom</h1>
            </Link>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              {userRole}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/prices">
              <Button variant="ghost" size="sm">
                Precios
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                Mi Perfil
              </Button>
            </Link>
            <span className="text-sm font-medium text-gray-700">
              {userName}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

