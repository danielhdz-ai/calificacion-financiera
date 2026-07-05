import type { Question } from "./types";

export const questions: Question[] = [
  {
    id: "monthly-income",
    category: "Ingresos",
    title: "¿Cuál es tu ingreso mensual neto aproximado?",
    options: [
      { label: "Menos de $10,000 MXN", value: "low", score: 1 },
      { label: "$10,000 - $25,000 MXN", value: "mid-low", score: 2 },
      { label: "$25,000 - $50,000 MXN", value: "mid", score: 3 },
      { label: "Más de $50,000 MXN", value: "high", score: 4 },
    ],
  },
  {
    id: "income-stability",
    category: "Ingresos",
    title: "¿Qué tan estable es tu fuente de ingresos?",
    options: [
      { label: "Variable o irregular", value: "variable", score: 1 },
      { label: "Freelance con meses buenos y malos", value: "mixed", score: 2 },
      { label: "Empleo formal estable", value: "stable", score: 3 },
      { label: "Múltiples fuentes estables", value: "diversified", score: 4 },
    ],
  },
  {
    id: "debt-ratio",
    category: "Deuda",
    title: "¿Qué porcentaje de tus ingresos destinas a deudas?",
    options: [
      { label: "Más del 50%", value: "critical", score: 1 },
      { label: "Entre 30% y 50%", value: "high", score: 2 },
      { label: "Entre 15% y 30%", value: "moderate", score: 3 },
      { label: "Menos del 15%", value: "low", score: 4 },
    ],
  },
  {
    id: "emergency-fund",
    category: "Ahorro",
    title: "¿Cuántos meses de gastos tienes ahorrados?",
    options: [
      { label: "Ninguno", value: "none", score: 1 },
      { label: "Menos de 1 mes", value: "partial", score: 2 },
      { label: "Entre 1 y 3 meses", value: "basic", score: 3 },
      { label: "Más de 3 meses", value: "solid", score: 4 },
    ],
  },
  {
    id: "monthly-savings",
    category: "Ahorro",
    title: "¿Qué porcentaje de tus ingresos ahorras mensualmente?",
    options: [
      { label: "No ahorro", value: "none", score: 1 },
      { label: "Menos del 5%", value: "low", score: 2 },
      { label: "Entre 5% y 15%", value: "moderate", score: 3 },
      { label: "Más del 15%", value: "high", score: 4 },
    ],
  },
  {
    id: "credit-history",
    category: "Crédito",
    title: "¿Cómo describirías tu historial crediticio?",
    options: [
      { label: "Atrasos frecuentes o deuda vencida", value: "poor", score: 1 },
      { label: "Algunos retrasos ocasionales", value: "fair", score: 2 },
      { label: "Pagos puntuales en la mayoría de casos", value: "good", score: 3 },
      { label: "Excelente, sin atrasos", value: "excellent", score: 4 },
    ],
  },
  {
    id: "expense-control",
    category: "Gastos",
    title: "¿Llevas control de tus gastos mensuales?",
    options: [
      { label: "No llevo registro", value: "none", score: 1 },
      { label: "Solo reviso el saldo", value: "basic", score: 2 },
      { label: "Tengo un presupuesto informal", value: "informal", score: 3 },
      { label: "Presupuesto detallado y actualizado", value: "detailed", score: 4 },
    ],
  },
  {
    id: "financial-goals",
    category: "Planificación",
    title: "¿Tienes metas financieras definidas?",
    options: [
      { label: "No tengo metas claras", value: "none", score: 1 },
      { label: "Metas generales sin plan", value: "vague", score: 2 },
      { label: "Metas con plazos aproximados", value: "planned", score: 3 },
      { label: "Metas con plan y seguimiento", value: "tracked", score: 4 },
    ],
  },
];
