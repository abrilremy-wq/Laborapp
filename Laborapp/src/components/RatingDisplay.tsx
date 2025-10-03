'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Star } from 'lucide-react'

interface Rating {
  id: string
  stars: number
  comment: string | null
  created_at: string
  author: {
    name: string
    role: string
  }
}

interface RatingDisplayProps {
  userId: string
  showAll?: boolean
}

export default function RatingDisplay({ userId, showAll = false }: RatingDisplayProps) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchRatings()
  }, [userId])

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          id,
          stars,
          comment,
          created_at,
          author:users_public!ratings_author_id_fkey(
            name,
            role
          )
        `)
        .eq('target_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching ratings:', error)
        return
      }

      console.log('Ratings fetched:', data)
      setRatings((data || []).map((rating: any) => ({
        ...rating,
        author: Array.isArray(rating.author) ? rating.author[0] : rating.author
      })) as Rating[])
      
      // Calcular promedio
      if (data && data.length > 0) {
        const avg = data.reduce((sum, rating) => sum + rating.stars, 0) / data.length
        setAverageRating(Math.round(avg * 10) / 10)
        setTotalRatings(data.length)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reputación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayRatings = showAll ? ratings : ratings.slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reputación</span>
          {totalRatings > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-medium">{averageRating}</span>
              </div>
              <Badge variant="secondary">
                {totalRatings} valoración{totalRatings > 1 ? 'es' : ''}
              </Badge>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          {totalRatings === 0 
            ? 'Aún no tiene valoraciones'
            : `Promedio de ${averageRating} estrellas basado en ${totalRatings} valoraciones`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalRatings === 0 ? (
          <p className="text-gray-500 text-sm">Este usuario aún no ha recibido valoraciones.</p>
        ) : (
          <div className="space-y-4">
            {displayRatings.map((rating) => (
              <div key={rating.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{rating.author.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {rating.author.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(rating.created_at)}</p>
                  </div>
                  {renderStars(rating.stars)}
                </div>
                {rating.comment && (
                  <p className="text-sm text-gray-700 mt-2">{rating.comment}</p>
                )}
              </div>
            ))}
            
            {!showAll && ratings.length > 3 && (
              <p className="text-sm text-gray-500 text-center pt-2">
                Mostrando las últimas 3 valoraciones de {totalRatings} totales
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

