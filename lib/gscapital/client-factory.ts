import { createId } from "./format";
import type { Client } from "./types";

export function createEmptyClient(name: string): Client {
  return {
    id: createId(),
    name: name.trim(),
    zone: "",
    income: 2000,
    debts: 0,
    availableSavings: 0,
    housePrice: 0,
    numTitulares: "1",
    financiacionPct: "90",
    mortgageAmount: 0,
    monthlyPayment: 0,
    hipotecaInterestRate: 3,
    itpPercentage: 10,
    itpValue: 0,
    notaria: 600,
    registro: 400,
    gestoria: 300,
    tasacion: 350,
    honorariosGSCapital: 0,
    loanTerm: 30,
    existingLoanPayment: 0,
    status: "pendiente",
    owners: [
      {
        fullName: name.trim(),
        payslips: "2000",
        savings: "0",
        loans: "0",
        contractType: "",
        seniority: "",
      },
    ],
    personalData: {
      fullName: name.trim(),
      payslips: "2000",
      savings: "0",
      loans: "0",
      contractType: "",
      seniority: "",
    },
    additionalInfo: {
      propertyValue: "0",
      zonesOfInterest: "",
      maritalStatus: "",
    },
    pdfData: null,
    pdfName: null,
  };
}
