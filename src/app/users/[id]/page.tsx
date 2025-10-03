import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Phone, Mail, Star } from 'lucide-react'
import RatingDisplay from '@/components/RatingDisplay'
import RatingDialog from '@/components/RatingDialog'
import Navigation from '@/components/Navigation'

interface UserProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const supabase = await createClient()
  const { id } = await params
  
  // Obtener usuario actual
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  // Obtener perfil del usuario a mostrar
  const { data: profile, error } = await supabase
    .from('users_public')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Obtener perfil del usuario actual
  let currentUserProfile = null
  if (currentUser) {
    const { data } = await supabase
      .from('users_public')
      .select('*')
      .eq('id', currentUser.id)
      .single()
    currentUserProfile = data
  }

  const canRate = currentUserProfile && 
    currentUserProfile.id !== profile.id && 
    (
      (profile.role === 'Contratista' && (currentUserProfile.role === 'Productor' || currentUserProfile.role === 'Ambos')) ||
      (profile.role === 'Productor' && (currentUserProfile.role === 'Contratista' || currentUserProfile.role === 'Ambos'))
    )

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Productor':
        return 'bg-green-100 text-green-800'
      case 'Contratista':
        return 'bg-blue-100 text-blue-800'
      case 'Ambos':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {currentUserProfile && (
        <Navigation userName={currentUserProfile.name} userRole={currentUserProfile.role} />
      )}
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del usuario */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
                <Badge className={`inline-flex ${getRoleColor(profile.role)}`}>
                  {profile.role}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.base_location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.base_location}</span>
                  </div>
                )}
                
                {profile.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}

                {profile.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                )}

                {canRate && (
                  <div className="pt-4">
                    <RatingDialog
                      userId={profile.id}
                      userName={profile.name}
                      userRole={profile.role as 'Productor' | 'Contratista'}
                    >
                      <Button className="w-full">
                        <Star className="h-4 w-4 mr-2" />
                        Valorar Usuario
                      </Button>
                    </RatingDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Valoraciones */}
          <div className="lg:col-span-2">
            <RatingDisplay userId={profile.id} showAll={true} />
          </div>
        </div>
      </main>
    </div>
  )
}

