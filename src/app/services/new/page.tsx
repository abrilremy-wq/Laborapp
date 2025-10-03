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
import { ArrowLeft, MapPin, DollarSign, FileText, Upload, Image } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function NewServicePage() {
  const [serviceType, setServiceType] = useState<ServiceType>('siembra')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverage, setCoverage] = useState('')
  const [referencePrice, setReferencePrice] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [videoUrl, setVideoUrl] = useState('')
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
        
        // Verificar que el usuario sea Contratista o Ambos
        if (profile?.role !== 'Contratista' && profile?.role !== 'Ambos') {
          toast.error('Solo los Contratistas pueden crear servicios')
          router.push('/')
        }
      } else {
        router.push('/auth/login')
      }
    }
    getUser()
  }, [router, supabase])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !description || !coverage) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    // Temporalmente hacer imágenes opcionales hasta configurar storage
    // if (images.length === 0) {
    //   toast.error('Debes subir al menos una imagen')
    //   return
    // }

    setLoading(true)

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        toast.error('No estás autenticado')
        return
      }

      // Subir imágenes a Supabase Storage (si hay imágenes)
      const imageUrls: string[] = []
      if (images.length > 0) {
        try {
          for (const image of images) {
            const fileName = `${Date.now()}-${image.name}`
            const { data, error } = await supabase.storage
              .from('service-images')
              .upload(fileName, image)
            
            if (error) {
              console.warn('Error al subir imagen (continuando sin imagen):', error.message)
              // Continuar sin la imagen en lugar de fallar
              continue
            }
            
            const { data: { publicUrl } } = supabase.storage
              .from('service-images')
              .getPublicUrl(fileName)
            
            imageUrls.push(publicUrl)
          }
        } catch (error) {
          console.warn('Error con storage, continuando sin imágenes:', error)
          // Continuar sin imágenes
        }
      }

      // Crear el servicio
      const { error } = await supabase
        .from('services')
        .insert({
          contractor_id: authUser.id,
          service_type: serviceType,
          title,
          description,
          coverage_area: coverage,
          reference_price: referencePrice ? parseFloat(referencePrice) : null,
          images: imageUrls,
          video_url: videoUrl || null,
          status: 'active'
        })

      if (error) {
        toast.error('Error al crear el servicio: ' + error.message)
      } else {
        toast.success('¡Servicio creado exitosamente!')
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
            <h1 className="text-xl font-bold text-gray-900">Nuevo Servicio</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Servicio</CardTitle>
            <CardDescription>
              Publica tu servicio para que los productores puedan encontrarte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Servicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Servicio *
                </label>
                <Select value={serviceType} onValueChange={(value: ServiceType) => setServiceType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="siembra">Siembra</SelectItem>
                    <SelectItem value="cosecha">Cosecha</SelectItem>
                    <SelectItem value="pulverizacion">Pulverización</SelectItem>
                    <SelectItem value="fertilizacion">Fertilización</SelectItem>
                    <SelectItem value="arado">Arado</SelectItem>
                    <SelectItem value="rastra">Rastra</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Servicio *
                </label>
                <Input
                  placeholder="Ej: Servicio de siembra directa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <Textarea
                  placeholder="Describe tu servicio en detalle..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>


              {/* Área de Cobertura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área de Cobertura *
                </label>
                <Input
                  placeholder="Ej: Buenos Aires, La Pampa, Córdoba"
                  value={coverage}
                  onChange={(e) => setCoverage(e.target.value)}
                  required
                />
              </div>

              {/* Precio de Referencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Referencia por Hectárea (opcional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="Ej: 15000"
                    value={referencePrice}
                    onChange={(e) => setReferencePrice(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Imágenes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imágenes (opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="images" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Subir imágenes
                        </span>
                        <input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG hasta 10MB cada una
                      </p>
                    </div>
                  </div>
                  {images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        {images.length} imagen(es) seleccionada(s)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Video (opcional)
                </label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>

              {/* Botones */}
              <div className="flex space-x-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creando...' : 'Crear Servicio'}
                </Button>
                <Link href="/">
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
