import { getLevelColor } from "@/lib/scoring";
import type { QualificationResult } from "@/lib/types";

type ResultCardProps = {
  result: QualificationResult;
  onRestart: () => void;
  onBack: () => void;
};

export function ResultCard({ result, onRestart, onBack }: ResultCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
      <div className="space-y-6">
        <div className={`rounded-2xl border p-6 ${getLevelColor(result.level)}`}>
          <p className="text-sm font-medium uppercase tracking-wide">Resultado</p>
          <h2 className="mt-2 text-3xl font-bold">{result.title}</h2>
          <p className="mt-4 text-5xl font-black">{result.score}/100</p>
          <p className="mt-4 text-base leading-7">{result.summary}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Desempeño por categoría
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(result.categoryScores).map(([category, score]) => (
              <div
                key={category}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-700">{category}</span>
                  <span className="text-sm font-semibold text-brand-700">
                    {score}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Recomendaciones
          </h3>
          <ul className="mt-4 space-y-3">
            {result.recommendations.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Revisar respuestas
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Nueva evaluación
          </button>
        </div>
      </div>
    </div>
  );
}
