export const BASE_ITP_PERCENTAGE = 10;
export const YOUTH_ITP_PERCENTAGE = 5;
export const YOUTH_AGE_LIMIT = 35;

export function parseAges(ageStr?: string): number[] {
  if (!ageStr?.trim()) return [];
  return ageStr
    .split(/[,;/\s]+/)
    .map((part) => parseInt(part.trim(), 10))
    .filter((age) => !Number.isNaN(age) && age > 0);
}

/** ITP bonificado al 5% si algún titular tiene menos de 35 años (Cataluña). */
export function calculateItpPercentage(ageStr?: string): number {
  const ages = parseAges(ageStr);
  if (ages.length === 0) return BASE_ITP_PERCENTAGE;
  const hasYouthBonus = ages.some((age) => age < YOUTH_AGE_LIMIT);
  return hasYouthBonus ? YOUTH_ITP_PERCENTAGE : BASE_ITP_PERCENTAGE;
}
