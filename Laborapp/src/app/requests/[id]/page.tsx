'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Calendar, DollarSign, MessageCircle, Star, User, Square } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Request {
  id: string
  service_type: string
  description: string | null
  hectares: number
  date_target: string
  free_location: string
  budget_per_hectare: number | null
  notes: string | null
  image_urls: string[] | null
  status: string
  created_at: string
  producer: {
    id: string
    name: string
    base_location: string
    phone: string
    reputation_avg: number
  }
}

export default function RequestDetailPage() {
  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchRequest()
    fetchUser()
  }, [])

  const fetchRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          producer:users_public!requests_producer_id_fkey(
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
        console.error('Error fetching request:', error)
        return
      }

      setRequest(data)
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
    if (request?.producer?.phone) {
      const message = `Hola ${request.producer.name}, vi tu solicitud de "${request.service_type}" en Agrom y me interesa. ¿Podrías darme más información?`
      const whatsappUrl = `https://wa.me/${request.producer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
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

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Solicitud no encontrada</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Solicitud de {request.service_type}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Imágenes */}
            {request.image_urls && request.image_urls.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-2 p-4">
                    {request.image_urls.map((image, index) => (
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

            {/* Descripción */}
            {request.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Descripción de la Solicitud</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Información de la solicitud */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Solicitud</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{request.service_type}</Badge>
                  <Badge variant={request.status === 'pending' ? 'default' : 'secondary'}>
                    {request.status === 'pending' ? 'Pendiente' : request.status}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Square className="h-4 w-4" />
                  <span>{request.hectares} hectáreas</span>
                </div>

                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>Ubicación: {request.free_location}</span>
                </div>

                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha objetivo: {new Date(request.date_target).toLocaleDateString('es-ES')}</span>
                </div>

                {request.budget_per_hectare && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>Presupuesto: ${request.budget_per_hectare.toLocaleString()}/ha</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Publicado: {new Date(request.created_at).toLocaleDateString('es-ES')}</span>
                </div>

                {request.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Notas adicionales:</h4>
                    <p className="text-sm text-gray-700">{request.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del productor */}
            <Card>
              <CardHeader>
                <CardTitle>Productor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{request.producer.name}</h3>
                    <p className="text-sm text-gray-600">{request.producer.base_location}</p>
                    {request.producer.reputation_avg > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{request.producer.reputation_avg.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Link href={`/users/${request.producer.id}`}>
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
