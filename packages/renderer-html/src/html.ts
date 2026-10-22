export function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatValue(
  value: unknown,
  type: "string" | "number" | "date" | "currency" | "boolean",
): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (type === "currency" || type === "number") {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return escapeHtml(value);
    }

    return escapeHtml(
      type === "currency"
        ? number.toLocaleString("en-US", { style: "currency", currency: "USD" })
        : number.toLocaleString("en-US"),
    );
  }

  if (type === "date") {
    const date = new Date(String(value));

    return Number.isNaN(date.getTime())
      ? escapeHtml(value)
      : escapeHtml(date.toISOString().slice(0, 10));
  }

  if (type === "boolean") {
    return value ? "✓" : "✗";
  }

  return escapeHtml(value);
}
