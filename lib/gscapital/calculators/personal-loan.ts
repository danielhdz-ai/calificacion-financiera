import {
  DEFAULT_PERSONAL_LOAN_INTEREST_RATE,
  PERSONAL_LOAN_COMMISSION,
} from "../constants";
import type { PersonalLoanInput, PersonalLoanResult } from "../types";

export function calculatePersonalLoan(input: PersonalLoanInput): PersonalLoanResult {
  const usedInterestRate =
    input.tin > 0 ? input.tin / 100 : DEFAULT_PERSONAL_LOAN_INTEREST_RATE;
  const loanTermMonths = input.loanTermYears * 12;
  const comision = input.loanAmount * PERSONAL_LOAN_COMMISSION;
  const monthlyRate = usedInterestRate / 12;

  let cuotaMensual = 0;
  if (input.loanAmount > 0 && loanTermMonths > 0) {
    if (monthlyRate > 0) {
      cuotaMensual =
        (input.loanAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths))) /
        (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
    } else {
      cuotaMensual = input.loanAmount / loanTermMonths;
    }
  }

  const totalIntereses = cuotaMensual * loanTermMonths - input.loanAmount;
  const costeTotalCredito = totalIntereses + comision;
  const totalAdeudado = input.loanAmount + costeTotalCredito;

  return {
    usedInterestRate,
    comision,
    cuotaMensual,
    totalIntereses,
    costeTotalCredito,
    totalAdeudado,
  };
}
