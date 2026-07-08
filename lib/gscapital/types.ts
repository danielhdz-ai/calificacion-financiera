export type ClientStatus =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "activo"
  | "noactivo";

export type PersonalData = {
  fullName?: string;
  age?: string;
  nationality?: string;
  phone?: string;
  dni?: string;
  bank?: string;
  email?: string;
  company?: string;
  contractType?: string;
  seniority?: string;
  payslips?: string | number;
  savings?: string | number;
  loans?: string | number;
};

export type OwnerData = PersonalData;

export type AdditionalInfo = {
  children?: string;
  properties?: string;
  rental?: string;
  maritalStatus?: string;
  propertyValue?: string | number;
  zonesOfInterest?: string;
  observations?: string;
};

export type Client = {
  id: string;
  name: string;
  zone?: string;
  income: number;
  debts: number;
  availableSavings?: number;
  housePrice?: number;
  numTitulares?: string;
  financiacionPct?: string;
  mortgageAmount?: number;
  monthlyPayment?: number;
  hipotecaInterestRate?: number;
  itpPercentage?: number;
  itpValue?: number;
  notaria?: number;
  registro?: number;
  gestoria?: number;
  tasacion?: number;
  honorariosGSCapital?: number;
  loanTerm?: number;
  existingLoanPayment?: number;
  status: ClientStatus;
  owners?: OwnerData[];
  personalData?: PersonalData;
  additionalInfo?: AdditionalInfo;
  pdfData?: string | null;
  pdfName?: string | null;
  personalLoan?: PersonalLoanSnapshot;
  mortgageSnapshot?: MortgageSnapshot;
};

export type PersonalLoanSnapshot = {
  purpose?: string;
  loanAmount?: number;
  loanTermYears?: number;
  tin?: number;
  tae?: number;
  cuotaMensual?: number;
  totalAdeudado?: number;
  costeTotalCredito?: number;
  updatedAt?: string;
};

export type MortgageSnapshot = {
  monthlyIncome?: number;
  existingDebts?: number;
  numTitulares?: string;
  financiacionPct?: number;
  housePrice?: number;
  loanTerm?: number;
  hipotecaInterestRate?: number;
  availableSavings?: number;
  existingLoanPayment?: number;
  itpPercentage?: number;
  cuotaMensual?: number;
  importeHipoteca?: number;
  precioMaximoVivienda?: number;
  ahorrosNecesarios?: number;
  shortfall?: number;
  suggestedPersonalLoanPayment?: number;
  totalOperationCuota?: number;
  totalCuotaMensual?: number;
  updatedAt?: string;
};

export type Collaborator = {
  id: string;
  bank: string;
  name: string;
  phone?: string;
  email?: string;
  office?: string;
  conditions?: string;
};

export type Tasador = {
  id: string;
  empresa: string;
  name: string;
  phone?: string;
  email?: string;
  zona?: string;
  notas?: string;
};

export type Inmobiliario = {
  id: string;
  inmobiliaria: string;
  name: string;
  phone?: string;
  email?: string;
  zona?: string;
  notas?: string;
};

export type Notaria = {
  id: string;
  notaria: string;
  name: string;
  phone?: string;
  email?: string;
  zona?: string;
  notas?: string;
};

export type TabId =
  | "asesoramiento"
  | "hipoteca"
  | "prestamo"
  | "database"
  | "colaboradores"
  | "inmobiliarios"
  | "notarias"
  | "tasadores"
  | "configuracion";

export type MortgageInput = {
  clientName: string;
  zone: string;
  monthlyIncome: number;
  existingDebts: number;
  numTitulares: "1" | "2" | "3";
  financiacionPct: number;
  housePrice: number;
  loanTerm: number;
  hipotecaInterestRate: number;
  availableSavings: number;
  existingLoanPayment: number;
  itpPercentage: number;
  notaria: number;
  registro: number;
  gestoria: number;
  tasacion: number;
  honorariosGSCapital: number;
};

export type MortgageResult = {
  porcentajePago: number;
  capacidadMaximaPago: number;
  precioMaximoVivienda: number;
  importeHipoteca: number;
  aportacionEntidad: number;
  ahorrosNecesarios: number;
  cuotaMensual: number;
  itpValue: number;
  totalGastos: number;
  shortfall: number;
  existingLoanPayment: number;
  suggestedPersonalLoanPayment: number;
  totalOperationCuota: number;
  totalCuotaMensual: number;
  resumenHtml: string;
};

export type PersonalLoanInput = {
  loanAmount: number;
  loanTermYears: number;
  tin: number;
  tae: number;
};

export type PersonalLoanResult = {
  usedInterestRate: number;
  comision: number;
  cuotaMensual: number;
  totalIntereses: number;
  costeTotalCredito: number;
  totalAdeudado: number;
};
