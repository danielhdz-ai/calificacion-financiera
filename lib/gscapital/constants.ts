export const AGENT_INFO = {
  name: "Daniel Hernández",
  title: "Gestor de Banca",
  phone: "620809938",
  email: "daniel.mic2022@gmail.com",
  company: "GSCAPITAL",
  address: "08001 Barcelona",
  landline: "93.352.68.55",
  website: "www.gscapital.es",
};

export const DEFAULT_PERSONAL_LOAN_INTEREST_RATE = 0.065;
export const PERSONAL_LOAN_COMMISSION = 0.025;

export const WHATSAPP_MESSAGE_TEMPLATE =
  "Hola buenos días, soy Daniel de GSCAPITAL, realizamos un estudio financiero hace un tiempo, ¿le sigue interesando poder comprar? Llegaron unos inmuebles nuevos, quizás os interesan, un saludo.";

export const TABS = [
  { id: "asesoramiento", label: "Asesoramiento" },
  { id: "hipoteca", label: "Calculadora de Hipoteca" },
  { id: "prestamo", label: "Préstamo Personal" },
  { id: "database", label: "Base de Datos Clientes" },
  { id: "colaboradores", label: "Colaboradores de Banca" },
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
