'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Service, ServiceType, User } from '@/lib/types/database'
import { MessageSquare, MapPin, DollarSign, Plus, Filter, Star, User as UserIcon } from 'lucide-react'
import RatingDialog from './RatingDialog'

export default function ServicesFeed() {
  const [services, setServices] = useState<Service[]>([])
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
      fetchServices()
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

  const fetchServices = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Si es Contratista o Ambos, mostrar solo sus servicios
      // Si es Productor, mostrar todos los servicios
      let query = supabase
        .from('services')
        .select(`
          *,
          contractor:contractor_id (
            id,
            name,
            base_location,
            reputation_avg,
            phone
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      // Si es Contratista o Ambos, filtrar por sus servicios
      if (user?.role === 'Contratista' || user?.role === 'Ambos') {
        query = query.eq('contractor_id', authUser.id)
      }

      const { data, error } = await query

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = serviceType === 'all' || service.service_type === serviceType
    
    const matchesLocation = !locationFilter || 
                           service.coverage_area?.toLowerCase().includes(locationFilter.toLowerCase()) ||
                           service.contractor?.base_location?.toLowerCase().includes(locationFilter.toLowerCase())

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

  const handleWhatsAppContact = (phone: string, serviceTitle: string) => {
    const message = `Hola! Me interesa tu servicio: ${serviceTitle}. ¿Podrías darme más información?`
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
      {/* Header con botones según rol */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.role === 'Contratista' || user?.role === 'Ambos' 
              ? 'Mis Servicios'
              : 'Servicios Disponibles'
            }
          </h2>
          <p className="text-gray-600">
            {user?.role === 'Contratista' || user?.role === 'Ambos' 
              ? 'Gestiona tus servicios publicados'
              : 'Encuentra contratistas para tus trabajos'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          {(user?.role === 'Contratista' || user?.role === 'Ambos') && (
            <Link href="/services/new">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Nuevo Servicio</span>
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
              placeholder="Buscar servicios..."
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

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">No encontramos servicios que coincidan.</p>
            {(user?.role === 'Productor' || user?.role === 'Ambos') && (
              <>
                <p className="text-gray-400 mb-4">Publicá una solicitud para que contratistas te contacten</p>
                <Link href="/requests/new">
                  <Button>Nueva Solicitud</Button>
                </Link>
              </>
            )}
            {(user?.role === 'Contratista' || user?.role === 'Ambos') && (
              <p className="text-gray-400">No tienes servicios publicados aún.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">
                    {service.title}
                  </CardTitle>
                  <Badge className={getServiceTypeColor(service.service_type)}>
                    {service.service_type}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.coverage_area && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {service.coverage_area}
                  </div>
                )}
                
                {service.reference_price && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${service.reference_price.toLocaleString()}
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <strong>{service.contractor?.name}</strong>
                      {service.contractor?.base_location && (
                        <span> • {service.contractor.base_location}</span>
                      )}
            {service.contractor?.reputation_avg && service.contractor.reputation_avg > 0 && (
              <span> • ⭐ {service.contractor.reputation_avg.toFixed(1)}</span>
            )}
                    </div>
                    <div className="flex space-x-1">
                      <Link href={`/users/${service.contractor?.id}`}>
                        <Button variant="ghost" size="sm">
                          <UserIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      {service.contractor && user && user.id !== service.contractor.id && (
                        <RatingDialog
                          userId={service.contractor.id}
                          userName={service.contractor.name || 'Usuario'}
                          userRole="Contratista"
                          serviceId={service.id}
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
                  <Link href={`/services/${service.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Ver Detalles
                    </Button>
                  </Link>
                  {service.contractor?.phone && (
                    <Button 
                      size="sm"
                      onClick={() => handleWhatsAppContact(service.contractor!.phone!, service.title)}
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
