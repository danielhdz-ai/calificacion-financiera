"use client";

import { useEffect, useMemo, useState } from "react";
import { useGSCapital } from "@/components/gscapital/GSCapitalContext";
import {
  Field,
  Input,
  Panel,
  PrimaryButton,
} from "@/components/gscapital/ui/Panel";
import { calculatePersonalLoan } from "@/lib/gscapital/calculators/personal-loan";
import { formatCurrency } from "@/lib/gscapital/format";

export function PrestamoTab() {
  const { currentClient, updateClient, pendingLoanAmount, setPendingLoanAmount } =
    useGSCapital();
  const [loanAmount, setLoanAmount] = useState(18000);
  const [loanTermYears, setLoanTermYears] = useState(4);
  const [tin, setTin] = useState(6.5);
  const [tae, setTae] = useState(6.7);
  const [purpose, setPurpose] = useState("reforma");

  useEffect(() => {
    if (pendingLoanAmount && pendingLoanAmount >= 6000) {
      setLoanAmount(pendingLoanAmount);
      setPurpose("otros");
      setPendingLoanAmount(null);
    }
  }, [pendingLoanAmount, setPendingLoanAmount]);

  const result = useMemo(
    () => calculatePersonalLoan({ loanAmount, loanTermYears, tin, tae }),
    [loanAmount, loanTermYears, tin, tae],
  );

  async function handleSaveToClient() {
    if (!currentClient) {
      alert("Seleccione o cree un cliente en Asesoramiento.");
      return;
    }
    try {
      await updateClient({
        ...currentClient,
        personalLoan: {
          purpose,
          loanAmount,
          loanTermYears,
          tin,
          tae,
          cuotaMensual: result.cuotaMensual,
          totalAdeudado: result.totalAdeudado,
          costeTotalCredito: result.costeTotalCredito,
          updatedAt: new Date().toISOString(),
        },
      });
      alert(`Simulación de préstamo guardada para "${currentClient.name}".`);
    } catch {
      alert("No se pudo guardar en Supabase.");
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Calculadora de Préstamo Personal
      </h2>
      {currentClient ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Cliente activo: <strong>{currentClient.name}</strong>
          {pendingLoanAmount ? (
            <> — importe sugerido por hipoteca: <strong>{pendingLoanAmount.toLocaleString("es-ES")} €</strong></>
          ) : null}
        </p>
      ) : (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Seleccione un cliente en Asesoramiento para guardar la simulación en Supabase.
        </p>
      )}
      <Panel>
        <h3 className="mb-4 text-lg font-semibold">¿Para qué necesitas el préstamo?</h3>
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["reforma", "Reforma eficiencia energética"],
            ["coche", "Coche"],
            ["reunificacion", "Reunificación de deudas"],
            ["otros", "Otros fines"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPurpose(value)}
              className={`rounded-lg border-2 p-4 text-center ${
                purpose === value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                  : "border-transparent bg-gray-50 dark:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="¿Cuánto dinero necesitas? (€)">
            <Input type="number" value={loanAmount} min={6000} max={60000} step={1000} onChange={(e) => setLoanAmount(Number(e.target.value))} />
            <input type="range" min={6000} max={60000} step={1000} value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="mt-2 w-full" />
            <p className="mt-2 text-center font-semibold text-blue-700">{formatCurrency(loanAmount)}</p>
          </Field>
          <Field label="Plazo del Préstamo (años)"><Input type="number" value={loanTermYears} min={1} max={10} onChange={(e) => setLoanTermYears(Number(e.target.value))} /></Field>
          <Field label="TIN Anual (%)"><Input type="number" step="0.01" value={tin} onChange={(e) => setTin(Number(e.target.value))} /></Field>
          <Field label="TAE Anual (%)"><Input type="number" step="0.01" value={tae} onChange={(e) => setTae(Number(e.target.value))} /></Field>
        </div>

        <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="py-2">Importe solicitado</td><td className="py-2 text-right font-semibold">{formatCurrency(loanAmount)}</td></tr>
              <tr><td className="py-2">TIN aplicado</td><td className="py-2 text-right font-semibold">{(result.usedInterestRate * 100).toFixed(2)}%</td></tr>
              <tr><td className="py-2">Coste total del crédito</td><td className="py-2 text-right font-semibold">{formatCurrency(result.costeTotalCredito)}</td></tr>
              <tr><td className="py-2">Importe total adeudado</td><td className="py-2 text-right font-bold text-blue-600">{formatCurrency(result.totalAdeudado)}</td></tr>
              <tr><td className="py-2">Cuota mensual</td><td className="py-2 text-right font-bold text-blue-600">{formatCurrency(result.cuotaMensual)}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex gap-3">
          <PrimaryButton type="button" onClick={() => void handleSaveToClient()}>
            Guardar simulación al cliente
          </PrimaryButton>
        </div>
      </Panel>
    </div>
  );
}
