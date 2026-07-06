"use client";

import { AGENT_INFO } from "@/lib/gscapital/constants";
import { downloadClientSummary } from "@/lib/gscapital/client-document";
import { formatCurrency } from "@/lib/gscapital/format";
import {
  formatTitularesLabel,
  getOperationDisplayName,
  getOwnersFromClient,
} from "@/lib/gscapital/owners";
import type { Client, OwnerData } from "@/lib/gscapital/types";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-3 border-b border-gray-200 pb-2 font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-100">
        {title}
      </h4>
      <div className="grid gap-2 text-sm sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <p>
      <span className="text-gray-500 dark:text-gray-400">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </p>
  );
}

function OwnerSection({ owner, index }: { owner: OwnerData; index: number }) {
  return (
    <Section title={`Titular ${index + 1}`}>
      <Row label="Nombre" value={owner.fullName} />
      <Row label="Edad" value={owner.age} />
      <Row label="Nacionalidad" value={owner.nationality} />
      <Row label="Teléfono" value={owner.phone} />
      <Row label="Email" value={owner.email} />
      <Row label="DNI/NIE" value={owner.dni} />
      <Row label="Banco" value={owner.bank} />
      <Row label="Empresa" value={owner.company} />
      <Row label="Contrato" value={owner.contractType} />
      <Row label="Antigüedad" value={owner.seniority} />
      <Row label="Nómina" value={formatCurrency(owner.payslips)} />
      <Row label="Ahorros" value={formatCurrency(owner.savings)} />
      <Row label="Préstamos (cuota)" value={formatCurrency(owner.loans)} />
    </Section>
  );
}

export function ClientDetailModal({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  const ai = client.additionalInfo ?? {};
  const ms = client.mortgageSnapshot;
  const pl = client.personalLoan;
  const owners = getOwnersFromClient(client);
  const shortfall =
    ms?.shortfall ??
    (ms?.ahorrosNecesarios && ms.availableSavings !== undefined
      ? Math.max(0, ms.ahorrosNecesarios - ms.availableSavings)
      : 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {getOperationDisplayName(client)}
            </h3>
            <p className="text-sm text-gray-500">
              {AGENT_INFO.company} — {AGENT_INFO.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {owners.map((owner, index) => (
            <OwnerSection key={index} owner={owner} index={index} />
          ))}

          <Section title="Totales de la operación">
            <Row label="Copropietarios" value={formatTitularesLabel(client.numTitulares)} />
            <Row label="Ingresos totales" value={formatCurrency(client.income)} />
            <Row label="Ahorros totales" value={formatCurrency(client.availableSavings)} />
            <Row label="Deudas totales" value={formatCurrency(client.debts)} />
          </Section>

          <Section title="Información adicional">
            <Row label="Hijos" value={ai.children} />
            <Row label="Estado civil" value={ai.maritalStatus} />
            <Row label="Alquiler" value={ai.rental} />
            <Row label="Inmuebles" value={ai.properties} />
            <Row label="Valor vivienda objetivo" value={formatCurrency(ai.propertyValue ?? client.housePrice)} />
            <Row label="Zonas" value={ai.zonesOfInterest || client.zone} />
            {ai.observations ? (
              <p className="sm:col-span-2">
                <span className="text-gray-500">Observaciones:</span>{" "}
                {ai.observations}
              </p>
            ) : null}
          </Section>

          <Section title="Cálculo de hipoteca">
            <Row label="Titulares" value={formatTitularesLabel(client.numTitulares)} />
            <Row label="Financiación" value={client.financiacionPct ? `${client.financiacionPct}%` : undefined} />
            <Row label="Precio vivienda" value={formatCurrency(ms?.precioMaximoVivienda ?? client.housePrice)} />
            <Row label="Importe hipoteca" value={formatCurrency(ms?.importeHipoteca ?? client.mortgageAmount)} />
            <Row label="Cuota mensual" value={formatCurrency(ms?.cuotaMensual ?? client.monthlyPayment)} />
            <Row label="Plazo" value={ms?.loanTerm ? `${ms.loanTerm} años` : client.loanTerm ? `${client.loanTerm} años` : undefined} />
            <Row label="Tipo interés" value={ms?.hipotecaInterestRate ? `${ms.hipotecaInterestRate}%` : client.hipotecaInterestRate ? `${client.hipotecaInterestRate}%` : undefined} />
            <Row label="ITP" value={client.itpPercentage ? `${client.itpPercentage}% (${formatCurrency(client.itpValue)})` : undefined} />
            <Row label="Ahorros necesarios" value={formatCurrency(ms?.ahorrosNecesarios)} />
            <Row label="Notaría" value={formatCurrency(client.notaria)} />
            <Row label="Registro" value={formatCurrency(client.registro)} />
            <Row label="Gestoría" value={formatCurrency(client.gestoria)} />
            <Row label="Tasación" value={formatCurrency(client.tasacion)} />
            <Row label="Honorarios" value={formatCurrency(client.honorariosGSCapital)} />
            {shortfall > 0 ? (
              <p className="sm:col-span-2 font-semibold text-amber-600">
                Financiación adicional sugerida: {formatCurrency(shortfall)}
              </p>
            ) : null}
          </Section>

          {pl?.loanAmount ? (
            <Section title="Préstamo personal">
              <Row label="Importe" value={formatCurrency(pl.loanAmount)} />
              <Row label="Plazo" value={pl.loanTermYears ? `${pl.loanTermYears} años` : undefined} />
              <Row label="TIN" value={pl.tin ? `${pl.tin}%` : undefined} />
              <Row label="Cuota mensual" value={formatCurrency(pl.cuotaMensual)} />
              <Row label="Total adeudado" value={formatCurrency(pl.totalAdeudado)} />
            </Section>
          ) : null}

          <p className="text-sm text-gray-500">
            Estado: <span className="font-semibold capitalize">{client.status}</span>
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-200 pt-4 dark:border-gray-600">
          <button
            type="button"
            onClick={() => downloadClientSummary(client)}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800"
          >
            Descargar PDF para el cliente
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
