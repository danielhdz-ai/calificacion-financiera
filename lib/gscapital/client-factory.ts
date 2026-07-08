import { createId } from "./format";
import { emptyOwner } from "./owners";
import type { OwnerCount } from "./owners";
import type { Client } from "./types";

export function createEmptyClient(name: string, ownerCount: OwnerCount = 1): Client {
  const owners = Array.from({ length: ownerCount }, (_, index) =>
    index === 0
      ? emptyOwner({
          fullName: name.trim(),
          payslips: "2000",
          savings: "0",
          loans: "0",
          contractType: "",
          seniority: "",
        })
      : emptyOwner(),
  );

  return {
    id: createId(),
    name: name.trim(),
    zone: "",
    income: 2000,
    debts: 0,
    availableSavings: 0,
    housePrice: 0,
    numTitulares: String(ownerCount),
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
    owners,
    personalData: owners[0],
    additionalInfo: {
      propertyValue: "",
      zonesOfInterest: "",
      maritalStatus: "",
    },
    pdfData: null,
    pdfName: null,
  };
}
