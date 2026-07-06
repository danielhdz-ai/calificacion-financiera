"use client";

import { useMemo, useState } from "react";
import { ClientDetailModal } from "@/components/gscapital/ClientDetailModal";
import { useGSCapital } from "@/components/gscapital/GSCapitalContext";
import { Field, Input, Panel, Select } from "@/components/gscapital/ui/Panel";
import { WHATSAPP_MESSAGE_TEMPLATE } from "@/lib/gscapital/constants";
import { downloadClientSummary } from "@/lib/gscapital/client-document";
import { formatCurrency, getStatusColor } from "@/lib/gscapital/format";
import {
  formatNumTitulares,
  getOperationDisplayName,
  getOwnersFromClient,
} from "@/lib/gscapital/owners";
import type { Client } from "@/lib/gscapital/types";

const actionButtonClass =
  "text-white hover:underline dark:text-white";

export function DatabaseTab() {
  const { clients, setCurrentClient, setActiveTab, deleteClient } = useGSCapital();
  const [statusFilter, setStatusFilter] = useState("todos");
  const [zoneFilter, setZoneFilter] = useState("");
  const [viewClient, setViewClient] = useState<Client | null>(null);

  const filtered = useMemo(
    () =>
      clients.filter((client) => {
        const zone =
          client.zone || client.additionalInfo?.zonesOfInterest || "";
        const statusMatch =
          statusFilter === "todos" || client.status === statusFilter;
        const zoneMatch =
          !zoneFilter || zone.toLowerCase().includes(zoneFilter.toLowerCase());
        return statusMatch && zoneMatch;
      }),
    [clients, statusFilter, zoneFilter],
  );

  function openWhatsApp(phone?: string) {
    if (!phone) {
      alert("El cliente no tiene teléfono registrado.");
      return;
    }
    let normalized = phone.replace(/[\s\-()]/g, "");
    if (normalized.length === 9 && !normalized.startsWith("34")) {
      normalized = `34${normalized}`;
    }
    window.open(
      `https://wa.me/${normalized}?text=${encodeURIComponent(WHATSAPP_MESSAGE_TEMPLATE)}`,
      "_blank",
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Base de Datos Global de Clientes
      </h2>
      <Panel>
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <Field label="Filtrar por estado">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
              <option value="activo">Activo</option>
              <option value="noactivo">No Activo</option>
            </Select>
          </Field>
          <Field label="Filtrar por zona">
            <Input value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} placeholder="Zona" />
          </Field>
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No hay clientes en la base de datos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  {[
                    "Cliente",
                    "Zona",
                    "Ingresos",
                    "Deudas",
                    "Titulares",
                    "Financiación",
                    "Ahorros",
                    "Precio Viv.",
                    "Hipoteca",
                    "Cuota",
                    "Estado",
                    "Acciones",
                  ].map((header) => (
                    <th key={header} className="border border-gray-200 px-2 py-3 text-left dark:border-gray-600">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id}>
                    <td className="border px-2 py-2 dark:border-gray-600">
                      {getOperationDisplayName(client)}
                    </td>
                    <td className="border px-2 py-2 dark:border-gray-600">
                      {client.zone || client.additionalInfo?.zonesOfInterest || "-"}
                    </td>
                    <td className="border px-2 py-2 dark:border-gray-600">{formatCurrency(client.income)}</td>
                    <td className="border px-2 py-2 dark:border-gray-600">{formatCurrency(client.debts)}</td>
                    <td className="border px-2 py-2 dark:border-gray-600">
                      {formatNumTitulares(client.numTitulares)}
                    </td>
                    <td className="border px-2 py-2 dark:border-gray-600">{client.financiacionPct ?? "-"}%</td>
                    <td className="border px-2 py-2 dark:border-gray-600">
                      {formatCurrency(client.availableSavings)}
                    </td>
                    <td className="border px-2 py-2 dark:border-gray-600">{formatCurrency(client.housePrice)}</td>
                    <td className="border px-2 py-2 dark:border-gray-600">{formatCurrency(client.mortgageAmount)}</td>
                    <td className="border px-2 py-2 dark:border-gray-600">{formatCurrency(client.monthlyPayment)}</td>
                    <td className="border px-2 py-2 dark:border-gray-600">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="border px-2 py-2 dark:border-gray-600">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className={actionButtonClass} onClick={() => setViewClient(client)}>Ver</button>
                        <button type="button" className={actionButtonClass} onClick={() => downloadClientSummary(client)}>Descargar</button>
                        <button type="button" className={actionButtonClass} onClick={() => { setCurrentClient(client); setActiveTab("asesoramiento"); }}>Editar</button>
                        <button type="button" className={actionButtonClass} onClick={() => openWhatsApp(getOwnersFromClient(client)[0]?.phone)}>WhatsApp</button>
                        <button type="button" className={actionButtonClass} onClick={() => void deleteClient(client.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {viewClient ? (
        <ClientDetailModal
          client={viewClient}
          onClose={() => setViewClient(null)}
        />
      ) : null}
    </div>
  );
}
