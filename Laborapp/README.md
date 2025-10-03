# Agrom - Marketplace Agro

Un marketplace que conecta productores y contratistas en el sector agropecuario, construido con Next.js 14, TypeScript, Tailwind CSS, shadcn/ui y Supabase.

## 🚀 Características

- **Autenticación completa** con Supabase Auth (registro, login, recuperación de contraseña)
- **Roles de usuario**: Productor, Contratista, o Ambos
- **Gestión de servicios** para contratistas
- **Solicitudes de trabajo** para productores
- **Sistema de mensajería** entre usuarios
- **Sistema de valoraciones** y reputación
- **Gestión de lotes** para productores
- **Interfaz moderna** con shadcn/ui y Tailwind CSS

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Supabase (Auth, Database, Storage)
- **Base de datos**: PostgreSQL con Row Level Security (RLS)
- **Autenticación**: Supabase Auth con políticas RLS

## 📋 Prerequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

## ⚙️ Configuración

### 1. Clonar y instalar dependencias

```bash
cd agrom
npm install
```

### 2. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > API para obtener tus credenciales
3. Copia el archivo de ejemplo de variables de entorno:

```bash
cp env.example .env.local
```

4. Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configurar la base de datos

1. Ve a tu proyecto de Supabase > SQL Editor
2. Ejecuta el contenido del archivo `supabase/migrations/001_initial_schema_simple.sql`
3. Esto creará todas las tablas y políticas RLS necesarias

### 4. Configurar Storage para imágenes

1. En el **SQL Editor** de Supabase, ejecuta también:

```sql
-- Copia y pega todo el contenido de supabase/migrations/002_storage_setup.sql
```

Esto configurará el bucket `service-images` para almacenar las imágenes de los servicios.

### 5. Configurar triggers de valoraciones

1. En el **SQL Editor** de Supabase, ejecuta también:

```sql
-- Copia y pega todo el contenido de supabase/migrations/003_rating_triggers.sql
```

Esto configurará los triggers para actualizar automáticamente la reputación de los usuarios cuando reciban valoraciones.

### 6. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Estructura de la Base de Datos

### Tablas principales:

- **users_public**: Perfiles de usuarios con roles y reputación
- **services**: Servicios ofrecidos por contratistas
- **requests**: Solicitudes de trabajo de productores
- **lots**: Lotes de productores
- **messages**: Mensajes entre usuarios
- **ratings**: Valoraciones y comentarios

### Políticas RLS implementadas:

- Usuarios pueden ver y editar solo su propio perfil
- Servicios son públicos para usuarios autenticados
- Contratistas pueden gestionar solo sus propios servicios
- Solicitudes tienen acceso controlado según el rol
- Mensajes solo visibles para participantes
- Valoraciones públicas pero creación controlada

## 🎯 Funcionalidades por Rol

### Productor
- Ver servicios disponibles
- Crear solicitudes de trabajo
- Gestionar sus lotes
- Chatear con contratistas
- Valorar servicios recibidos

### Contratista
- Publicar servicios
- Ver solicitudes pendientes
- Aceptar/rechazar solicitudes
- Chatear con productores
- Valorar trabajos realizados

### Ambos
- Acceso completo a ambas funcionalidades

## 📱 Páginas y Rutas

- `/` - Dashboard principal con tabs según rol
- `/auth/login` - Inicio de sesión
- `/auth/register` - Registro de usuario
- `/auth/reset` - Recuperación de contraseña
- `/onboarding` - Configuración inicial del perfil
- `/services/[id]` - Detalle de servicio
- `/requests/[id]` - Detalle de solicitud
- `/messages` - Lista de conversaciones
- `/messages/[userId]` - Chat individual
- `/profile` - Perfil del usuario actual
- `/my/services` - Gestión de servicios (contratistas)
- `/my/requests` - Gestión de solicitudes (productores)
- `/my/lots` - Gestión de lotes (productores)

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter ESLint
```

## 🧪 Datos de Prueba

Para probar la aplicación, puedes crear usuarios de prueba directamente desde la interfaz de registro, o usar el SQL Editor de Supabase para insertar datos de ejemplo.

## 📝 Notas de Desarrollo

- La aplicación usa App Router de Next.js 14
- Autenticación manejada completamente por Supabase
- Middleware protege rutas según autenticación y onboarding
- Componentes reutilizables con shadcn/ui
- TypeScript para type safety completo
- Responsive design con Tailwind CSS

## 🚧 Próximas Funcionalidades

- [ ] Sistema de pagos
- [ ] Notificaciones push
- [ ] Geolocalización avanzada
- [ ] Sistema de recomendaciones
- [ ] Dashboard de analytics
- [ ] API pública para integraciones

## 🚀 Despliegue en Netlify

### Opción 1: Desde GitHub (Recomendado)

1. **Sube tu código a GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to Netlify"
   git push origin main
   ```

2. **Conecta con Netlify**:
   - Ve a [netlify.com](https://netlify.com)
   - Haz clic en "New site from Git"
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio "agrom"

3. **Configura el build**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`

4. **Configura las variables de entorno**:
   - Ve a Site settings > Environment variables
   - Agrega:
     - `NEXT_PUBLIC_SUPABASE_URL`: tu URL de Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: tu clave anónima de Supabase
     - `SUPABASE_SERVICE_ROLE_KEY`: tu clave de servicio de Supabase
     - `NEXT_PUBLIC_APP_URL`: `https://tu-app-name.netlify.app`

5. **Despliega** 🚀

### Opción 2: Arrastrar y soltar

1. **Construye el proyecto localmente**:
   ```bash
   npm run build
   ```

2. **Comprime la carpeta `.next`**:
   - Comprime la carpeta `.next` en un archivo ZIP

3. **Arrastra a Netlify**:
   - Ve a [netlify.com](https://netlify.com)
   - Arrastra el archivo ZIP a la zona de deploy

## 📄 Licencia

Este proyecto es un MVP para demostración. Úsalo como base para tu propio marketplace agro.