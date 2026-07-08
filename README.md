# Livendia Finance

Plataforma financiera con base de datos en la nube (Supabase).

## Módulos

- **Asesoramiento** — ficha completa del cliente (hasta 3 copropietarios)
- **Calculadora de Hipoteca** — capacidad de pago y cuota estimada
- **Préstamo Personal** — simulación de cuotas
- **Base de Datos Clientes** — listado, filtros y acciones
- **Colaboradores de Banca** — contactos por entidad
- **Colaboradores Inmobiliarios** — agentes y agencias
- **Colaboradores Notarías** — contactos de notarías
- **Tasadores** — peritos y zonas de cobertura
- **Configuración** — importar/exportar JSON y sincronizar

## Datos en Supabase

Todos los módulos sincronizan con Supabase por usuario autenticado:

| Tabla | Contenido |
|-------|-----------|
| `clients` | Operaciones / clientes con copropietarios |
| `collaborators` | Colaboradores bancarios |
| `inmobiliarios` | Colaboradores inmobiliarios |
| `notarias` | Colaboradores notarías |
| `tasadores` | Tasadores |

## Configurar Supabase

1. Ejecuta `supabase/setup_database.sql` en el SQL Editor
2. Configura `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## Desarrollo

```bash
npm install
npm run dev
```

## Despliegue

Desplegado en Vercel como **livendia-finance**.
