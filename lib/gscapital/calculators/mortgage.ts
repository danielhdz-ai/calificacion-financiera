import type { MortgageInput, MortgageResult } from "../types";
import { formatCurrency } from "../format";

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
  const totalGastos =
    itpValue +
    input.notaria +
    input.registro +
    input.gestoria +
    input.tasacion +
    input.honorariosGSCapital;
  const ahorrosNecesarios = precioMaximoVivienda - importeHipoteca + totalGastos;

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

  let resumenHtml = `Para poder comprar una vivienda de <strong>${formatCurrency(precioMaximoVivienda)}</strong> necesitarás tener ahorrados <strong>${formatCurrency(ahorrosNecesarios)}</strong>. De esa cantidad, <strong>${formatCurrency(precioMaximoVivienda - importeHipoteca)}</strong> son aportación para la entidad financiera y <strong>${formatCurrency(totalGastos)}</strong> para gastos e impuestos.`;

  if (input.availableSavings > 0) {
    resumenHtml += ` Tú aportas de tus ahorros <strong>${formatCurrency(input.availableSavings)}</strong>.`;
    if (input.availableSavings < ahorrosNecesarios) {
      const shortfall = ahorrosNecesarios - input.availableSavings;
      if (shortfall > 0) {
        resumenHtml += ` La diferencia de <strong>${formatCurrency(shortfall)}</strong> podría necesitar financiación adicional.`;
      }
    }
  }

  resumenHtml += ` La cuota mensual estimada sería de <strong>${formatCurrency(cuotaMensual)}</strong> y el banco financia <strong>${formatCurrency(importeHipoteca)}</strong> (<strong>${input.financiacionPct}%</strong>).`;

  return {
    porcentajePago,
    capacidadMaximaPago,
    precioMaximoVivienda,
    importeHipoteca,
    ahorrosNecesarios,
    cuotaMensual,
    itpValue,
    totalGastos,
    resumenHtml,
  };
}
