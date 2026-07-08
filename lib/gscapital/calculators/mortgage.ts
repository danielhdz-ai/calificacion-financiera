import type { MortgageInput, MortgageResult } from "../types";
import { formatCurrency } from "../format";

/** Estimación orientativa de cuota mensual para cubrir el déficit de ahorros. */
function estimateShortfallLoanPayment(shortfall: number): number {
  if (shortfall <= 0) return 0;
  return Math.round(shortfall / 100);
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const porcentajePago = input.numTitulares === "1" ? 0.3 : 0.35;
  const currentInterestRate = input.hipotecaInterestRate / 100;
  const itpPercentage = input.itpPercentage / 100;

  const capacidadMaximaPago =
    input.monthlyIncome * porcentajePago -
    input.existingDebts -
    input.existingLoanPayment;

  let precioMaximoVivienda = input.housePrice;
  if (precioMaximoVivienda <= 0 && capacidadMaximaPago > 0) {
    const tasaMensualCalc = currentInterestRate / 12;
    const plazoPrestamoCalc = input.loanTerm * 12;
    if (tasaMensualCalc > 0) {
      const maxPrestamo =
        capacidadMaximaPago *
        ((1 - Math.pow(1 + tasaMensualCalc, -plazoPrestamoCalc)) / tasaMensualCalc);
      precioMaximoVivienda = maxPrestamo / (input.financiacionPct / 100);
    } else if (plazoPrestamoCalc > 0) {
      precioMaximoVivienda =
        (capacidadMaximaPago * plazoPrestamoCalc) / (input.financiacionPct / 100);
    } else {
      precioMaximoVivienda = 0;
    }
  }

  const itpValue = precioMaximoVivienda * itpPercentage;
  const importeHipoteca = precioMaximoVivienda * (input.financiacionPct / 100);
  const aportacionEntidad = precioMaximoVivienda - importeHipoteca;
  const totalGastos =
    itpValue +
    input.notaria +
    input.registro +
    input.gestoria +
    input.tasacion +
    input.honorariosGSCapital;
  const ahorrosNecesarios = aportacionEntidad + totalGastos;

  const tasaMensual = currentInterestRate / 12;
  const plazoPrestamo = input.loanTerm * 12;
  let cuotaMensual = 0;
  if (importeHipoteca > 0 && plazoPrestamo > 0) {
    if (tasaMensual > 0) {
      cuotaMensual =
        (importeHipoteca *
          (tasaMensual * Math.pow(1 + tasaMensual, plazoPrestamo))) /
        (Math.pow(1 + tasaMensual, plazoPrestamo) - 1);
    } else {
      cuotaMensual = importeHipoteca / plazoPrestamo;
    }
  }

  const shortfall =
    input.availableSavings > 0 && input.availableSavings < ahorrosNecesarios
      ? ahorrosNecesarios - input.availableSavings
      : input.availableSavings <= 0
        ? ahorrosNecesarios
        : 0;

  const existingLoanPayment = input.existingLoanPayment || 0;
  const suggestedPersonalLoanPayment = estimateShortfallLoanPayment(shortfall);
  const totalOperationCuota = cuotaMensual + suggestedPersonalLoanPayment;
  const totalCuotaMensual = totalOperationCuota + existingLoanPayment;

  let resumenHtml = `Para poder comprar una vivienda de <strong>${formatCurrency(precioMaximoVivienda)}</strong> necesitarás tener ahorrados <strong>${formatCurrency(ahorrosNecesarios)}</strong>. De esa cantidad, <strong>${formatCurrency(aportacionEntidad)}</strong> son aportación para la entidad financiera, ya que el banco financia <strong>${formatCurrency(importeHipoteca)}</strong> (<strong>${input.financiacionPct}%</strong>).`;

  resumenHtml += `<br><br>Los gastos de compraventa serán de <strong>${formatCurrency(totalGastos)}</strong> para gastos e impuestos.`;

  if (input.availableSavings > 0) {
    resumenHtml += ` Tú aportas de tus ahorros <strong>${formatCurrency(input.availableSavings)}</strong>.`;
  }

  if (shortfall > 0) {
    resumenHtml += ` La diferencia de <strong>${formatCurrency(shortfall)}</strong> habría que pedir un préstamo personal, o buscar alternativa.`;
  }

  resumenHtml += `<br><br>La cuota de hipoteca aproximadamente sería de <strong>${formatCurrency(cuotaMensual)}</strong>`;

  if (existingLoanPayment > 0) {
    resumenHtml += ` y el coste del préstamo personal existente <strong>${formatCurrency(existingLoanPayment)}</strong>`;
  }

  if (shortfall > 0 && suggestedPersonalLoanPayment > 0) {
    resumenHtml += `, con un préstamo personal adicional estimado de <strong>${formatCurrency(suggestedPersonalLoanPayment)}</strong>`;
    resumenHtml += `, total de la operación de <strong>${formatCurrency(totalOperationCuota)}</strong>`;
  }

  resumenHtml += ".";

  if (existingLoanPayment > 0 && (shortfall > 0 || cuotaMensual > 0)) {
    resumenHtml += ` Incluyendo el préstamo personal existente, el total mensual sería de <strong>${formatCurrency(totalCuotaMensual)}</strong>.`;
  }

  return {
    porcentajePago,
    capacidadMaximaPago,
    precioMaximoVivienda,
    importeHipoteca,
    aportacionEntidad,
    ahorrosNecesarios,
    cuotaMensual,
    itpValue,
    totalGastos,
    shortfall,
    existingLoanPayment,
    suggestedPersonalLoanPayment,
    totalOperationCuota,
    totalCuotaMensual,
    resumenHtml,
  };
}
