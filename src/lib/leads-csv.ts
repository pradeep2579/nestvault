import { stages, type Stage } from "./content";

export const leadCsvColumns = ["name", "email", "phone", "company", "interest", "team_size", "message", "stage", "follow_up_at", "tour_at"] as const;
export type CsvLead = { name: string; email: string; phone: string; company: string; interest: string; team_size: string; message: string; stage: Stage; follow_up_at: string | null; tour_at: string | null };

export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') {
      if (cell) throw new Error("Invalid CSV quoting");
      quoted = true;
    } else if (char === ",") {
      row.push(cell); cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("Unclosed CSV quote");
  if (row.length || cell) { row.push(cell); rows.push(row); }
  return rows.filter(values => values.some(value => value.trim()));
}

function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  // Spreadsheet apps may execute formulas from downloaded CSV files.
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(rows: Record<string, unknown>[], columns: readonly string[] = leadCsvColumns) {
  return [columns.join(","), ...rows.map(row => columns.map(column => csvCell(row[column])).join(","))].join("\r\n") + "\r\n";
}

const aliases: Record<string, string> = { full_name: "name", mobile: "phone", phone_number: "phone", notes: "message", status: "stage", follow_up: "follow_up_at", tour_date: "tour_at" };
const limits: Record<string, number> = { name: 120, email: 254, phone: 50, company: 120, interest: 80, team_size: 50, message: 2000 };

export function importColumns(header: string[]) {
  const columns = header.map(value => {
    const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
    return aliases[normalized] || normalized;
  });
  if (new Set(columns).size !== columns.length) throw new Error("The CSV has duplicate columns");
  if (!columns.includes("name") || (!columns.includes("email") && !columns.includes("phone"))) throw new Error("The CSV needs name and either email or phone columns");
  return columns;
}

export function readCsvLead(columns: string[], values: string[]): CsvLead {
  if (values.length !== columns.length) throw new Error("Column count does not match the header");
  const row = Object.fromEntries(columns.map((column, index) => [column, values[index].trim().replace(/^'(?=[=+\-@])/, "")]));
  for (const [key, max] of Object.entries(limits)) if ((row[key] || "").length > max) throw new Error(`${key} is too long`);
  const name = row.name || "", email = (row.email || "").toLowerCase(), phone = row.phone || "";
  if (!name || (!email && !phone)) throw new Error("Name and email or phone are required");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
  const stage = (row.stage || "new").toLowerCase().replace(/[\s-]+/g, "_");
  if (!stages.includes(stage as Stage)) throw new Error("Invalid stage");
  const date = (key: string) => {
    const value = row[key];
    if (!value) return null;
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) throw new Error(`${key} needs an ISO date with timezone`);
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid ${key}`);
    return parsed.toISOString();
  };
  return { name, email, phone, company: row.company || "", interest: row.interest || "", team_size: row.team_size || "", message: row.message || "", stage: stage as Stage, follow_up_at: date("follow_up_at"), tour_at: date("tour_at") };
}
