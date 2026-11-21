import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import type { DataTableSpec } from "@m4tic/core";
import { renderDataTable } from "./data-table.js";
import { renderShell } from "./shell.js";

const rows = (count: number) => Array.from({ length: count }, (_, index) => ({
  region: `Row ${index + 1}`, revenue: (index + 1) * 1000,
}));
const props = (): DataTableSpec["props"] => ({
  dataRef: "test.rows",
  columns: [
    { key: "region", label: "Region", type: "string", sortable: true },
    { key: "revenue", label: "Revenue", type: "currency", sortable: true },
  ],
  pageSize: 10, filterable: false, exportable: false, emptyState: "No rows available",
});

function rowTags(html: string): string[] {
  return [...(html.match(/<tbody>([\s\S]*?)<\/tbody>/u)?.[1] ?? "").matchAll(/<tr([^>]*)>/gu)]
    .map((match) => match[1]);
}

function button(disabled: boolean) {
  const listeners: (() => void)[] = [];
  return {
    disabled,
    addEventListener(_event: string, listener: () => void) { listeners.push(listener); },
    click() { if (!this.disabled) listeners.forEach((listener) => listener()); },
  };
}

// Execute the actual emitted JavaScript against the small DOM surface it uses.
// This verifies button behavior without adding a DOM library or launching a browser.
function mount(html: string) {
  const tableRows = rowTags(html).map((attributes, index) => ({
    originalIndex: index, hidden: /\bhidden\b/u.test(attributes), dataset: { rowIndex: String(index) },
  }));
  const tbody = { rows: tableRows };
  const prev = button(true);
  const next = button(false);
  const label = { textContent: "" };
  const observers: (() => void)[] = [];
  const card = {
    dataset: { pageSize: html.match(/data-page-size="(\d+)"/u)?.[1] },
    querySelector(selector: string) {
      switch (selector) {
        case "tbody": return tbody;
        case "[data-page-prev]": return prev;
        case "[data-page-next]": return next;
        case "[data-page-label]": return label;
        default: throw new Error(`Unexpected selector: ${selector}`);
      }
    },
  };
  const script = html.match(/<script>([\s\S]*?)<\/script>/u)?.[1];
  assert.ok(script, "paginated tables must include their own script");
  runInNewContext(script, {
    document: { currentScript: { closest: () => card } },
    MutationObserver: class {
      constructor(callback: () => void) { observers.push(callback); }
      observe(target: unknown, options: { childList: boolean }) {
        assert.equal(target, tbody);
        assert.equal(options.childList, true);
      }
    },
  });
  return {
    tbody, prev, next, label,
    visible: () => tbody.rows.filter((row) => !row.hidden).map((row) => row.originalIndex),
    reordered: () => observers.forEach((notify) => notify()),
  };
}

test("25 rows at pageSize 10 render three pages with only ten rows initially visible", () => {
  const html = renderDataTable(props(), rows(25));
  assert.match(html, /Page 1 of 3/u);
  assert.equal(rowTags(html).length, 25);
  assert.equal(rowTags(html).filter((attributes) => !/\bhidden\b/u.test(attributes)).length, 10);
  assert.match(html, /data-page-prev disabled/u);
  assert.doesNotMatch(html, /data-page-next disabled/u);
  const table = mount(html);
  assert.deepEqual(table.visible(), Array.from({ length: 10 }, (_, i) => i));
  assert.equal(table.label.textContent, "Page 1 of 3");
});

test("Next and Prev navigate 1–10, 11–20, and 21–25 with correct button states", () => {
  const table = mount(renderDataTable(props(), rows(25)));
  table.prev.click();
  assert.equal(table.label.textContent, "Page 1 of 3");
  table.next.click();
  assert.deepEqual(table.visible(), Array.from({ length: 10 }, (_, i) => i + 10));
  assert.equal(table.label.textContent, "Page 2 of 3");
  assert.equal(table.prev.disabled, false);
  assert.equal(table.next.disabled, false);
  table.next.click();
  assert.deepEqual(table.visible(), [20, 21, 22, 23, 24]);
  assert.equal(table.label.textContent, "Page 3 of 3");
  assert.equal(table.next.disabled, true);
  table.next.click();
  assert.equal(table.label.textContent, "Page 3 of 3");
  table.prev.click();
  assert.equal(table.label.textContent, "Page 2 of 3");
  table.prev.click();
  assert.equal(table.prev.disabled, true);
  assert.equal(table.next.disabled, false);
});

test("five rows at pageSize 10 have no script or pagination controls", () => {
  const html = renderDataTable(props(), rows(5));
  assert.equal(rowTags(html).length, 5);
  assert.doesNotMatch(html, /<script|dk-pagination|data-row-index| hidden/u);
});

test("empty tables show the empty state without script or controls", () => {
  const html = renderDataTable(props(), []);
  assert.match(html, /No rows available/u);
  assert.doesNotMatch(html, /<script|dk-pagination|<table/u);
});

test("an omitted pageSize shows every row directly and in flat or nested shell specs", () => {
  const input = props();
  Reflect.deleteProperty(input, "pageSize");
  const html = renderDataTable(input, rows(50));
  assert.equal(rowTags(html).length, 50);
  assert.doesNotMatch(html, /<script|dk-pagination|data-row-index| hidden/u);
  const document = renderShell([{ component: "DataTable", props: input }], { id: "test" }, { "test.rows": rows(50) });
  assert.equal(rowTags(document).length, 50);
  assert.doesNotMatch(document, /<nav class="dk-pagination"|data-page-size|data-row-index/u);
  const nested = renderShell([{
    component: "DashboardGrid",
    props: { children: [{ span: 12, spec: { component: "DataTable", props: input } }] },
  }], { id: "test" }, { "test.rows": rows(50) });
  assert.equal(rowTags(nested).length, 50);
  assert.doesNotMatch(nested, /<nav class="dk-pagination"|data-page-size|data-row-index/u);
});

test("sorting repaginates the new row order and returns to page one", () => {
  const table = mount(renderDataTable(props(), rows(25)));
  table.next.click();
  table.tbody.rows.reverse();
  table.reordered();
  assert.deepEqual(table.visible(), Array.from({ length: 10 }, (_, i) => 24 - i));
  assert.equal(table.label.textContent, "Page 1 of 3");
  assert.equal(table.prev.disabled, true);
});

test("multiple paginated tables maintain independent page state", () => {
  const first = mount(renderDataTable(props(), rows(25)));
  const second = mount(renderDataTable(props(), rows(25)));
  first.next.click();
  assert.equal(first.label.textContent, "Page 2 of 3");
  assert.equal(second.label.textContent, "Page 1 of 3");
});

test("dynamic table content remains escaped alongside the inline script", () => {
  const html = renderDataTable(props(), rows(25).map((row) => ({ ...row, region: '<script>evil</script>"&' })));
  assert.match(html, /&lt;script&gt;evil&lt;\/script&gt;&quot;&amp;/u);
  assert.doesNotMatch(html, /<script>evil/u);
  assert.equal((html.match(/<script>/gu) ?? []).length, 1);
  mount(html);
});
