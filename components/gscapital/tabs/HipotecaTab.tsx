"use client";

import { useEffect, useMemo, useState } from "react";
import { useGSCapital } from "@/components/gscapital/GSCapitalContext";
import {
  Field,
  Input,
  Panel,
  PrimaryButton,
} from "@/components/gscapital/ui/Panel";
import { calculateMortgage } from "@/lib/gscapital/calculators/mortgage";
import { formatCurrency } from "@/lib/gscapital/format";
import { calculateItpPercentage } from "@/lib/gscapital/itp";
import type { Client, MortgageInput, MortgageResult } from "@/lib/gscapital/types";

const DEFAULT_INTEREST_RATE = 3;

function buildFormFromClient(client: Client | null): MortgageInput {
  const itpPercentage = calculateItpPercentage(client?.personalData?.age);
  return {
    clientName: client?.name ?? "",
    zone: client?.zone ?? "",
    monthlyIncome: client?.income ?? 2000,
    existingDebts: client?.debts ?? 0,
    availableSavings: client?.availableSavings ?? 0,
    housePrice: client?.housePrice ?? 0,
    numTitulares: (client?.numTitulares as "1" | "2") ?? "1",
    financiacionPct: Number(client?.financiacionPct ?? 90),
    loanTerm: client?.loanTerm ?? 30,
    hipotecaInterestRate: client?.hipotecaInterestRate || DEFAULT_INTEREST_RATE,
    existingLoanPayment: client?.existingLoanPayment ?? 0,
    itpPercentage: client?.itpPercentage ?? itpPercentage,
    notaria: client?.notaria ?? 600,
    registro: client?.registro ?? 400,
    gestoria: client?.gestoria ?? 300,
    tasacion: client?.tasacion ?? 350,
    honorariosGSCapital: client?.honorariosGSCapital ?? 0,
  };
}

