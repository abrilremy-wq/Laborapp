'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Calendar, DollarSign, MessageCircle, Star, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Service {
  id: string
  title: string
  description: string
  service_type: string
  coverage_area: string
  reference_price: number | null
  images: string[]
  video_url: string | null
  status: string
  created_at: string
  contractor: {
    id: string
    name: string
    base_location: string
    phone: string
    reputation_avg: number
  }
}

export default function ServiceDetailPage() {
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchService()
    fetchUser()
  }, [])

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          contractor:users_public!services_contractor_id_fkey(
            id,
            name,
            base_location,
            phone,
            reputation_avg
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error fetching service:', error)
        return
      }

      setService(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users_public')
          .select('*')
          .eq('id', user.id)
          .single()
        setUser(profile)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const handleWhatsAppContact = () => {
    if (service?.contractor?.phone) {
      const message = `Hola ${service.contractor.name}, vi tu servicio "${service.title}" en Agrom y me interesa. ¿Podrías darme más información?`
      const whatsappUrl = `https://wa.me/${service.contractor.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Servicio no encontrado</p>
              <Button onClick={() => router.back()} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
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
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Imágenes */}
            {service.images && service.images.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-2 p-4">
                    {service.images.map((image, index) => (
                      <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`Imagen ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video */}
            {service.video_url && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Video</h3>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={service.video_url}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Descripción */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción del Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{service.description}</p>
              </CardContent>
            </Card>

            {/* Información del servicio */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Servicio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{service.service_type}</Badge>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>Zona de cobertura: {service.coverage_area}</span>
                </div>

                {service.reference_price && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>Precio de referencia: ${service.reference_price.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Publicado: {new Date(service.created_at).toLocaleDateString('es-ES')}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del contratista */}
            <Card>
              <CardHeader>
                <CardTitle>Contratista</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{service.contractor.name}</h3>
                    <p className="text-sm text-gray-600">{service.contractor.base_location}</p>
                    {service.contractor.reputation_avg > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{service.contractor.reputation_avg.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Link href={`/users/${service.contractor.id}`}>
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Ver Perfil
                    </Button>
                  </Link>
                  
                  <Button onClick={handleWhatsAppContact} className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contactar por WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
