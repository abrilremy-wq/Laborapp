import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ServicesFeed from '@/components/ServicesFeed'
import RequestsFeed from '@/components/RequestsFeed'
import Navigation from '@/components/Navigation'

export default async function Page() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from('users_public')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navigation userName={profile.name} userRole={profile.role} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {profile.name}!
          </h2>
          <p className="text-gray-600">
            {profile.base_location && `Ubicación: ${profile.base_location}`}
          </p>
        </div>

        {/* Tabs según rol */}
        <Tabs defaultValue={profile.role === 'Productor' ? 'services' : 'requests'} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            {/* Productor ve: Servicios (para buscar servicios) */}
            {profile.role === 'Productor' && (
              <TabsTrigger value="services">Servicios</TabsTrigger>
            )}
            {/* Contratista ve: Solicitudes (para ver solicitudes de trabajo) */}
            {profile.role === 'Contratista' && (
              <TabsTrigger value="requests">Solicitudes</TabsTrigger>
            )}
            {/* Productor ve: Solicitudes (para gestionar sus solicitudes) */}
            {profile.role === 'Productor' && (
              <TabsTrigger value="requests">Mis Solicitudes</TabsTrigger>
            )}
            {/* Contratista ve: Servicios (para gestionar sus servicios) */}
            {profile.role === 'Contratista' && (
              <TabsTrigger value="services">Mis Servicios</TabsTrigger>
            )}
            {/* Ambos ven ambas pestañas */}
            {profile.role === 'Ambos' && (
              <>
                <TabsTrigger value="services">Servicios</TabsTrigger>
                <TabsTrigger value="requests">Solicitudes</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Contenido para Productor */}
          {profile.role === 'Productor' && (
            <>
              <TabsContent value="services">
                <ServicesFeed />
              </TabsContent>
              <TabsContent value="requests">
                <RequestsFeed />
              </TabsContent>
            </>
          )}

          {/* Contenido para Contratista */}
          {profile.role === 'Contratista' && (
            <>
              <TabsContent value="requests">
                <RequestsFeed />
              </TabsContent>
              <TabsContent value="services">
                <ServicesFeed />
              </TabsContent>
            </>
          )}

          {/* Contenido para Ambos */}
          {profile.role === 'Ambos' && (
            <>
              <TabsContent value="services">
                <ServicesFeed />
              </TabsContent>
              <TabsContent value="requests">
                <RequestsFeed />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  )
}