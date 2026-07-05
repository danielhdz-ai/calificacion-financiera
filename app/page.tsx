import { QualificationForm } from "@/components/QualificationForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_45%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            Evaluación personal
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Calificación Financiera
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Responde un cuestionario breve sobre ingresos, deuda, ahorro y
            planificación para conocer tu nivel de calificación financiera.
          </p>
        </section>

        <QualificationForm />

        <p className="mt-6 text-center text-sm text-slate-500">
          Esta herramienta es orientativa y no sustituye asesoría financiera
          profesional.
        </p>
      </div>
    </main>
  );
}
