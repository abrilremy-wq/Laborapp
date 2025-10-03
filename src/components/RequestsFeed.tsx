'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Request, ServiceType, User } from '@/lib/types/database'
import { MessageSquare, MapPin, Calendar, Square, DollarSign, Plus, Filter, Star, User as UserIcon } from 'lucide-react'
import RatingDialog from './RatingDialog'

export default function RequestsFeed() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType | 'all'>('all')
  const [locationFilter, setLocationFilter] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user])

  const getUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const { data: profile } = await supabase
        .from('users_public')
        .select('*')
        .eq('id', authUser.id)
        .single()
      setUser(profile)
    }
  }

  const fetchRequests = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Si es Productor o Ambos, mostrar solo sus solicitudes
      // Si es Contratista, mostrar todas las solicitudes
      let query = supabase
        .from('requests')
        .select(`
          *,
          producer:producer_id (
            id,
            name,
            base_location,
            reputation_avg,
            phone
          ),
          lot:lot_id (
            id,
            name,
            location
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      // Si es Productor o Ambos, filtrar por sus solicitudes
      if (user?.role === 'Productor' || user?.role === 'Ambos') {
        query = query.eq('producer_id', authUser.id)
      }

      const { data, error } = await query

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.free_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.lot?.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.lot?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = serviceType === 'all' || request.service_type === serviceType
    
    const matchesLocation = !locationFilter || 
                           request.free_location?.toLowerCase().includes(locationFilter.toLowerCase()) ||
                           request.lot?.location.toLowerCase().includes(locationFilter.toLowerCase())

    return matchesSearch && matchesType && matchesLocation
  })

  const getServiceTypeColor = (type: ServiceType) => {
    switch (type) {
      case 'siembra':
        return 'bg-green-100 text-green-800'
      case 'cosecha':
        return 'bg-yellow-100 text-yellow-800'
      case 'fumigacion':
        return 'bg-red-100 text-red-800'
      case 'otros':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleWhatsAppContact = (phone: string, requestTitle: string) => {
    const message = `Hola! Me interesa tu solicitud de trabajo: ${requestTitle}. ¿Podrías darme más información?`
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.role === 'Productor' || user?.role === 'Ambos' 
              ? 'Mis Solicitudes'
              : 'Solicitudes de Trabajo'
            }
          </h2>
          <p className="text-gray-600">
            {user?.role === 'Productor' || user?.role === 'Ambos' 
              ? 'Gestiona tus solicitudes de trabajo'
              : 'Encuentra oportunidades de trabajo'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          {(user?.role === 'Productor' || user?.role === 'Ambos') && (
            <Link href="/requests/new">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Nueva Solicitud</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={serviceType} onValueChange={(value: ServiceType | 'all') => setServiceType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="siembra">Siembra</SelectItem>
                <SelectItem value="cosecha">Cosecha</SelectItem>
                <SelectItem value="fumigacion">Fumigación</SelectItem>
                <SelectItem value="otros">Otros</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Buscar solicitudes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Input
              placeholder="Filtrar por ubicación..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">No encontramos servicios que coincidan.</p>
            {(user?.role === 'Contratista' || user?.role === 'Ambos') && (
              <>
                <p className="text-gray-400 mb-4">Aún no tienes servicios publicados. Crea tu primer servicio para empezar a recibir solicitudes de trabajo.</p>
                <Link href="/services/new">
                  <Button>Nuevo Servicio</Button>
                </Link>
              </>
            )}
            {(user?.role === 'Productor') && (
              <p className="text-gray-400">No hay solicitudes disponibles en este momento.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    Solicitud de {request.service_type}
                  </CardTitle>
                  <Badge className={getServiceTypeColor(request.service_type)}>
                    {request.service_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Square className="h-4 w-4 mr-2" />
                  {request.hectares} hectáreas
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(request.date_target)}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {request.lot ? request.lot.location : request.free_location}
                </div>

                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <strong>{request.producer?.name}</strong>
                      {request.producer?.base_location && (
                        <span> • {request.producer.base_location}</span>
                      )}
                      {request.producer?.reputation_avg && request.producer.reputation_avg > 0 && (
                        <span> • ⭐ {request.producer.reputation_avg.toFixed(1)}</span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Link href={`/users/${request.producer?.id}`}>
                        <Button variant="ghost" size="sm">
                          <UserIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      {request.producer && user && user.id !== request.producer.id && (
                        <RatingDialog
                          userId={request.producer.id}
                          userName={request.producer.name || 'Usuario'}
                          userRole="Productor"
                          requestId={request.id}
                        >
                          <Button variant="ghost" size="sm">
                            <Star className="h-4 w-4" />
                          </Button>
                        </RatingDialog>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/requests/${request.id}`} className="flex-1">
                    <Button className="w-full">
                      Ver Detalles
                    </Button>
                  </Link>
                  {request.producer?.phone && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleWhatsAppContact(request.producer!.phone!, `Solicitud de ${request.service_type}`)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
