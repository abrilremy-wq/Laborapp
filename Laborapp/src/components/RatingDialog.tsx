'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Star } from 'lucide-react'

interface RatingDialogProps {
  userId: string
  userName: string
  userRole: 'Productor' | 'Contratista'
  requestId?: string
  serviceId?: string
  children: React.ReactNode
}

export default function RatingDialog({ 
  userId, 
  userName, 
  userRole, 
  requestId, 
  serviceId, 
  children 
}: RatingDialogProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Por favor selecciona una calificación')
      return
    }

    setLoading(true)

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        toast.error('No estás autenticado')
        return
      }

      // Verificar que el usuario actual tenga el rol correcto para valorar
      const { data: currentUserProfile } = await supabase
        .from('users_public')
        .select('role')
        .eq('id', currentUser.id)
        .single()

      if (!currentUserProfile) {
        toast.error('Perfil de usuario no encontrado')
        return
      }

      // Validar que el usuario pueda valorar según las reglas de negocio
      if (userRole === 'Contratista' && currentUserProfile.role !== 'Productor' && currentUserProfile.role !== 'Ambos') {
        toast.error('Solo los productores pueden valorar contratistas')
        return
      }

      if (userRole === 'Productor' && currentUserProfile.role !== 'Contratista' && currentUserProfile.role !== 'Ambos') {
        toast.error('Solo los contratistas pueden valorar productores')
        return
      }

      // Crear la valoración
      const { error } = await supabase
        .from('ratings')
        .insert({
          author_id: currentUser.id,
          target_id: userId,
          stars: rating,
          comment: comment || null
        })

      if (error) {
        toast.error('Error al crear la valoración: ' + error.message)
      } else {
        toast.success('¡Valoración enviada exitosamente!')
        setOpen(false)
        setRating(0)
        setComment('')
      }
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const getRatingCriteria = () => {
    if (userRole === 'Contratista') {
      return [
        'Compromiso',
        'Cumplimiento',
        'Responsabilidad',
        'Calidad'
      ]
    } else {
      return [
        'Pago',
        'Responsabilidad',
        'Accesibilidad'
      ]
    }
  }

  const criteria = getRatingCriteria()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Valorar a {userName}</DialogTitle>
          <DialogDescription>
            Como {userRole === 'Contratista' ? 'Productor' : 'Contratista'}, califica a este {userRole.toLowerCase()} en los siguientes aspectos:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Calificación general */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación General *
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {rating > 0 && `${rating} estrella${rating > 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Criterios específicos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Criterios de Evaluación
            </label>
            <div className="space-y-2">
              {criteria.map((criterion, index) => (
                <div key={criterion} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{criterion}</span>
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
                </div>
              ))}
            </div>
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario (opcional)
            </label>
            <Textarea
              placeholder="Comparte tu experiencia trabajando con esta persona..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex space-x-2">
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? 'Enviando...' : 'Enviar Valoración'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
