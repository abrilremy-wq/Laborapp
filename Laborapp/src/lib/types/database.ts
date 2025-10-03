export type UserRole = 'Productor' | 'Contratista' | 'Ambos'
export type ServiceType = 'siembra' | 'cosecha' | 'fumigacion' | 'otros'
export type ServiceStatus = 'active' | 'paused' | 'archived'
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'closed'

export interface User {
  id: string
  name: string | null
  role: UserRole
  base_location: string | null
  phone: string | null
  avatar_url: string | null
  reputation_avg: number
  reputation_count: number
  created_at: string
}

export interface Service {
  id: string
  contractor_id: string
  title: string
  description: string | null
  service_type: ServiceType
  coverage_area: string | null
  reference_price: number | null
  images: string[]
  video_url: string | null
  status: ServiceStatus
  created_at: string
  contractor?: User
}

export interface Lot {
  id: string
  owner_id: string
  name: string
  location: string
  surface_total_ha: number | null
  created_at: string
}

export interface Request {
  id: string
  producer_id: string
  contractor_id: string | null
  service_id: string | null
  service_type: ServiceType
  hectares: number
  date_target: string
  lot_id: string | null
  free_location: string | null
  status: RequestStatus
  created_at: string
  producer?: User
  contractor?: User
  service?: Service
  lot?: Lot
}

export interface Message {
  id: string
  from_id: string
  to_id: string
  body: string
  request_id: string | null
  service_id: string | null
  sent_at: string
  from_user?: User
  to_user?: User
}

export interface Rating {
  id: string
  author_id: string
  target_id: string
  stars: number
  comment: string | null
  created_at: string
  author?: User
  target?: User
}

