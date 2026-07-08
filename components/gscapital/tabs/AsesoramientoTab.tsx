"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  aggregateOwnerTotals,
  ensureOwnersForCount,
  getOperationDisplayName,
  getOwnerCount,
  type OwnerCount,
} from "@/lib/gscapital/owners";
import type { Client, OwnerData } from "@/lib/gscapital/types";

function buildClientFromForm(
  current: Client,
  form: FormData,
  ownerCount: OwnerCount,
): Client {
  const owners: OwnerData[] = [];
  for (let i = 0; i < ownerCount; i += 1) {
    owners.push({
      fullName: String(form.get(`owner${i}FullName`) ?? ""),
      age: String(form.get(`owner${i}Age`) ?? ""),
      nationality: String(form.get(`owner${i}Nationality`) ?? ""),
      phone: String(form.get(`owner${i}Phone`) ?? ""),
      dni: String(form.get(`owner${i}DNI`) ?? ""),
      bank: String(form.get(`owner${i}Bank`) ?? ""),
      email: String(form.get(`owner${i}Email`) ?? ""),
      company: String(form.get(`owner${i}Company`) ?? ""),
      contractType: String(form.get(`owner${i}ContractType`) ?? ""),
      seniority: String(form.get(`owner${i}Seniority`) ?? ""),
      payslips: String(form.get(`owner${i}Payslips`) ?? ""),
      savings: String(form.get(`owner${i}Savings`) ?? ""),
      loans: String(form.get(`owner${i}Loans`) ?? ""),
    });
  }

  const totals = aggregateOwnerTotals(owners);
  const displayName = getOperationDisplayName({ ...current, owners });

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
    name: displayName,
    owners,
    personalData: owners[0],
    numTitulares: String(ownerCount),
    zone: additionalInfo.zonesOfInterest || current.zone,
    income: totals.income,
    availableSavings: totals.savings,
    debts: totals.debts,
    housePrice: parseFloat(additionalInfo.propertyValue) || 0,
    additionalInfo,
  };
}

function OwnerFields({
  index,
  owner,
}: {
  index: number;
  owner: OwnerData;
}) {
  const prefix = `owner${index}`;
  const labels = ["Primer titular", "Segundo titular", "Tercer titular"];

  return (
    <Panel title={`${labels[index]} (copropietario ${index + 1})`}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre completo">
          <Input name={`${prefix}FullName`} defaultValue={owner.fullName ?? ""} />
        </Field>
        <Field label="Edad">
          <Input name={`${prefix}Age`} defaultValue={owner.age ?? ""} placeholder="Ej: 30" />
        </Field>
        <Field label="Nacionalidad">
          <Input name={`${prefix}Nationality`} defaultValue={owner.nationality ?? ""} />
        </Field>
        <Field label="Teléfono">
          <Input name={`${prefix}Phone`} defaultValue={owner.phone ?? ""} />
        </Field>
        <Field label="DNI/NIE">
          <Input name={`${prefix}DNI`} defaultValue={owner.dni ?? ""} />
        </Field>
        <Field label="Su Banco">
          <Input name={`${prefix}Bank`} defaultValue={owner.bank ?? ""} />
        </Field>
        <Field label="Correo Electrónico">
          <Input name={`${prefix}Email`} type="email" defaultValue={owner.email ?? ""} />
        </Field>
        <Field label="Empresa">
          <Input name={`${prefix}Company`} defaultValue={owner.company ?? ""} />
        </Field>
        <Field label="Tipo de Contrato">
          <Input name={`${prefix}ContractType`} defaultValue={owner.contractType ?? ""} />
        </Field>
        <Field label="Antigüedad">
          <Input name={`${prefix}Seniority`} defaultValue={owner.seniority ?? ""} />
        </Field>
        <Field label="Nómina (ingresos mensuales netos)">
          <Input name={`${prefix}Payslips`} type="number" defaultValue={owner.payslips ?? ""} />
        </Field>
        <Field label="Ahorros (para hipoteca)">
          <Input name={`${prefix}Savings`} type="number" defaultValue={owner.savings ?? ""} />
        </Field>
        <Field label="Préstamos (cuota mensual)">
          <Input name={`${prefix}Loans`} type="number" defaultValue={owner.loans ?? ""} />
        </Field>
      </div>
    </Panel>
  );
}

