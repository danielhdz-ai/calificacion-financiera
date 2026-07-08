"use client";

import { useEffect, useMemo, useState } from "react";
import { useGSCapital } from "@/components/gscapital/GSCapitalContext";
import {
  Field,
  Input,
  OptionalNumberInput,
  Panel,
  PrimaryButton,
  SecondaryButton,
} from "@/components/gscapital/ui/Panel";
import { calculateMortgage } from "@/lib/gscapital/calculators/mortgage";
import { formatCurrency, parsePositiveNumber } from "@/lib/gscapital/format";
import { calculateItpPercentage } from "@/lib/gscapital/itp";
import { getOwnersAgesString, getOwnerCount } from "@/lib/gscapital/owners";
import type { Client, MortgageInput, MortgageResult } from "@/lib/gscapital/types";

const DEFAULT_INTEREST_RATE = 3;

function buildFormFromClient(client: Client | null): MortgageInput {
  const suggestedItp = client
    ? calculateItpPercentage(getOwnersAgesString(client))
    : 10;
  const propertyTarget = parsePositiveNumber(client?.additionalInfo?.propertyValue);
  const savedHousePrice = parsePositiveNumber(client?.housePrice);
  const housePrice = savedHousePrice || propertyTarget || 0;

  return {
    clientName: client?.name ?? "",
    zone: client?.zone ?? "",
    monthlyIncome: client?.income ?? 2000,
    existingDebts: client?.debts ?? 0,
    availableSavings: client?.availableSavings ?? 0,
    housePrice,
    numTitulares: (client?.numTitulares as "1" | "2" | "3") ?? String(getOwnerCount(client)) as "1" | "2" | "3",
    financiacionPct: Number(client?.financiacionPct ?? 90),
    loanTerm: client?.loanTerm ?? 30,
    hipotecaInterestRate: client?.hipotecaInterestRate || DEFAULT_INTEREST_RATE,
    existingLoanPayment: client?.existingLoanPayment ?? 0,
    itpPercentage: client?.itpPercentage ?? suggestedItp,
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
    () =>
      currentClient
        ? calculateItpPercentage(getOwnersAgesString(currentClient))
        : 10,
    [currentClient],
  );

  const itpBonusNote =
    autoItpPercentage < 10
      ? `Sugerido por edad: ${autoItpPercentage}% (bonificación joven). Puedes modificarlo manualmente.`
      : `Sugerido por edad: ${autoItpPercentage}% (ITP estándar). Puedes modificarlo manualmente.`;

  function updateField<K extends keyof MortgageInput>(key: K, value: MortgageInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function getInterestRate(): number {
    const parsed = parseFloat(interestRateInput.replace(",", "."));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_INTEREST_RATE;
  }

  const previewResult = useMemo(() => {
    return calculateMortgage({
      ...form,
      monthlyIncome: form.monthlyIncome || 2000,
      itpPercentage: form.itpPercentage || autoItpPercentage,
      hipotecaInterestRate: getInterestRate(),
      housePrice: form.housePrice || 0,
    });
  }, [form, interestRateInput, autoItpPercentage]);

  const estimatedValuation = previewResult.precioMaximoVivienda;
  const effectiveHousePrice =
    form.housePrice ||
    result?.precioMaximoVivienda ||
    estimatedValuation ||
    0;
  const itpValue =
    result?.itpValue ?? effectiveHousePrice * (form.itpPercentage / 100);
  const showingEstimatedPrice = !form.housePrice && estimatedValuation > 0;

  function handleCalculate() {
    const interestRate = getInterestRate();
    const input = {
      ...form,
      monthlyIncome: form.monthlyIncome || 2000,
      itpPercentage: form.itpPercentage || autoItpPercentage,
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
          suggestedPersonalLoanPayment: calculated.suggestedPersonalLoanPayment,
          totalOperationCuota: calculated.totalOperationCuota,
          totalCuotaMensual: calculated.totalCuotaMensual,
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
          suggestedPersonalLoanPayment: result.suggestedPersonalLoanPayment,
          totalOperationCuota: result.totalOperationCuota,
          totalCuotaMensual: result.totalCuotaMensual,
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
          <Field label="Ingresos Mensuales Netos (€)"><OptionalNumberInput value={form.monthlyIncome} onChange={(v) => updateField("monthlyIncome", v)} placeholder="Ej: 3300" /></Field>
          <Field label="Deudas Mensuales Existentes (€)"><OptionalNumberInput value={form.existingDebts} onChange={(v) => updateField("existingDebts", v)} placeholder="Opcional" /></Field>
          <Field label="Número de Titulares">
            <div className="flex flex-wrap gap-4 pt-2">
              <label><input type="radio" checked={form.numTitulares === "1"} onChange={() => updateField("numTitulares", "1")} /> Un Titular (30%)</label>
              <label><input type="radio" checked={form.numTitulares === "2"} onChange={() => updateField("numTitulares", "2")} /> Dos Titulares (35%)</label>
              <label><input type="radio" checked={form.numTitulares === "3"} onChange={() => updateField("numTitulares", "3")} /> Tres Titulares (35%)</label>
            </div>
          </Field>
          <Field label="Porcentaje de Financiación (%)"><Input type="number" value={form.financiacionPct} onChange={(e) => updateField("financiacionPct", Number(e.target.value))} /></Field>
          <Field label="Precio Vivienda / Valoración (€)">
            <OptionalNumberInput
              value={form.housePrice}
              onChange={(v) => updateField("housePrice", v)}
              placeholder={
                showingEstimatedPrice
                  ? `Estimado: ${formatCurrency(estimatedValuation)}`
                  : "Dejar vacío para estimar según ingresos"
              }
            />
            {showingEstimatedPrice ? (
              <p className="mt-1 text-xs text-blue-500">
                Valoración estimada: {formatCurrency(estimatedValuation)} · ITP estimado: {formatCurrency(itpValue)}
              </p>
            ) : null}
          </Field>
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
          <Field label="Ahorros Disponibles (€)"><OptionalNumberInput value={form.availableSavings} onChange={(v) => updateField("availableSavings", v)} placeholder="Opcional" /></Field>
          <Field label="Cuota Préstamo Personal Existente (€)"><OptionalNumberInput value={form.existingLoanPayment} onChange={(v) => updateField("existingLoanPayment", v)} placeholder="Opcional" /></Field>
          <Field label="ITP (%)">
            <OptionalNumberInput
              value={form.itpPercentage}
              onChange={(v) => updateField("itpPercentage", v)}
              placeholder={String(autoItpPercentage)}
            />
            <p className="mt-1 text-xs text-gray-500">{itpBonusNote}</p>
          </Field>
          <Field label="Valor ITP (€)"><Input value={itpValue > 0 ? itpValue.toFixed(2) : ""} readOnly placeholder="Se calcula automáticamente" /></Field>
          <Field label="Notaría (€)"><OptionalNumberInput value={form.notaria} onChange={(v) => updateField("notaria", v)} placeholder="Ej: 600" /></Field>
          <Field label="Registro (€)"><OptionalNumberInput value={form.registro} onChange={(v) => updateField("registro", v)} placeholder="Ej: 400" /></Field>
          <Field label="Gestoría (€)"><OptionalNumberInput value={form.gestoria} onChange={(v) => updateField("gestoria", v)} placeholder="Ej: 300" /></Field>
          <Field label="Tasación (€)"><OptionalNumberInput value={form.tasacion} onChange={(v) => updateField("tasacion", v)} placeholder="Ej: 350" /></Field>
          <Field label="Honorarios (€)"><OptionalNumberInput value={form.honorariosGSCapital} onChange={(v) => updateField("honorariosGSCapital", v)} placeholder="Opcional" /></Field>
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
              {!form.housePrice && result.precioMaximoVivienda > 0 ? (
                <p className="text-xs text-blue-500">
                  Valoración estimada aplicada según capacidad de pago.
                </p>
              ) : null}
              <p>Importe hipoteca: <strong>{formatCurrency(result.importeHipoteca)}</strong></p>
              <p>Cuota hipoteca: <strong className="text-blue-600">{formatCurrency(result.cuotaMensual)}</strong></p>
              {result.existingLoanPayment > 0 ? (
                <p>Préstamo personal existente: <strong>{formatCurrency(result.existingLoanPayment)}</strong></p>
              ) : null}
              {result.suggestedPersonalLoanPayment > 0 ? (
                <p>Préstamo personal adicional (estimado): <strong className="text-amber-600">{formatCurrency(result.suggestedPersonalLoanPayment)}</strong></p>
              ) : null}
              {(result.totalOperationCuota > result.cuotaMensual || result.totalCuotaMensual > result.cuotaMensual) ? (
                <p className="border-t border-gray-200 pt-2 dark:border-gray-600">
                  Total cuota mensual: <strong className="text-blue-600">{formatCurrency(result.totalCuotaMensual || result.totalOperationCuota)}</strong>
                </p>
              ) : null}
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
            <p className="mt-3 text-sm text-amber-600">
              Financiación adicional sugerida: {formatCurrency(result.shortfall)}.
              Puedes ir manualmente a Préstamo Personal para simularla.
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryButton type="button" onClick={() => void handleSaveToClient()}>Guardar Datos de Hipoteca al Cliente</PrimaryButton>
            {result.shortfall > 0 ? (
              <SecondaryButton
                type="button"
                onClick={() => {
                  const roundedAmount = Math.min(
                    60000,
                    Math.max(6000, Math.round(result.shortfall / 1000) * 1000),
                  );
                  setPendingLoanAmount(roundedAmount);
                  setActiveTab("prestamo");
                }}
              >
                Ir a Préstamo Personal
              </SecondaryButton>
            ) : null}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
