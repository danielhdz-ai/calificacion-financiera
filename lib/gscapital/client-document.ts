import { AGENT_INFO } from "./constants";
import { formatCurrency } from "./format";
import type { Client } from "./types";

function line(label: string, value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "";
  return `${label}: ${value}\n`;
}

export function buildClientSummaryText(client: Client): string {
  const pd = client.personalData ?? {};
  const ai = client.additionalInfo ?? {};
  const ms = client.mortgageSnapshot;
  const pl = client.personalLoan;
  const shortfall =
    ms?.ahorrosNecesarios && ms.availableSavings !== undefined
      ? Math.max(0, ms.ahorrosNecesarios - ms.availableSavings)
      : client.availableSavings && ms?.ahorrosNecesarios
        ? Math.max(0, ms.ahorrosNecesarios - client.availableSavings)
        : 0;

  let doc = "";
  doc += "══════════════════════════════════════════\n";
  doc += `           ${AGENT_INFO.company.toUpperCase()}\n`;
  doc += "       INFORME DE OPERACIÓN FINANCIERA\n";
  doc += "══════════════════════════════════════════\n\n";

  doc += "DATOS DEL GESTOR\n";
  doc += line("Gestor", AGENT_INFO.name);
  doc += line("Teléfono", AGENT_INFO.phone);
  doc += line("Email", AGENT_INFO.email);
  doc += line("Web", AGENT_INFO.website);
  doc += "\n";

  doc += "DATOS DEL CLIENTE\n";
  doc += line("Nombre", pd.fullName || client.name);
  doc += line("Edad", pd.age);
  doc += line("Teléfono", pd.phone);
  doc += line("Email", pd.email);
  doc += line("DNI/NIE", pd.dni);
  doc += line("Zona de interés", ai.zonesOfInterest || client.zone);
  doc += line("Ingresos mensuales", formatCurrency(client.income));
  doc += line("Ahorros disponibles", formatCurrency(client.availableSavings ?? pd.savings));
  doc += line("Deudas mensuales", formatCurrency(client.debts));
  doc += line("Estado", client.status);
  doc += "\n";

  doc += "CÁLCULO DE HIPOTECA\n";
  doc += line("Precio vivienda", formatCurrency(ms?.precioMaximoVivienda ?? client.housePrice));
  doc += line("Financiación", ms?.financiacionPct ? `${ms.financiacionPct}%` : client.financiacionPct ? `${client.financiacionPct}%` : undefined);
  doc += line("Importe hipoteca", formatCurrency(ms?.importeHipoteca ?? client.mortgageAmount));
  doc += line("Cuota mensual", formatCurrency(ms?.cuotaMensual ?? client.monthlyPayment));
  doc += line("Plazo", ms?.loanTerm ? `${ms.loanTerm} años` : client.loanTerm ? `${client.loanTerm} años` : undefined);
  doc += line("Tipo interés", ms?.hipotecaInterestRate ? `${ms.hipotecaInterestRate}%` : client.hipotecaInterestRate ? `${client.hipotecaInterestRate}%` : undefined);
  doc += line("ITP", client.itpPercentage ? `${client.itpPercentage}% (${formatCurrency(client.itpValue)})` : undefined);
  doc += line("Ahorros necesarios", formatCurrency(ms?.ahorrosNecesarios));
  if (shortfall > 0) {
    doc += line("Financiación adicional sugerida", formatCurrency(shortfall));
  }
  doc += "\n";

  if (pl?.loanAmount) {
    doc += "PRÉSTAMO PERSONAL SIMULADO\n";
    doc += line("Importe", formatCurrency(pl.loanAmount));
    doc += line("Plazo", pl.loanTermYears ? `${pl.loanTermYears} años` : undefined);
    doc += line("Cuota mensual", formatCurrency(pl.cuotaMensual));
    doc += line("Total adeudado", formatCurrency(pl.totalAdeudado));
    doc += "\n";
  }

  if (ai.observations) {
    doc += "OBSERVACIONES\n";
    doc += `${ai.observations}\n\n`;
  }

  doc += "──────────────────────────────────────────\n";
  doc += `Documento generado el ${new Date().toLocaleDateString("es-ES")}\n`;
  doc += `${AGENT_INFO.name} | ${AGENT_INFO.phone} | ${AGENT_INFO.email}\n`;

  return doc;
}

export function downloadClientSummary(client: Client): void {
  const content = buildClientSummaryText(client);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = (client.name || "cliente").replace(/[^\w\s-]/g, "").trim();
  link.href = url;
  link.download = `livendia-${safeName}-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
