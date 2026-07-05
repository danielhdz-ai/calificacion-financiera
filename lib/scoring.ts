import { questions } from "./questions";
import type {
  Answers,
  QualificationLevel,
  QualificationResult,
} from "./types";

const levelConfig: Record<
  QualificationLevel,
  { title: string; summary: string; recommendations: string[] }
> = {
  excelente: {
    title: "Calificación Excelente",
    summary:
      "Tu perfil financiero es sólido. Mantienes buenos hábitos de ahorro, control de deuda y planificación.",
    recommendations: [
      "Considera diversificar inversiones para hacer crecer tu patrimonio.",
      "Revisa tu plan financiero cada trimestre para mantener el rumbo.",
      "Evalúa protección patrimonial como seguros y fondos de emergencia ampliados.",
    ],
  },
  buena: {
    title: "Calificación Buena",
    summary:
      "Tienes bases financieras saludables, con oportunidades claras para fortalecer reservas y planificación.",
    recommendations: [
      "Incrementa tu fondo de emergencia hasta cubrir al menos 3 meses de gastos.",
      "Automatiza ahorros e inversiones al inicio de cada mes.",
      "Reduce deudas de alto interés para liberar flujo de efectivo.",
    ],
  },
  regular: {
    title: "Calificación Regular",
    summary:
      "Tu situación es manejable, pero conviene actuar pronto para evitar presión financiera a mediano plazo.",
    recommendations: [
      "Elabora un presupuesto mensual y regístralo de forma consistente.",
      "Prioriza pagar deudas con tasas más altas.",
      "Construye un colchón de emergencia, aunque sea con aportaciones pequeñas.",
    ],
  },
  "requiere-atencion": {
    title: "Requiere Atención",
    summary:
      "Tu perfil muestra vulnerabilidad financiera. Es recomendable reestructurar gastos y deuda cuanto antes.",
    recommendations: [
      "Identifica gastos no esenciales y redúcelos de inmediato.",
      "Negocia o reestructura deudas para mejorar tu capacidad de pago.",
      "Busca asesoría financiera para diseñar un plan de recuperación.",
    ],
  },
};

function getLevel(score: number): QualificationLevel {
  if (score >= 85) return "excelente";
  if (score >= 70) return "buena";
  if (score >= 50) return "regular";
  return "requiere-atencion";
}

export function calculateQualification(answers: Answers): QualificationResult {
  const categoryTotals: Record<string, { total: number; count: number }> = {};
  let totalScore = 0;
  let maxScore = 0;

  for (const question of questions) {
    const selected = question.options.find(
      (option) => option.value === answers[question.id],
    );
    const score = selected?.score ?? 0;

    totalScore += score;
    maxScore += 4;

    if (!categoryTotals[question.category]) {
      categoryTotals[question.category] = { total: 0, count: 0 };
    }

    categoryTotals[question.category].total += score;
    categoryTotals[question.category].count += 1;
  }

  const normalizedScore = Math.round((totalScore / maxScore) * 100);
  const level = getLevel(normalizedScore);
  const config = levelConfig[level];

  const categoryScores = Object.fromEntries(
    Object.entries(categoryTotals).map(([category, data]) => [
      category,
      Math.round((data.total / (data.count * 4)) * 100),
    ]),
  );

  return {
    score: normalizedScore,
    level,
    title: config.title,
    summary: config.summary,
    recommendations: config.recommendations,
    categoryScores,
  };
}

export function getLevelColor(level: QualificationLevel): string {
  switch (level) {
    case "excelente":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "buena":
      return "text-sky-600 bg-sky-50 border-sky-200";
    case "regular":
      return "text-amber-600 bg-amber-50 border-amber-200";
    default:
      return "text-rose-600 bg-rose-50 border-rose-200";
  }
}
