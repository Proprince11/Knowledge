/**
 * High-performance schema-driven data sanitizer/validator.
 * Coerces, trims, validates, and reports per-field errors before DB load.
 *
 *   const schema: Schema = {
 *     id:    { type: "int", required: true },
 *     email: { type: "email", required: true },
 *     name:  { type: "string", maxLen: 120, trim: true },
 *     age:   { type: "int", min: 0, max: 130 },
 *     active:{ type: "bool", default: true },
 *   };
 *   const { valid, value, errors } = sanitizeRecord(raw, schema);
 */
export type FieldType = "string" | "int" | "float" | "bool" | "email" | "iso-date";

export interface FieldRule {
  type: FieldType;
  required?: boolean;
  trim?: boolean;
  min?: number;
  max?: number;
  maxLen?: number;
  pattern?: RegExp;
  default?: unknown;
  enum?: readonly unknown[];
}

export type Schema = Record<string, FieldRule>;

export interface FieldError { field: string; message: string; }
export interface SanitizeResult<T = Record<string, unknown>> {
  valid: boolean;
  value: T;
  errors: FieldError[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TRUE_SET = new Set(["true", "1", "yes", "y", "on"]);
const FALSE_SET = new Set(["false", "0", "no", "n", "off", ""]);

function coerce(type: FieldType, raw: unknown): { ok: boolean; value?: unknown; msg?: string } {
  switch (type) {
    case "string":
      return { ok: true, value: String(raw) };
    case "int": {
      const n = typeof raw === "number" ? raw : parseInt(String(raw).trim(), 10);
      return Number.isInteger(n) ? { ok: true, value: n } : { ok: false, msg: "not an integer" };
    }
    case "float": {
      const n = typeof raw === "number" ? raw : parseFloat(String(raw).trim());
      return Number.isFinite(n) ? { ok: true, value: n } : { ok: false, msg: "not a number" };
    }
    case "bool": {
      if (typeof raw === "boolean") return { ok: true, value: raw };
      const s = String(raw).trim().toLowerCase();
      if (TRUE_SET.has(s)) return { ok: true, value: true };
      if (FALSE_SET.has(s)) return { ok: true, value: false };
      return { ok: false, msg: "not a boolean" };
    }
    case "email": {
      const s = String(raw).trim().toLowerCase();
      return EMAIL_RE.test(s) ? { ok: true, value: s } : { ok: false, msg: "invalid email" };
    }
    case "iso-date": {
      const d = new Date(String(raw));
      return Number.isNaN(d.getTime())
        ? { ok: false, msg: "invalid date" }
        : { ok: true, value: d.toISOString() };
    }
    default:
      return { ok: false, msg: "unknown type" };
  }
}

export function sanitizeRecord<T = Record<string, unknown>>(
  raw: Record<string, unknown>,
  schema: Schema
): SanitizeResult<T> {
  const errors: FieldError[] = [];
  const value: Record<string, unknown> = {};

  for (const [field, rule] of Object.entries(schema)) {
    let v = raw[field];

    if (v === undefined || v === null || v === "") {
      if (rule.default !== undefined) { value[field] = rule.default; continue; }
      if (rule.required) { errors.push({ field, message: "required" }); continue; }
      continue; // optional + absent
    }

    if (rule.trim && typeof v === "string") v = v.trim();

    const c = coerce(rule.type, v);
    if (!c.ok) { errors.push({ field, message: c.msg || "invalid" }); continue; }
    let out = c.value as unknown;

    if (typeof out === "number") {
      if (rule.min !== undefined && out < rule.min) errors.push({ field, message: `< min ${rule.min}` });
      if (rule.max !== undefined && out > rule.max) errors.push({ field, message: `> max ${rule.max}` });
    }
    if (typeof out === "string") {
      if (rule.maxLen !== undefined && out.length > rule.maxLen) {
        out = out.slice(0, rule.maxLen); // truncate defensively
      }
      if (rule.pattern && !rule.pattern.test(out)) errors.push({ field, message: "pattern mismatch" });
    }
    if (rule.enum && !rule.enum.includes(out)) errors.push({ field, message: "not in allowed set" });

    value[field] = out;
  }

  return { valid: errors.length === 0, value: value as T, errors };
}

/** Batch helper: returns clean rows + a rejects list with reasons. */
export function sanitizeBatch<T = Record<string, unknown>>(
  rows: Record<string, unknown>[],
  schema: Schema
): { clean: T[]; rejects: Array<{ index: number; errors: FieldError[] }> } {
  const clean: T[] = [];
  const rejects: Array<{ index: number; errors: FieldError[] }> = [];
  rows.forEach((row, index) => {
    const r = sanitizeRecord<T>(row, schema);
    if (r.valid) clean.push(r.value);
    else rejects.push({ index, errors: r.errors });
  });
  return { clean, rejects };
}
