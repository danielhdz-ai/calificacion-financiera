import type { Client, OwnerData, PersonalData } from "./types";

export type OwnerCount = 1 | 2 | 3;

export function getOwnerCount(client: Client | null): OwnerCount {
  if (!client) return 1;
  if (client.owners && client.owners.length >= 3) return 3;
  if (client.owners && client.owners.length === 2) return 2;
  const parsed = parseInt(client.numTitulares ?? "1", 10);
  if (parsed >= 3) return 3;
  if (parsed >= 2) return 2;
  return 1;
}

export function getOwnersFromClient(client: Client): OwnerData[] {
  if (client.owners && client.owners.length > 0) {
    return client.owners;
  }
  if (client.personalData) {
    return [client.personalData];
  }
  return [{ fullName: client.name }];
}

export function getOwnersAgesString(client: Client): string {
  return getOwnersFromClient(client)
    .map((owner) => owner.age)
    .filter(Boolean)
    .join(", ");
}

export function formatNumTitulares(num?: string): string {
  if (num === "3") return "Tres";
  if (num === "2") return "Dos";
  return "Uno";
}

export function formatTitularesLabel(num?: string): string {
  const count = formatNumTitulares(num);
  const pct = num === "1" ? "30%" : "35%";
  return `${count} (${pct})`;
}

export function getOperationDisplayName(client: Client): string {
  const names = getOwnersFromClient(client)
    .map((owner) => owner.fullName?.trim())
    .filter(Boolean);
  return names.length > 0 ? names.join(" / ") : client.name;
}

export function aggregateOwnerTotals(owners: OwnerData[]) {
  return owners.reduce<{ income: number; savings: number; debts: number }>(
    (acc, owner) => ({
      income: acc.income + (parseFloat(String(owner.payslips ?? 0)) || 0),
      savings: acc.savings + (parseFloat(String(owner.savings ?? 0)) || 0),
      debts: acc.debts + (parseFloat(String(owner.loans ?? 0)) || 0),
    }),
    { income: 0, savings: 0, debts: 0 },
  );
}

export function emptyOwner(partial?: Partial<OwnerData>): OwnerData {
  return {
    fullName: "",
    age: "",
    nationality: "",
    phone: "",
    dni: "",
    bank: "",
    email: "",
    company: "",
    contractType: "",
    seniority: "",
    payslips: "",
    savings: "",
    loans: "",
    ...partial,
  };
}

export function ownerFromPersonalData(data?: PersonalData): OwnerData {
  if (!data) return emptyOwner();
  return { ...data };
}

export function ensureOwnersForCount(
  client: Client | null,
  count: OwnerCount,
): OwnerData[] {
  const existing = client ? getOwnersFromClient(client) : [];
  const owners: OwnerData[] = [];
  for (let i = 0; i < count; i += 1) {
    owners.push(existing[i] ? { ...existing[i] } : emptyOwner());
  }
  return owners;
}
