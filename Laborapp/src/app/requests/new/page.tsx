'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { ServiceType, User } from '@/lib/types/database'
import { toast } from 'sonner'
import { ArrowLeft, Calendar, Square, MapPin } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function NewRequestPage() {
  const [serviceType, setServiceType] = useState<ServiceType>('siembra')
  const [hectares, setHectares] = useState('')
  const [dateTarget, setDateTarget] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('users_public')
          .select('*')
          .eq('id', authUser.id)
          .single()
        setUser(profile)
      } else {
        router.push('/auth/login')
      }
    }
    getUser()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hectares || !dateTarget || !location) {
      toast.error('Los campos obligatorios deben completarse')
      return
    }

    if (parseFloat(hectares) <= 0) {
      toast.error('Las hectáreas deben ser un número positivo')
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
        .from('requests')
        .insert({
          producer_id: user.id,
          service_type: serviceType,
          hectares: parseFloat(hectares),
          date_target: dateTarget,
          free_location: location,
          status: 'pending',
        })

      if (error) {
        toast.error('Error al crear la solicitud: ' + error.message)
      } else {
        toast.success('¡Solicitud creada exitosamente!')
        router.push('/')
      }
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navigation userName={user.name || 'Usuario'} userRole={user.role} />
      
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/">
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Nueva Solicitud</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Solicitud</CardTitle>
            <CardDescription>
              Completa los datos de tu solicitud de trabajo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Servicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de servicio requerido *
                </label>
                <Select value={serviceType} onValueChange={(value: ServiceType) => setServiceType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="siembra">Siembra</SelectItem>
                    <SelectItem value="cosecha">Cosecha</SelectItem>
                    <SelectItem value="fumigacion">Fumigación</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hectáreas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad de hectáreas *
                </label>
                <div className="relative">
                  <Square className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="Ej: 50"
                    value={hectares}
                    onChange={(e) => setHectares(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Fecha tentativa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha tentativa de trabajo *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={dateTarget}
                    onChange={(e) => setDateTarget(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Ciudad, Provincia"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>


              {/* Botones */}
              <div className="flex space-x-4">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Creando solicitud...' : 'Publicar Solicitud'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