export function HipotecaTab() {
  const { currentClient, updateClient, setActiveTab, setPendingLoanAmount } =
    useGSCapital();
  const [form, setForm] = useState<MortgageInput>(() =>
    buildFormFromClient(currentClient),
  );
  const [interestRateInput, setInterestRateInput] = useState(
    String(currentClient?.hipotecaInterestRate || DEFAULT_INTEREST_RATE),
  );
  const [result, setResult] = useState<MortgageResult | null>(null);

  useEffect(() => {
    const nextForm = buildFormFromClient(currentClient);
    setForm(nextForm);
    setInterestRateInput(
      String(currentClient?.hipotecaInterestRate || DEFAULT_INTEREST_RATE),
    );
    setResult(null);
  }, [currentClient?.id]);

  const autoItpPercentage = useMemo(
    () => calculateItpPercentage(currentClient?.personalData?.age),
    [currentClient?.personalData?.age],
  );

  useEffect(() => {
    setForm((prev) => ({ ...prev, itpPercentage: autoItpPercentage }));
  }, [autoItpPercentage]);

  const effectiveHousePrice = form.housePrice || result?.precioMaximoVivienda || 0;
  const itpValue = effectiveHousePrice * (form.itpPercentage / 100);
  const itpBonusNote =
    autoItpPercentage < 10
      ? "Bonificación joven (<35 años): ITP al 5%"
      : "ITP estándar: 10%";

  function updateField<K extends keyof MortgageInput>(key: K, value: MortgageInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function getInterestRate(): number {
    const parsed = parseFloat(interestRateInput.replace(",", "."));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_INTEREST_RATE;
  }

  function handleCalculate() {
    const interestRate = getInterestRate();
    const input = {
      ...form,
      hipotecaInterestRate: interestRate,
      housePrice: form.housePrice || 0,
    };
    const calculated = calculateMortgage(input);
    const nextHousePrice =
      !form.housePrice && calculated.precioMaximoVivienda > 0
        ? Math.round(calculated.precioMaximoVivienda)
        : form.housePrice;

    if (nextHousePrice !== form.housePrice) {
      updateField("housePrice", nextHousePrice);
    }
    setResult(calculated);

    if (currentClient) {
      void updateClient({
        ...currentClient,
        income: form.monthlyIncome,
        debts: form.existingDebts,
        numTitulares: form.numTitulares,
        financiacionPct: String(form.financiacionPct),
        housePrice: calculated.precioMaximoVivienda,
        loanTerm: form.loanTerm,
        hipotecaInterestRate: interestRate,
        availableSavings: form.availableSavings,
        existingLoanPayment: form.existingLoanPayment,
        itpPercentage: form.itpPercentage,
        itpValue: calculated.itpValue,
        notaria: form.notaria,
        registro: form.registro,
        gestoria: form.gestoria,
        tasacion: form.tasacion,
        honorariosGSCapital: form.honorariosGSCapital,
        mortgageAmount: calculated.importeHipoteca,
        monthlyPayment: calculated.cuotaMensual,
        zone: form.zone,
        mortgageSnapshot: {
          monthlyIncome: form.monthlyIncome,
          existingDebts: form.existingDebts,
          numTitulares: form.numTitulares,
          financiacionPct: form.financiacionPct,
          housePrice: calculated.precioMaximoVivienda,
          loanTerm: form.loanTerm,
          hipotecaInterestRate: interestRate,
          availableSavings: form.availableSavings,
          existingLoanPayment: form.existingLoanPayment,
          itpPercentage: form.itpPercentage,
          cuotaMensual: calculated.cuotaMensual,
          importeHipoteca: calculated.importeHipoteca,
          precioMaximoVivienda: calculated.precioMaximoVivienda,
          ahorrosNecesarios: calculated.ahorrosNecesarios,
          shortfall: calculated.shortfall,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    if (calculated.shortfall > 0) {
      const roundedAmount = Math.min(
        60000,
        Math.max(6000, Math.round(calculated.shortfall / 1000) * 1000),
      );
      setPendingLoanAmount(roundedAmount);
      setActiveTab("prestamo");
    }
  }

  async function handleSaveToClient() {
    if (!currentClient || !result) return;
    try {
      const interestRate = getInterestRate();
      await updateClient({
        ...currentClient,
        income: form.monthlyIncome,
        debts: form.existingDebts,
        numTitulares: form.numTitulares,
        financiacionPct: String(form.financiacionPct),
        housePrice: result.precioMaximoVivienda,
        loanTerm: form.loanTerm,
        hipotecaInterestRate: interestRate,
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
        mortgageSnapshot: {
          monthlyIncome: form.monthlyIncome,
          existingDebts: form.existingDebts,
          numTitulares: form.numTitulares,
          financiacionPct: form.financiacionPct,
          housePrice: result.precioMaximoVivienda,
          loanTerm: form.loanTerm,
          hipotecaInterestRate: interestRate,
          availableSavings: form.availableSavings,
          existingLoanPayment: form.existingLoanPayment,
          itpPercentage: form.itpPercentage,
          cuotaMensual: result.cuotaMensual,
          importeHipoteca: result.importeHipoteca,
          precioMaximoVivienda: result.precioMaximoVivienda,
          ahorrosNecesarios: result.ahorrosNecesarios,
          shortfall: result.shortfall,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch {
      alert("No se pudo guardar en Supabase.");
    }
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
          <Field label="Tipo de Interés Anual (%)">
            <Input
              type="text"
              inputMode="decimal"
              value={interestRateInput}
              onChange={(e) => setInterestRateInput(e.target.value)}
              placeholder="Ej: 3.5"
            />
          </Field>
          <Field label="Ahorros Disponibles (€)"><Input type="number" value={form.availableSavings} onChange={(e) => updateField("availableSavings", Number(e.target.value))} /></Field>
          <Field label="Cuota Préstamo Personal Existente (€)"><Input type="number" value={form.existingLoanPayment} onChange={(e) => updateField("existingLoanPayment", Number(e.target.value))} /></Field>
          <Field label="ITP (%)">
            <Input value={form.itpPercentage} readOnly />
            <p className="mt-1 text-xs text-gray-500">{itpBonusNote}</p>
          </Field>
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
              {result.shortfall > 0 ? (
                <p className="font-semibold text-amber-600">
                  Financiación adicional: {formatCurrency(result.shortfall)}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-700" dangerouslySetInnerHTML={{ __html: result.resumenHtml }} />
          {result.shortfall > 0 ? (
            <p className="mt-3 text-sm text-blue-600">
              Se ha redirigido al préstamo personal con el importe sugerido de {formatCurrency(result.shortfall)}.
            </p>
          ) : null}
          <div className="mt-6 flex gap-3">
            <PrimaryButton type="button" onClick={() => void handleSaveToClient()}>Guardar Datos de Hipoteca al Cliente</PrimaryButton>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
