"use client";

import { useState } from "react";
import { useGSCapital } from "@/components/gscapital/GSCapitalContext";
import {
  Field,
  Input,
  Panel,
  PrimaryButton,
  SecondaryButton,
  Select,
  TextArea,
} from "@/components/gscapital/ui/Panel";
import { AGENT_INFO } from "@/lib/gscapital/constants";
import type { Client } from "@/lib/gscapital/types";

function buildClientFromForm(current: Client, form: FormData): Client {
  const personalData = {
    fullName: String(form.get("clientFullName") ?? ""),
    age: String(form.get("clientAge") ?? ""),
    nationality: String(form.get("clientNationality") ?? ""),
    phone: String(form.get("clientPhone") ?? ""),
    dni: String(form.get("clientDNI") ?? ""),
    bank: String(form.get("clientBank") ?? ""),
    email: String(form.get("clientEmail") ?? ""),
    company: String(form.get("clientCompany") ?? ""),
    contractType: String(form.get("clientContractType") ?? ""),
    seniority: String(form.get("clientSeniority") ?? ""),
    payslips: String(form.get("clientPayslips") ?? ""),
    savings: String(form.get("clientSavings") ?? ""),
    loans: String(form.get("clientLoans") ?? ""),
  };

  const additionalInfo = {
    children: String(form.get("clientChildren") ?? ""),
    properties: String(form.get("clientProperties") ?? ""),
    rental: String(form.get("clientRental") ?? ""),
    maritalStatus: String(form.get("clientMaritalStatus") ?? ""),
    propertyValue: String(form.get("clientPropertyValue") ?? ""),
    zonesOfInterest: String(form.get("clientZonesOfInterest") ?? ""),
    observations: String(form.get("clientObservations") ?? ""),
  };

  return {
    ...current,
    name: personalData.fullName || current.name,
    zone: additionalInfo.zonesOfInterest || current.zone,
    income: parseFloat(personalData.payslips) || 0,
    availableSavings: parseFloat(personalData.savings) || 0,
    debts: parseFloat(personalData.loans) || 0,
    housePrice: parseFloat(additionalInfo.propertyValue) || 0,
    personalData,
    additionalInfo,
  };
}