export function AsesoramientoTab() {
  const { currentClient, createClient, updateClient, setCurrentClient, clients, setActiveTab } =
    useGSCapital();
  const [formKey, setFormKey] = useState(0);
  const [ownerCount, setOwnerCount] = useState<OwnerCount>(() =>
    getOwnerCount(currentClient),
  );

  useEffect(() => {
    setOwnerCount(getOwnerCount(currentClient));
  }, [currentClient]);

  const owners = useMemo(
    () => ensureOwnersForCount(currentClient, ownerCount),
    [currentClient, ownerCount, formKey],
  );

  async function handleNewClient() {
    const count = ownerCount;
    const promptMessage =
      count === 1
        ? "Ingrese el nombre del titular:"
        : `Ingrese el nombre del primer titular (${count} copropietarios en la operación):`;
    const name = prompt(promptMessage);
    if (!name?.trim()) return;
    try {
      await createClient(name.trim(), count);
      setFormKey((value) => value + 1);
    } catch {
      alert("No se pudo guardar el cliente en Supabase.");
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentClient) {
      alert("Cree un nuevo cliente primero.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const updated = buildClientFromForm(currentClient, form, ownerCount);
    try {
      await updateClient(updated);
      setActiveTab("hipoteca");
    } catch {
      alert("No se pudo guardar en Supabase.");
    }
  }

  function handleClear() {
    setCurrentClient(null);
    setOwnerCount(1);
    setFormKey((value) => value + 1);
  }

  const ai = currentClient?.additionalInfo ?? {};

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <Panel title="Asesoramiento Financiero">
        <div className="mb-6 space-y-2 text-gray-700 dark:text-gray-300">
          <p>{AGENT_INFO.name}</p>
          <p>{AGENT_INFO.address}</p>
          <p>Tfno. {AGENT_INFO.landline}</p>
          <p>{AGENT_INFO.website}</p>
        </div>
        <h4 className="mb-3 border-t border-gray-200 pt-3 font-semibold dark:border-gray-600">
          Operación Actual
        </h4>
        {currentClient ? (
          <div className="space-y-2">
            <p className="font-semibold">{getOperationDisplayName(currentClient)}</p>
            <p className="text-sm text-gray-500">
              {ownerCount} copropietario{ownerCount > 1 ? "s" : ""} en la misma operación
            </p>
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
          <p className="text-gray-500">No hay operación seleccionada</p>
        )}
        <div className="mt-6 space-y-3">
          <PrimaryButton type="button" className="w-full" onClick={handleNewClient}>
            Nueva Operación
          </PrimaryButton>
          <SecondaryButton type="button" className="w-full" onClick={handleClear}>
            Limpiar Campos Actuales
          </SecondaryButton>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Total operaciones en base de datos: {clients.length}
        </p>
      </Panel>

      <form key={`${formKey}-${ownerCount}`} onSubmit={handleSave} className="space-y-6">
        <Panel title="Copropietarios de la operación">
          <Field label="Número de titulares en la financiación">
            <Select
              value={String(ownerCount)}
              onChange={(event) => {
                setOwnerCount(parseInt(event.target.value, 10) as OwnerCount);
              }}
            >
              <option value="1">1 titular</option>
              <option value="2">2 copropietarios</option>
              <option value="3">3 copropietarios</option>
            </Select>
          </Field>
          <p className="mt-2 text-sm text-gray-500">
            Todos los titulares forman parte de la misma operación de financiación.
          </p>
        </Panel>

        {owners.map((owner, index) => (
          <OwnerFields key={index} index={index} owner={owner} />
        ))}

        <Panel title="Información Adicional de la Operación">
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
