"use client";

import { useMemo, useState } from "react";
import { useGSCapital } from "@/components/gscapital/GSCapitalContext";
import {
  Field,
  Input,
  Panel,
  PrimaryButton,
  SecondaryButton,
} from "@/components/gscapital/ui/Panel";
import { calculateMortgage } from "@/lib/gscapital/calculators/mortgage";
import { formatCurrency } from "@/lib/gscapital/format";
import type { MortgageInput, MortgageResult } from "@/lib/gscapital/types";

const defaultForm: MortgageInput = {
  clientName: "",
  zone: "",
  monthlyIncome: 2000,
  existingDebts: 0,
  numTitulares: "1",
  financiacionPct: 90,
  housePrice: 0,
  loanTerm: 30,
  hipotecaInterestRate: 3,
  availableSavings: 0,
  existingLoanPayment: 0,
  itpPercentage: 10,
  notaria: 600,
  registro: 400,
  gestoria: 300,
  tasacion: 350,
  honorariosGSCapital: 0,
};

export function HipotecaTab() {
  const { currentClient, updateClient } = useGSCapital();
  const [form, setForm] = useState<MortgageInput>(() => ({
    ...defaultForm,
    clientName: currentClient?.name ?? "",
    zone: currentClient?.zone ?? "",
    monthlyIncome: currentClient?.income ?? 2000,
    existingDebts: currentClient?.debts ?? 0,
    availableSavings: currentClient?.availableSavings ?? 0,
    housePrice: currentClient?.housePrice ?? 0,
    numTitulares: (currentClient?.numTitulares as "1" | "2") ?? "1",
    financiacionPct: Number(currentClient?.financiacionPct ?? 90),
    loanTerm: currentClient?.loanTerm ?? 30,
    hipotecaInterestRate: currentClient?.hipotecaInterestRate ?? 3,
    existingLoanPayment: currentClient?.existingLoanPayment ?? 0,
    itpPercentage: currentClient?.itpPercentage ?? 10,
    notaria: currentClient?.notaria ?? 600,
    registro: currentClient?.registro ?? 400,
    gestoria: currentClient?.gestoria ?? 300,
    tasacion: currentClient?.tasacion ?? 350,
    honorariosGSCapital: currentClient?.honorariosGSCapital ?? 0,
  }));
  const [result, setResult] = useState<MortgageResult | null>(null);

  const itpValue = useMemo(
    () => form.housePrice * (form.itpPercentage / 100),
    [form.housePrice, form.itpPercentage],
  );

  function updateField<K extends keyof MortgageInput>(key: K, value: MortgageInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCalculate() {
    const calculated = calculateMortgage({ ...form, housePrice: form.housePrice || 0 });
    if (!form.housePrice && calculated.precioMaximoVivienda > 0) {
      updateField("housePrice", Math.round(calculated.precioMaximoVivienda));
    }
    setResult(calculated);
  }

  async function handleSaveToClient() {
    if (!currentClient) {
      alert("Seleccione o cree un cliente en Asesoramiento.");
      return;
    }
    if (!result) {
      alert("Calcule primero la hipoteca.");
      return;
    }
    await updateClient({
      ...currentClient,
      income: form.monthlyIncome,
      debts: form.existingDebts,
      numTitulares: form.numTitulares,
      financiacionPct: String(form.financiacionPct),
      housePrice: result.precioMaximoVivienda,
      loanTerm: form.loanTerm,
      hipotecaInterestRate: form.hipotecaInterestRate,
      availableSavings: form.availableSavings,
      existingLoanPayment: form.existingLoanPayment,
      itpPercentage: form.itpPercentage,
      itpValue: result.itpValue,
      notaria: form.notaria,
      registro: form.registro,
      gestoria: form.gestoria,
      tasacion: form.tasacion,
      honorariosGSCapital: form.honorariosGSCapital,
      mortgageAmount: result.importeHipoteca,
      monthlyPayment: result.cuotaMensual,
      zone: form.zone,
    });
    alert(`Datos de hipoteca guardados para "${currentClient.name}".`);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Calcula el valor máximo de vivienda accesible según tus ingresos
      </h2>
      <Panel title="Datos del Préstamo Hipotecario">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre del Cliente"><Input value={form.clientName} readOnly /></Field>
          <Field label="Zona"><Input value={form.zone} onChange={(e) => updateField("zone", e.target.value)} /></Field>
          <Field label="Ingresos Mensuales Netos (€)"><Input type="number" value={form.monthlyIncome} onChange={(e) => updateField("monthlyIncome", Number(e.target.value))} /></Field>
          <Field label="Deudas Mensuales Existentes (€)"><Input type="number" value={form.existingDebts} onChange={(e) => updateField("existingDebts", Number(e.target.value))} /></Field>
          <Field label="Número de Titulares">
            <div className="flex gap-4 pt-2">
              <label><input type="radio" checked={form.numTitulares === "1"} onChange={() => updateField("numTitulares", "1")} /> Un Titular (30%)</label>
              <label><input type="radio" checked={form.numTitulares === "2"} onChange={() => updateField("numTitulares", "2")} /> Dos Titulares (35%)</label>
            </div>
          </Field>
          <Field label="Porcentaje de Financiación (%)"><Input type="number" value={form.financiacionPct} onChange={(e) => updateField("financiacionPct", Number(e.target.value))} /></Field>
          <Field label="Precio Vivienda (€)"><Input type="number" value={form.housePrice || ""} onChange={(e) => updateField("housePrice", Number(e.target.value))} placeholder="Dejar en blanco para calcular automáticamente" /></Field>
          <Field label="Plazo del Préstamo (años)"><Input type="number" value={form.loanTerm} onChange={(e) => updateField("loanTerm", Number(e.target.value))} /></Field>
          <Field label="Tipo de Interés Anual (%)"><Input type="number" step="0.01" value={form.hipotecaInterestRate} onChange={(e) => updateField("hipotecaInterestRate", Number(e.target.value))} /></Field>
          <Field label="Ahorros Disponibles (€)"><Input type="number" value={form.availableSavings} onChange={(e) => updateField("availableSavings", Number(e.target.value))} /></Field>
          <Field label="Cuota Préstamo Personal Existente (€)"><Input type="number" value={form.existingLoanPayment} onChange={(e) => updateField("existingLoanPayment", Number(e.target.value))} /></Field>
          <Field label="ITP (%)"><Input type="number" step="0.1" value={form.itpPercentage} onChange={(e) => updateField("itpPercentage", Number(e.target.value))} /></Field>
          <Field label="Valor ITP (€)"><Input value={itpValue.toFixed(2)} readOnly /></Field>
          <Field label="Notaría (€)"><Input type="number" value={form.notaria} onChange={(e) => updateField("notaria", Number(e.target.value))} /></Field>
          <Field label="Registro (€)"><Input type="number" value={form.registro} onChange={(e) => updateField("registro", Number(e.target.value))} /></Field>
          <Field label="Gestoría (€)"><Input type="number" value={form.gestoria} onChange={(e) => updateField("gestoria", Number(e.target.value))} /></Field>
          <Field label="Tasación (€)"><Input type="number" value={form.tasacion} onChange={(e) => updateField("tasacion", Number(e.target.value))} /></Field>
          <Field label="Honorarios (€)"><Input type="number" value={form.honorariosGSCapital} onChange={(e) => updateField("honorariosGSCapital", Number(e.target.value))} /></Field>
        </div>
        <div className="mt-6"><PrimaryButton type="button" onClick={handleCalculate}>Calcular</PrimaryButton></div>
      </Panel>

      {result ? (
        <Panel title="Resultados">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <p>Ingresos: <strong>{formatCurrency(form.monthlyIncome)}</strong></p>
              <p>Capacidad máxima de pago: <strong className="text-blue-600">{formatCurrency(result.capacidadMaximaPago)}</strong></p>
              <p>Precio máximo vivienda: <strong>{formatCurrency(result.precioMaximoVivienda)}</strong></p>
              <p>Importe hipoteca: <strong>{formatCurrency(result.importeHipoteca)}</strong></p>
              <p>Cuota mensual: <strong className="text-blue-600">{formatCurrency(result.cuotaMensual)}</strong></p>
            </div>
            <div className="space-y-2 text-sm">
              <p>Ahorros necesarios: <strong>{formatCurrency(result.ahorrosNecesarios)}</strong></p>
              <p>Total gastos: <strong>{formatCurrency(result.totalGastos)}</strong></p>
              <p>ITP: <strong>{formatCurrency(result.itpValue)}</strong></p>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-700" dangerouslySetInnerHTML={{ __html: result.resumenHtml }} />
          <div className="mt-6 flex gap-3">
            <PrimaryButton type="button" onClick={handleSaveToClient}>Guardar Datos de Hipoteca al Cliente</PrimaryButton>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
