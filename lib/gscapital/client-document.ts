import { jsPDF } from "jspdf";
import { AGENT_INFO } from "./constants";
import { formatCurrency } from "./format";
import {
  formatNumTitulares,
  getOperationDisplayName,
  getOwnersFromClient,
} from "./owners";
import type { Client } from "./types";

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  return y + 7;
}

function addLine(
  doc: jsPDF,
  label: string,
  value: string | number | undefined | null,
  y: number,
): number {
  if (value === undefined || value === null || value === "") return y;
  const text = `${label}: ${value}`;
  const lines = doc.splitTextToSize(text, 182);
  doc.text(lines, 14, y);
  return y + lines.length * 5 + 1;
}

export function buildClientSummaryText(client: Client): string {
  const ai = client.additionalInfo ?? {};
  const ms = client.mortgageSnapshot;
  const pl = client.personalLoan;
  const owners = getOwnersFromClient(client);
  const shortfall =
    ms?.shortfall ??
    (ms?.ahorrosNecesarios && ms.availableSavings !== undefined
      ? Math.max(0, ms.ahorrosNecesarios - ms.availableSavings)
      : 0);

  let doc = "";
  doc += `${AGENT_INFO.company.toUpperCase()} - INFORME DE OPERACION FINANCIERA\n\n`;
  doc += `Gestor: ${AGENT_INFO.name}\n`;
  doc += `Telefono: ${AGENT_INFO.phone}\n`;
  doc += `Email: ${AGENT_INFO.email}\n`;
  doc += `Web: ${AGENT_INFO.website}\n\n`;

  owners.forEach((owner, index) => {
    doc += `TITULAR ${index + 1}\n`;
    doc += `Nombre: ${owner.fullName ?? "-"}\n`;
    doc += `Edad: ${owner.age ?? "-"}\n`;
    doc += `Telefono: ${owner.phone ?? "-"}\n`;
    doc += `Email: ${owner.email ?? "-"}\n`;
    doc += `DNI/NIE: ${owner.dni ?? "-"}\n`;
    doc += `Nomina: ${formatCurrency(owner.payslips)}\n`;
    doc += `Ahorros: ${formatCurrency(owner.savings)}\n\n`;
  });

  doc += `OPERACION\n`;
  doc += `Copropietarios: ${formatNumTitulares(client.numTitulares)}\n`;
  doc += `Ingresos totales: ${formatCurrency(client.income)}\n`;
  doc += `Ahorros totales: ${formatCurrency(client.availableSavings)}\n`;
  doc += `Zona: ${ai.zonesOfInterest || client.zone || "-"}\n\n`;

  doc += `HIPOTECA\n`;
  doc += `Precio vivienda: ${formatCurrency(ms?.precioMaximoVivienda ?? client.housePrice)}\n`;
  doc += `Financiacion: ${client.financiacionPct ?? ms?.financiacionPct ?? "-"}%\n`;
  doc += `Importe hipoteca: ${formatCurrency(ms?.importeHipoteca ?? client.mortgageAmount)}\n`;
  doc += `Cuota mensual: ${formatCurrency(ms?.cuotaMensual ?? client.monthlyPayment)}\n`;
  doc += `Ahorros necesarios: ${formatCurrency(ms?.ahorrosNecesarios)}\n`;
  if (shortfall > 0) {
    doc += `Financiacion adicional sugerida: ${formatCurrency(shortfall)}\n`;
  }

  if (pl?.loanAmount) {
    doc += `\nPRESTAMO PERSONAL\n`;
    doc += `Importe: ${formatCurrency(pl.loanAmount)}\n`;
    doc += `Cuota mensual: ${formatCurrency(pl.cuotaMensual)}\n`;
  }

  doc += `\nGenerado el ${new Date().toLocaleDateString("es-ES")}\n`;
  return doc;
}

