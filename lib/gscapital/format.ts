export function formatCurrency(value: number | string | undefined | null): string {
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(num);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d,-]/g, "").replace(",", ".")) || 0;
}

export function createId(): string {
  return `${Date.now()}${Math.random().toString(16).slice(2)}`;
}

export function getStatusColor(status?: string): string {
  switch (status) {
    case "aprobado":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "rechazado":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "activo":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "noactivo":
      return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
    case "pendiente":
    default:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  }
}
