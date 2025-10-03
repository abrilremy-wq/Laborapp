'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RefreshCw, TrendingUp, MapPin, DollarSign, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface ReferencePrice {
  service_type: string
  region: string
  price_avg: number
  source: string
  created_at: string
}

export default function PricesPage() {
  const [prices, setPrices] = useState<ReferencePrice[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [regions, setRegions] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchPrices()
  }, [])

  const fetchPrices = async () => {
    try {
      setLoading(true)
      
      // Llamar a la función de Supabase para obtener precios
      const { data, error } = await supabase.rpc('get_reference_prices', {
        p_service_type: selectedServiceType === 'all' ? null : selectedServiceType,
        p_region: selectedRegion === 'all' ? null : selectedRegion
      })

      if (error) {
        console.error('Error fetching prices:', error)
        toast.error('Error al cargar precios de referencia')
        return
      }

      setPrices(data || [])
      
      // Extraer regiones únicas para el filtro
      const uniqueRegions = [...new Set((data || []).map((p: ReferencePrice) => p.region))] as string[]
      setRegions(uniqueRegions)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const refreshPrices = async () => {
    try {
      setRefreshing(true)
      
      // Llamar al endpoint para actualizar precios
      const response = await fetch('/api/update-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar precios')
      }

      toast.success('Precios actualizados correctamente')
      await fetchPrices()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error inesperado')
    } finally {
      setRefreshing(false)
    }
  }

  const getServiceTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'siembra': 'Siembra',
      'cosecha': 'Cosecha',
      'fumigacion': 'Fumigación',
      'otros': 'Otros'
    }
    return labels[type] || type
  }

  const getServiceTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'siembra': 'bg-green-100 text-green-800',
      'cosecha': 'bg-yellow-100 text-yellow-800',
      'fumigacion': 'bg-red-100 text-red-800',
      'otros': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const filteredPrices = prices.filter(price => {
    const matchesService = selectedServiceType === 'all' || price.service_type === selectedServiceType
    const matchesRegion = selectedRegion === 'all' || price.region.toLowerCase().includes(selectedRegion.toLowerCase())
    return matchesService && matchesRegion
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Precios de Referencia</h1>
            <p className="text-gray-600 mt-2">
              Consulta precios promedios por tipo de servicio y región
            </p>
          </div>
          <Button 
            onClick={refreshPrices} 
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Servicios</p>
                  <p className="text-2xl font-bold text-gray-900">{prices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Regiones</p>
                  <p className="text-2xl font-bold text-gray-900">{regions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${prices.length > 0 ? Math.round(prices.reduce((sum, p) => sum + p.price_avg, 0) / prices.length) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtra por tipo de servicio y región para encontrar precios específicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Servicio
                </label>
                <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="siembra">Siembra</SelectItem>
                    <SelectItem value="cosecha">Cosecha</SelectItem>
                    <SelectItem value="fumigacion">Fumigación</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Región
                </label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar región" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las regiones</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de precios */}
        <Card>
          <CardHeader>
            <CardTitle>Precios de Referencia</CardTitle>
            <CardDescription>
              Precios promedios calculados a partir de publicaciones recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPrices.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No hay precios de referencia disponibles</p>
                <p className="text-gray-400 text-sm">
                  Los precios se calculan automáticamente a partir de las publicaciones de servicios
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Servicio</TableHead>
                      <TableHead>Región</TableHead>
                      <TableHead>Precio Promedio</TableHead>
                      <TableHead>Fuente</TableHead>
                      <TableHead>Última Actualización</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrices.map((price, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge className={getServiceTypeColor(price.service_type)}>
                            {getServiceTypeLabel(price.service_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{price.region}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-lg">
                              {price.price_avg.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={price.source === 'manual' ? 'default' : 'secondary'}>
                            {price.source === 'manual' ? 'Manual' : 'Publicaciones'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(price.created_at).toLocaleDateString('es-AR')}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">¿Cómo se calculan estos precios?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Los precios de referencia se calculan automáticamente a partir de las publicaciones 
                  de servicios activos en los últimos 6 meses. Se requiere al menos 2 servicios 
                  del mismo tipo en la misma región para generar un promedio confiable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