export function downloadClientSummary(client: Client): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(AGENT_INFO.company.toUpperCase(), 105, y, { align: "center" });
  y += 8;
  doc.setFontSize(11);
  doc.text("Informe de operacion financiera", 105, y, { align: "center" });
  y += 12;

  y = addSectionTitle(doc, "DATOS DEL GESTOR", y);
  y = addLine(doc, "Gestor", AGENT_INFO.name, y);
  y = addLine(doc, "Telefono", AGENT_INFO.phone, y);
  y = addLine(doc, "Email", AGENT_INFO.email, y);
  y = addLine(doc, "Web", AGENT_INFO.website, y);
  y += 4;

  const owners = getOwnersFromClient(client);
  owners.forEach((owner, index) => {
    if (y > 250) {
      doc.addPage();
      y = 18;
    }
    y = addSectionTitle(doc, `TITULAR ${index + 1}`, y);
    y = addLine(doc, "Nombre", owner.fullName, y);
    y = addLine(doc, "Edad", owner.age, y);
    y = addLine(doc, "Nacionalidad", owner.nationality, y);
    y = addLine(doc, "Telefono", owner.phone, y);
    y = addLine(doc, "Email", owner.email, y);
    y = addLine(doc, "DNI/NIE", owner.dni, y);
    y = addLine(doc, "Banco", owner.bank, y);
    y = addLine(doc, "Empresa", owner.company, y);
    y = addLine(doc, "Contrato", owner.contractType, y);
    y = addLine(doc, "Nomina mensual", formatCurrency(owner.payslips), y);
    y = addLine(doc, "Ahorros", formatCurrency(owner.savings), y);
    y = addLine(doc, "Prestamos (cuota)", formatCurrency(owner.loans), y);
    y += 3;
  });

  if (y > 240) {
    doc.addPage();
    y = 18;
  }

  const ai = client.additionalInfo ?? {};
  const ms = client.mortgageSnapshot;
  const pl = client.personalLoan;
  const shortfall =
    ms?.shortfall ??
    (ms?.ahorrosNecesarios && ms.availableSavings !== undefined
      ? Math.max(0, ms.ahorrosNecesarios - ms.availableSavings)
      : 0);

  y = addSectionTitle(doc, "OPERACION CONJUNTA", y);
  y = addLine(doc, "Copropietarios", formatNumTitulares(client.numTitulares), y);
  y = addLine(doc, "Nombre operacion", getOperationDisplayName(client), y);
  y = addLine(doc, "Ingresos totales", formatCurrency(client.income), y);
  y = addLine(doc, "Ahorros totales", formatCurrency(client.availableSavings), y);
  y = addLine(doc, "Deudas mensuales", formatCurrency(client.debts), y);
  y = addLine(doc, "Zona", ai.zonesOfInterest || client.zone, y);
  y = addLine(doc, "Estado", client.status, y);
  y += 4;

  y = addSectionTitle(doc, "CALCULO DE HIPOTECA", y);
  y = addLine(doc, "Precio vivienda", formatCurrency(ms?.precioMaximoVivienda ?? client.housePrice), y);
  y = addLine(
    doc,
    "Financiacion",
    `${client.financiacionPct ?? ms?.financiacionPct ?? "-"}%`,
    y,
  );
  y = addLine(doc, "Importe hipoteca", formatCurrency(ms?.importeHipoteca ?? client.mortgageAmount), y);
  y = addLine(doc, "Cuota mensual", formatCurrency(ms?.cuotaMensual ?? client.monthlyPayment), y);
  y = addLine(
    doc,
    "Plazo",
    ms?.loanTerm ? `${ms.loanTerm} anos` : client.loanTerm ? `${client.loanTerm} anos` : undefined,
    y,
  );
  y = addLine(
    doc,
    "Tipo interes",
    ms?.hipotecaInterestRate
      ? `${ms.hipotecaInterestRate}%`
      : client.hipotecaInterestRate
        ? `${client.hipotecaInterestRate}%`
        : undefined,
    y,
  );
  y = addLine(
    doc,
    "ITP",
    client.itpPercentage
      ? `${client.itpPercentage}% (${formatCurrency(client.itpValue)})`
      : undefined,
    y,
  );
  y = addLine(doc, "Ahorros necesarios", formatCurrency(ms?.ahorrosNecesarios), y);
  if (shortfall > 0) {
    y = addLine(doc, "Financiacion adicional sugerida", formatCurrency(shortfall), y);
  }
  y += 4;

  if (pl?.loanAmount) {
    y = addSectionTitle(doc, "PRESTAMO PERSONAL", y);
    y = addLine(doc, "Importe", formatCurrency(pl.loanAmount), y);
    y = addLine(doc, "Plazo", pl.loanTermYears ? `${pl.loanTermYears} anos` : undefined, y);
    y = addLine(doc, "Cuota mensual", formatCurrency(pl.cuotaMensual), y);
    y = addLine(doc, "Total adeudado", formatCurrency(pl.totalAdeudado), y);
    y += 4;
  }

  if (ai.observations) {
    y = addSectionTitle(doc, "OBSERVACIONES", y);
    const lines = doc.splitTextToSize(ai.observations, 182);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 4;
  }

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    `Documento generado el ${new Date().toLocaleDateString("es-ES")} — ${AGENT_INFO.name} | ${AGENT_INFO.phone} | ${AGENT_INFO.email}`,
    14,
    285,
  );

  const safeName = getOperationDisplayName(client)
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  doc.save(`livendia-${safeName || "cliente"}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
