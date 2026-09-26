/**
 * Utility functions for Indian Financial Years (April 1 to March 31)
 */

export function getCurrentFinancialYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed: 0 = Jan, 3 = April
  if (month >= 3) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

export function generateAvailableFinancialYears(count: number = 6): string[] {
  const current = getCurrentFinancialYear();
  const [startYear] = current.split("-").map(Number);
  const years: string[] = [];
  for (let i = 0; i < count; i++) {
    const y = startYear - i;
    years.push(`${y}-${y + 1}`);
  }
  return years;
}

export function generateAvailableCalendarYears(count: number = 6): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let i = 0; i < count; i++) {
    years.push(currentYear - i);
  }
  return years;
}

export function getCurrentQuarter(): string {
  const month = new Date().getMonth(); // 0 = Jan
  // Indian FY: Q1 = Apr-Jun (3-5), Q2 = Jul-Sep (6-8), Q3 = Oct-Dec (9-11), Q4 = Jan-Mar (0-2)
  if (month >= 3 && month <= 5) return "Q1";
  if (month >= 6 && month <= 8) return "Q2";
  if (month >= 9 && month <= 11) return "Q3";
  return "Q4";
}

export function getCurrentHalfYear(): string {
  const month = new Date().getMonth();
  // Indian FY: H1 = Apr-Sep (3-8), H2 = Oct-Mar (9-2)
  if (month >= 3 && month <= 8) return "H1";
  return "H2";
}
