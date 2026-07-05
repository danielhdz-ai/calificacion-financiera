# GSCAPITAL

Gestor de banca financiera con base de datos en la nube (Supabase).

## Módulos

- **Asesoramiento** — ficha completa del cliente
- **Calculadora de Hipoteca** — capacidad de pago y cuota estimada
- **Préstamo Personal** — simulación de cuotas
- **Base de Datos Clientes** — listado, filtros y acciones
- **Colaboradores de Banca** — contactos por entidad
- **Tasadores** — peritos y zonas de cobertura
- **Configuración** — importar/exportar JSON y sincronizar

## Estructura del proyecto

```
app/
  api/clients/          API clientes (Supabase)
  api/collaborators/    API colaboradores
  api/tasadores/        API tasadores
components/gscapital/
  tabs/                 Una pestaña por módulo
  layout/               Cabecera y navegación
  ui/                   Componentes reutilizables
lib/gscapital/
  calculators/          Lógica hipoteca y préstamo
  types.ts              Tipos compartidos
  api.ts                Cliente HTTP
supabase/
  setup_database.sql    Script SQL para Supabase
```

## Configurar Supabase

1. Ejecuta `supabase/setup_database.sql` en el SQL Editor
2. Configura `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

3. En Vercel, agrega las mismas variables

## Desarrollo

```bash
npm install
npm run dev
```

## App original

La versión monolítica original está en `D:\Proyectos\finanbase\BASEGS.html`.