export function AsesoramientoTab() {
  const { currentClient, createClient, updateClient, setCurrentClient, clients } =
    useGSCapital();
  const [formKey, setFormKey] = useState(0);

  function handleNewClient() {
    const name = prompt("Ingrese el nombre del nuevo cliente:");
    if (!name?.trim()) return;
    createClient(name.trim());
    setFormKey((value) => value + 1);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentClient) {
      alert("Cree un nuevo cliente primero.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const updated = buildClientFromForm(currentClient, form);
    await updateClient(updated);
    alert("Información del cliente guardada correctamente.");
  }

  function handleClear() {
    setCurrentClient(null);
    setFormKey((value) => value + 1);
  }

  const pd = currentClient?.personalData ?? {};
  const ai = currentClient?.additionalInfo ?? {};

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <Panel title="Asesoramiento Financiero">
        <div className="mb-6 space-y-2 text-gray-700 dark:text-gray-300">
          <p>{AGENT_INFO.address}</p>
          <p>Tfno. {AGENT_INFO.landline}</p>
          <p>{AGENT_INFO.website}</p>
        </div>
        <h4 className="mb-3 border-t border-gray-200 pt-3 font-semibold dark:border-gray-600">
          Cliente Actual
        </h4>
        {currentClient ? (
          <div className="space-y-2">
            <p className="font-semibold">{currentClient.name}</p>
            <Select
              value={currentClient.status}
              onChange={(event) =>
                void updateClient({
                  ...currentClient,
                  status: event.target.value as Client["status"],
                })
              }
            >
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
              <option value="activo">Activo</option>
              <option value="noactivo">No Activo</option>
            </Select>
          </div>
        ) : (
          <p className="text-gray-500">No hay cliente seleccionado</p>
        )}
        <div className="mt-6 space-y-3">
          <PrimaryButton type="button" className="w-full" onClick={handleNewClient}>
            Nuevo Cliente
          </PrimaryButton>
          <SecondaryButton type="button" className="w-full" onClick={handleClear}>
            Limpiar Campos Actuales
          </SecondaryButton>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Total clientes en base de datos: {clients.length}
        </p>
      </Panel>

      <form key={formKey} onSubmit={handleSave} className="space-y-6">
        <Panel title="Datos Personales">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Cliente"><Input name="clientFullName" defaultValue={pd.fullName ?? currentClient?.name ?? ""} /></Field>
            <Field label="Edad"><Input name="clientAge" defaultValue={pd.age ?? ""} placeholder="Ej: 30 / 30, 35" /></Field>
            <Field label="Nacionalidad"><Input name="clientNationality" defaultValue={pd.nationality ?? ""} /></Field>
            <Field label="Teléfono"><Input name="clientPhone" defaultValue={pd.phone ?? ""} /></Field>
            <Field label="DNI/NIE"><Input name="clientDNI" defaultValue={pd.dni ?? ""} /></Field>
            <Field label="Su Banco"><Input name="clientBank" defaultValue={pd.bank ?? ""} /></Field>
            <Field label="Correo Electrónico"><Input name="clientEmail" type="email" defaultValue={pd.email ?? ""} /></Field>
            <Field label="Empresa en la que Trabaja"><Input name="clientCompany" defaultValue={pd.company ?? ""} /></Field>
            <Field label="Tipo de Contrato"><Input name="clientContractType" defaultValue={pd.contractType ?? ""} placeholder="Ej: Indefinido / Indefinido, Temporal" /></Field>
            <Field label="Antigüedad (Empresa Actual)"><Input name="clientSeniority" defaultValue={pd.seniority ?? ""} placeholder="Ej: 5 años / 5 años, 1 año" /></Field>
            <Field label="Nóminas (ingresos mensuales netos)"><Input name="clientPayslips" type="number" defaultValue={pd.payslips ?? currentClient?.income ?? ""} /></Field>
            <Field label="Ahorros (para hipoteca)"><Input name="clientSavings" type="number" defaultValue={pd.savings ?? currentClient?.availableSavings ?? ""} /></Field>
            <Field label="Préstamos (cuota mensual total)"><Input name="clientLoans" type="number" defaultValue={pd.loans ?? currentClient?.debts ?? ""} /></Field>
          </div>
        </Panel>

        <Panel title="Información Adicional">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Hijos"><Input name="clientChildren" defaultValue={ai.children ?? ""} /></Field>
            <Field label="Estado Civil"><Input name="clientMaritalStatus" defaultValue={ai.maritalStatus ?? ""} /></Field>
            <Field label="Está en Alquiler">
              <Select name="clientRental" defaultValue={ai.rental ?? ""}>
                <option value="">Seleccionar</option>
                <option value="Si">Sí</option>
                <option value="No">No</option>
              </Select>
            </Field>
            <Field label="Inmuebles Capitalizados"><Input name="clientProperties" defaultValue={ai.properties ?? ""} /></Field>
            <Field label="Valor de la Vivienda (objetivo)"><Input name="clientPropertyValue" type="number" defaultValue={ai.propertyValue ?? currentClient?.housePrice ?? ""} /></Field>
            <Field label="Zonas que Buscan"><Input name="clientZonesOfInterest" defaultValue={ai.zonesOfInterest ?? currentClient?.zone ?? ""} /></Field>
            <div className="md:col-span-2">
              <Field label="Observaciones"><TextArea name="clientObservations" rows={4} defaultValue={ai.observations ?? ""} /></Field>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <PrimaryButton type="submit">Guardar Información</PrimaryButton>
          </div>
        </Panel>
      </form>
    </div>
  );
}
