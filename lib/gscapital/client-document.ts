import { jsPDF } from "jspdf";
import { AGENT_INFO } from "./constants";
import { formatCurrency } from "./format";
import {
  formatNumTitulares,
  getOperationDisplayName,
  getOwnersFromClient,
} from "./owners";
import type { Client } from "./types";

const BRAND = {
  primary: [23, 47, 84] as [number, number, number],
  accent: [37, 99, 235] as [number, number, number],
  light: [243, 246, 252] as [number, number, number],
  text: [30, 41, 59] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

const PAGE_BOTTOM = 282;
const MARGIN_LEFT = 14;
const MARGIN_RIGHT = 196;
const VALUE_X = 108;

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch("/logo.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function setTextColor(doc: jsPDF, color: [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setFillColor(doc: jsPDF, color: [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function ensureSpace(doc: jsPDF, y: number, needed: number, pageCount: { n: number }): number {
  if (y + needed <= PAGE_BOTTOM) return y;
  doc.addPage();
  pageCount.n += 1;
  drawPageFooter(doc, pageCount.n);
  return 24;
}

function drawPageFooter(doc: jsPDF, pageNumber: number) {
  setFillColor(doc, BRAND.light);
  doc.rect(0, 287, 210, 10, "F");
  setTextColor(doc, BRAND.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `${AGENT_INFO.company} · ${AGENT_INFO.name} · ${AGENT_INFO.phone} · ${AGENT_INFO.email}`,
    105,
    292,
    { align: "center" },
  );
  doc.text(`Página ${pageNumber}`, MARGIN_RIGHT, 292, { align: "right" });
}

function drawDocumentHeader(
  doc: jsPDF,
  client: Client,
  logoDataUrl: string | null,
): number {
  setFillColor(doc, BRAND.primary);
  doc.rect(0, 0, 210, 42, "F");

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", MARGIN_LEFT, 6, 22, 22);
  } else {
    setFillColor(doc, BRAND.white);
    doc.circle(MARGIN_LEFT + 11, 17, 10, "F");
    setTextColor(doc, BRAND.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("L", MARGIN_LEFT + 11, 20, { align: "center" });
  }

  setTextColor(doc, BRAND.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(AGENT_INFO.company, MARGIN_LEFT + 28, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Informe de Calificación Financiera", MARGIN_LEFT + 28, 21);
  doc.setFontSize(9);
  doc.text(getOperationDisplayName(client), MARGIN_LEFT + 28, 28);

  const dateStr = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(dateStr, MARGIN_RIGHT, 14, { align: "right" });
  doc.text(`Estado: ${client.status}`, MARGIN_RIGHT, 21, { align: "right" });
  if (client.zone || client.additionalInfo?.zonesOfInterest) {
    doc.text(
      `Zona: ${client.additionalInfo?.zonesOfInterest || client.zone}`,
      MARGIN_RIGHT,
      28,
      { align: "right" },
    );
  }

  return 52;
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  setFillColor(doc, BRAND.accent);
  doc.rect(MARGIN_LEFT, y - 4.5, 2.5, 8, "F");
  setTextColor(doc, BRAND.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(title, MARGIN_LEFT + 5, y);
  setFillColor(doc, BRAND.light);
  doc.rect(MARGIN_LEFT, y + 2, MARGIN_RIGHT - MARGIN_LEFT, 0.4, "F");
  return y + 10;
}

function drawKeyValue(
  doc: jsPDF,
  label: string,
  value: string | number | undefined | null,
  y: number,
  options?: { bold?: boolean; highlight?: boolean },
): number {
  if (value === undefined || value === null || value === "") return y;

  if (options?.highlight) {
    setFillColor(doc, BRAND.light);
    doc.rect(MARGIN_LEFT, y - 4.5, MARGIN_RIGHT - MARGIN_LEFT, 7.5, "F");
  }

  setTextColor(doc, BRAND.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(label, MARGIN_LEFT + 2, y);

  setTextColor(doc, BRAND.text);
  doc.setFont("helvetica", options?.bold ? "bold" : "normal");
  doc.setFontSize(9.5);
  const valueText = String(value);
  const lines = doc.splitTextToSize(valueText, MARGIN_RIGHT - VALUE_X);
  doc.text(lines, VALUE_X, y);

  return y + Math.max(6, lines.length * 5);
}

function drawSummaryBox(
  doc: jsPDF,
  items: { label: string; value: string; accent?: boolean }[],
  y: number,
): number {
  const boxHeight = 8 + items.length * 9;
  setFillColor(doc, BRAND.light);
  doc.roundedRect(MARGIN_LEFT, y, MARGIN_RIGHT - MARGIN_LEFT, boxHeight, 2, 2, "F");
  setDrawColor(doc, BRAND.accent);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN_LEFT, y, MARGIN_RIGHT - MARGIN_LEFT, boxHeight, 2, 2, "S");

  let innerY = y + 8;
  items.forEach((item) => {
    setTextColor(doc, BRAND.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(item.label, MARGIN_LEFT + 4, innerY);
    setTextColor(doc, item.accent ? BRAND.accent : BRAND.text);
    doc.setFont("helvetica", item.accent ? "bold" : "normal");
    doc.setFontSize(item.accent ? 11 : 9.5);
    doc.text(item.value, MARGIN_RIGHT - 4, innerY, { align: "right" });
    innerY += 9;
  });

  return y + boxHeight + 8;
}

function setDrawColor(doc: jsPDF, color: [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function formatStatus(status?: string): string {
  const map: Record<string, string> = {
    pendiente: "Pendiente",
    aprobado: "Aprobado",
    rechazado: "Rechazado",
    activo: "Activo",
    noactivo: "No activo",
  };
  return map[status ?? ""] ?? status ?? "-";
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
  doc += `${AGENT_INFO.company.toUpperCase()} - INFORME DE CALIFICACIÓN FINANCIERA\n\n`;
  doc += `Gestor: ${AGENT_INFO.name}\n`;
  doc += `Teléfono: ${AGENT_INFO.phone}\n`;
  doc += `Email: ${AGENT_INFO.email}\n`;
  doc += `Web: ${AGENT_INFO.website}\n\n`;

  owners.forEach((owner, index) => {
    doc += `TITULAR ${index + 1}\n`;
    doc += `Nombre: ${owner.fullName ?? "-"}\n`;
    doc += `Edad: ${owner.age ?? "-"}\n`;
    doc += `Teléfono: ${owner.phone ?? "-"}\n`;
    doc += `Email: ${owner.email ?? "-"}\n`;
    doc += `DNI/NIE: ${owner.dni ?? "-"}\n`;
    doc += `Nómina: ${formatCurrency(owner.payslips)}\n`;
    doc += `Ahorros: ${formatCurrency(owner.savings)}\n\n`;
  });

  doc += `OPERACIÓN\n`;
  doc += `Copropietarios: ${formatNumTitulares(client.numTitulares)}\n`;
  doc += `Ingresos totales: ${formatCurrency(client.income)}\n`;
  doc += `Ahorros totales: ${formatCurrency(client.availableSavings)}\n`;
  doc += `Zona: ${ai.zonesOfInterest || client.zone || "-"}\n\n`;

  doc += `HIPOTECA\n`;
  doc += `Precio vivienda: ${formatCurrency(ms?.precioMaximoVivienda ?? client.housePrice)}\n`;
  doc += `Financiación: ${client.financiacionPct ?? ms?.financiacionPct ?? "-"}%\n`;
  doc += `Importe hipoteca: ${formatCurrency(ms?.importeHipoteca ?? client.mortgageAmount)}\n`;
  doc += `Cuota mensual: ${formatCurrency(ms?.cuotaMensual ?? client.monthlyPayment)}\n`;
  doc += `Ahorros necesarios: ${formatCurrency(ms?.ahorrosNecesarios)}\n`;
  if (shortfall > 0) {
    doc += `Financiación adicional sugerida: ${formatCurrency(shortfall)}\n`;
  }

  if (pl?.loanAmount) {
    doc += `\nPRÉSTAMO PERSONAL\n`;
    doc += `Importe: ${formatCurrency(pl.loanAmount)}\n`;
    doc += `Cuota mensual: ${formatCurrency(pl.cuotaMensual)}\n`;
  }

  doc += `\nGenerado el ${new Date().toLocaleDateString("es-ES")}\n`;
  return doc;
}

export async function downloadClientSummary(client: Client): Promise<void> {
  const logoDataUrl = await loadLogoDataUrl();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageCount = { n: 1 };
  let y = drawDocumentHeader(doc, client, logoDataUrl);

  const ai = client.additionalInfo ?? {};
  const ms = client.mortgageSnapshot;
  const pl = client.personalLoan;
  const owners = getOwnersFromClient(client);
  const shortfall =
    ms?.shortfall ??
    (ms?.ahorrosNecesarios && ms.availableSavings !== undefined
      ? Math.max(0, ms.ahorrosNecesarios - ms.availableSavings)
      : 0);

  y = ensureSpace(doc, y, 30, pageCount);
  y = drawSectionTitle(doc, "DATOS DEL GESTOR", y);
  y = drawKeyValue(doc, "Gestor financiero", AGENT_INFO.name, y);
  y = drawKeyValue(doc, "Teléfono", AGENT_INFO.phone, y);
  y = drawKeyValue(doc, "Email", AGENT_INFO.email, y);
  y = drawKeyValue(doc, "Web", AGENT_INFO.website, y);
  y = drawKeyValue(doc, "Dirección", AGENT_INFO.address, y);
  y += 4;

  y = ensureSpace(doc, y, 40, pageCount);
  y = drawSectionTitle(doc, "RESUMEN DE LA OPERACIÓN", y);
  y = drawSummaryBox(doc, [
    { label: "Operación", value: getOperationDisplayName(client) },
    { label: "Copropietarios", value: formatNumTitulares(client.numTitulares) },
    { label: "Ingresos mensuales totales", value: formatCurrency(client.income), accent: true },
    { label: "Ahorros disponibles", value: formatCurrency(client.availableSavings) },
    { label: "Deudas mensuales", value: formatCurrency(client.debts) },
    { label: "Estado", value: formatStatus(client.status) },
  ], y);

  owners.forEach((owner, index) => {
    y = ensureSpace(doc, y, 50, pageCount);
    y = drawSectionTitle(doc, `TITULAR ${index + 1}`, y);
    y = drawKeyValue(doc, "Nombre completo", owner.fullName, y, { bold: true });
    y = drawKeyValue(doc, "Edad", owner.age, y);
    y = drawKeyValue(doc, "Nacionalidad", owner.nationality, y);
    y = drawKeyValue(doc, "DNI / NIE", owner.dni, y);
    y = drawKeyValue(doc, "Teléfono", owner.phone, y);
    y = drawKeyValue(doc, "Email", owner.email, y);
    y = drawKeyValue(doc, "Banco", owner.bank, y);
    y = drawKeyValue(doc, "Empresa", owner.company, y);
    y = drawKeyValue(doc, "Tipo de contrato", owner.contractType, y);
    y = drawKeyValue(doc, "Antigüedad", owner.seniority, y);
    y = drawKeyValue(doc, "Nómina mensual neta", formatCurrency(owner.payslips), y, { highlight: true });
    y = drawKeyValue(doc, "Ahorros", formatCurrency(owner.savings), y);
    y = drawKeyValue(doc, "Préstamos (cuota mensual)", formatCurrency(owner.loans), y);
    y += 4;
  });

  y = ensureSpace(doc, y, 55, pageCount);
  y = drawSectionTitle(doc, "CÁLCULO DE HIPOTECA", y);
  y = drawSummaryBox(doc, [
    {
      label: "Precio máximo vivienda",
      value: formatCurrency(ms?.precioMaximoVivienda ?? client.housePrice),
      accent: true,
    },
    {
      label: "Cuota mensual estimada",
      value: formatCurrency(ms?.cuotaMensual ?? client.monthlyPayment),
      accent: true,
    },
    {
      label: "Importe hipoteca",
      value: formatCurrency(ms?.importeHipoteca ?? client.mortgageAmount),
    },
    {
      label: "Financiación",
      value: `${client.financiacionPct ?? ms?.financiacionPct ?? "-"}%`,
    },
  ], y);

  y = drawKeyValue(
    doc,
    "Plazo del préstamo",
    ms?.loanTerm ? `${ms.loanTerm} años` : client.loanTerm ? `${client.loanTerm} años` : undefined,
    y,
  );
  y = drawKeyValue(
    doc,
    "Tipo de interés",
    ms?.hipotecaInterestRate
      ? `${ms.hipotecaInterestRate}%`
      : client.hipotecaInterestRate
        ? `${client.hipotecaInterestRate}%`
        : undefined,
    y,
  );
  y = drawKeyValue(
    doc,
    "Capacidad máxima de pago",
    ms?.monthlyIncome
      ? formatCurrency(ms.monthlyIncome * (client.numTitulares === "1" ? 0.3 : 0.35))
      : undefined,
    y,
  );
  y = drawKeyValue(
    doc,
    "ITP",
    client.itpPercentage
      ? `${client.itpPercentage}% (${formatCurrency(client.itpValue)})`
      : undefined,
    y,
  );
  y = drawKeyValue(doc, "Ahorros necesarios", formatCurrency(ms?.ahorrosNecesarios), y, { bold: true });
  if (shortfall > 0) {
    y = drawKeyValue(doc, "Financiación adicional sugerida", formatCurrency(shortfall), y, { bold: true });
  }
  y += 2;

  y = ensureSpace(doc, y, 40, pageCount);
  y = drawSectionTitle(doc, "GASTOS DE COMPRAVENTA", y);
  y = drawKeyValue(doc, "Notaría", formatCurrency(client.notaria), y);
  y = drawKeyValue(doc, "Registro", formatCurrency(client.registro), y);
  y = drawKeyValue(doc, "Gestoría", formatCurrency(client.gestoria), y);
  y = drawKeyValue(doc, "Tasación", formatCurrency(client.tasacion), y);
  y = drawKeyValue(doc, "Honorarios", formatCurrency(client.honorariosGSCapital), y);
  y = drawKeyValue(doc, "Valor ITP", formatCurrency(client.itpValue), y);
  y += 4;

  if (ai.children || ai.maritalStatus || ai.rental || ai.properties || ai.propertyValue) {
    y = ensureSpace(doc, y, 35, pageCount);
    y = drawSectionTitle(doc, "INFORMACIÓN ADICIONAL", y);
    y = drawKeyValue(doc, "Hijos", ai.children, y);
    y = drawKeyValue(doc, "Estado civil", ai.maritalStatus, y);
    y = drawKeyValue(doc, "En alquiler", ai.rental, y);
    y = drawKeyValue(doc, "Inmuebles capitalizados", ai.properties, y);
    y = drawKeyValue(doc, "Valor vivienda objetivo", formatCurrency(ai.propertyValue), y);
    y = drawKeyValue(doc, "Zona de interés", ai.zonesOfInterest || client.zone, y);
    y += 4;
  }

  if (pl?.loanAmount) {
    y = ensureSpace(doc, y, 35, pageCount);
    y = drawSectionTitle(doc, "PRÉSTAMO PERSONAL", y);
    y = drawKeyValue(doc, "Importe solicitado", formatCurrency(pl.loanAmount), y, { bold: true });
    y = drawKeyValue(doc, "Plazo", pl.loanTermYears ? `${pl.loanTermYears} años` : undefined, y);
    y = drawKeyValue(doc, "Cuota mensual", formatCurrency(pl.cuotaMensual), y, { highlight: true });
    y = drawKeyValue(doc, "TIN", pl.tin ? `${pl.tin}%` : undefined, y);
    y = drawKeyValue(doc, "TAE", pl.tae ? `${pl.tae}%` : undefined, y);
    y = drawKeyValue(doc, "Total adeudado", formatCurrency(pl.totalAdeudado), y);
    y += 4;
  }

  if (ai.observations) {
    y = ensureSpace(doc, y, 25, pageCount);
    y = drawSectionTitle(doc, "OBSERVACIONES", y);
    setTextColor(doc, BRAND.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(ai.observations, MARGIN_RIGHT - MARGIN_LEFT);
    doc.text(lines, MARGIN_LEFT, y);
    y += lines.length * 5 + 4;
  }

  drawPageFooter(doc, pageCount.n);

  const safeName = getOperationDisplayName(client)
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  doc.save(`livendia-${safeName || "cliente"}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
