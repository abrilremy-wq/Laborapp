'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, User, MapPin, Phone, Edit, Save, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    base_location: '',
    phone: ''
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('users_public')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser(profile)
        setFormData({
          name: profile.name || '',
          role: profile.role || '',
          base_location: profile.base_location || '',
          phone: profile.phone || ''
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('users_public')
        .update({
          name: formData.name,
          base_location: formData.base_location,
          phone: formData.phone
        })
        .eq('id', user.id)

      if (error) {
        toast.error('Error al actualizar perfil: ' + error.message)
        return
      }

      toast.success('Perfil actualizado exitosamente')
      setEditing(false)
      fetchUser() // Recargar datos
    } catch (error) {
      toast.error('Error inesperado')
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      role: user.role || '',
      base_location: user.base_location || '',
      phone: user.phone || ''
    })
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Perfil no encontrado</p>
              <Button onClick={() => router.push('/')} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          </div>
          {!editing && (
            <Button onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Información Personal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar y nombre */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                {editing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nombre completo"
                    className="text-xl font-semibold"
                  />
                ) : (
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                )}
                <Badge variant="outline" className="mt-1">
                  {user.role}
                </Badge>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ubicación</label>
                {editing ? (
                  <Input
                    value={formData.base_location}
                    onChange={(e) => setFormData({...formData, base_location: e.target.value})}
                    placeholder="Ciudad, Provincia"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{user.base_location || 'No especificada'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Teléfono</label>
                {editing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+54 9 11 1234-5678"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone || 'No especificado'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            {editing && (
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-blue-600">
                {user.reputation_avg || 0}
              </div>
              <div className="text-sm text-gray-600">Reputación Promedio</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-green-600">
                {user.reputation_count || 0}
              </div>
              <div className="text-sm text-gray-600">Valoraciones</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-purple-600">
                {user.role === 'Productor' || user.role === 'Ambos' ? 'Solicitudes' : 'Servicios'}
              </div>
              <div className="text-sm text-gray-600">
                {user.role === 'Productor' || user.role === 'Ambos' ? 'Mis Solicitudes' : 'Mis Servicios'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(user.role === 'Contratista' || user.role === 'Ambos') && (
                <Link href="/services/new">
                  <Button className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Nuevo Servicio
                  </Button>
                </Link>
              )}
              
              {(user.role === 'Productor' || user.role === 'Ambos') && (
                <Link href="/requests/new">
                  <Button className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Nueva Solicitud
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
