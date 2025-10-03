'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/types/database'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('Productor')
  const [baseLocation, setBaseLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (!baseLocation.trim()) {
      toast.error('La ubicación es requerida')
      return
    }

    if (!phone.trim()) {
      toast.error('El teléfono es requerido')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Usuario no autenticado')
        return
      }

      const { error } = await supabase
        .from('users_public')
        .insert({
          id: user.id,
          name: name.trim(),
          role,
          base_location: baseLocation.trim() || null,
          phone: phone.trim() || null,
        })

      if (error) {
        toast.error('Error al crear el perfil: ' + error.message)
      } else {
        toast.success('¡Perfil creado exitosamente!')
        router.push('/')
      }
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Configura tu Perfil
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Completa tu información para comenzar a usar Agrom
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Esta información será visible para otros usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <Input
                  placeholder="Tu nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol en la plataforma *
                </label>
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Productor">Productor</SelectItem>
                    <SelectItem value="Contratista">Contratista</SelectItem>
                    <SelectItem value="Ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación base *
                </label>
                <Input
                  placeholder="Ciudad, Provincia"
                  value={baseLocation}
                  onChange={(e) => setBaseLocation(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <Input
                  placeholder="+54 9 11 1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creando perfil...' : 'Completar Registro'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
