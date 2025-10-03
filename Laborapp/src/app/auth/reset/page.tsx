'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast.error('Error al enviar el correo: ' + error.message)
      } else {
        setSent(true)
        toast.success('Correo de recuperación enviado')
      }
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Correo Enviado</CardTitle>
          <CardDescription>
            Revisa tu correo electrónico para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Te hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>
            </p>
            <Link href="/auth/login">
              <Button variant="outline">Volver al inicio de sesión</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restablecer Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico para recibir un enlace de recuperación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

