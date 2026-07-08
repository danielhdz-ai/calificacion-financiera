export const AGENT_INFO = {
  name: "Daniel Hernández",
  title: "Gestor",
  phone: "60037742",
  email: "admin.livendia@gmail.com",
  company: "Livendia Finance",
  address: "08001 Barcelona",
  landline: "60037742",
  website: "https://livendia.com",
};

export const DEFAULT_PERSONAL_LOAN_INTEREST_RATE = 0.065;
export const PERSONAL_LOAN_COMMISSION = 0.025;

export const WHATSAPP_MESSAGE_TEMPLATE =
  "Hola buenos días, soy el equipo de Livendia Finance. Realizamos un estudio financiero hace un tiempo, ¿le sigue interesando poder comprar? Llegaron inmuebles nuevos que quizás le interesen. Un saludo.";

export const TABS = [
  { id: "asesoramiento", label: "Asesoramiento" },
  { id: "hipoteca", label: "Calculadora de Hipoteca" },
  { id: "prestamo", label: "Préstamo Personal" },
  { id: "database", label: "Base de Datos Clientes" },
  { id: "colaboradores", label: "Colaboradores de Banca" },
  { id: "inmobiliarios", label: "Colaboradores Inmobiliarios" },
  { id: "notarias", label: "Colaboradores Notarías" },
  { id: "tasadores", label: "Tasadores" },
  { id: "configuracion", label: "Configuración" },
] as const;

export const CLIENT_STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
  { value: "activo", label: "Activo" },
  { value: "noactivo", label: "No Activo" },
] as const;
