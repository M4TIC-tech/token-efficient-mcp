export const sortingScript = String.raw`
(() => {
  function cellValue(row, columnIndex, type) {
    const text = (row.cells[columnIndex]?.textContent ?? "").trim();

    if (type === "currency" || type === "number") {
      return parseFloat(text.replace(/[^0-9.-]/g, ""));
    }

    if (type === "date") {
      return new Date(text).getTime();
    }

    return text;
  }

  document.querySelectorAll("table.dk-table").forEach((table) => {
    const tbody = table.tBodies[0];
    if (!tbody) return;

    const headers = table.querySelectorAll("thead th");

    headers.forEach((header) => {
      if (header.dataset.sortable !== "true") return;

      function sortRows() {
        const columnIndex = header.cellIndex;
        const type = header.dataset.type;
        const ascending = header.getAttribute("aria-sort") !== "ascending";
        const direction = ascending ? 1 : -1;
        const rows = Array.from(tbody.rows);

        rows.sort((leftRow, rightRow) => {
          const left = cellValue(leftRow, columnIndex, type);
          const right = cellValue(rightRow, columnIndex, type);
          const leftInvalid = typeof left === "number" && Number.isNaN(left);
          const rightInvalid = typeof right === "number" && Number.isNaN(right);

          if (leftInvalid || rightInvalid) {
            if (leftInvalid === rightInvalid) return 0;
            return leftInvalid ? 1 : -1;
          }

          return direction * (typeof left === "number"
            ? left - right
            : left.localeCompare(right));
        });

        headers.forEach((other) => other.removeAttribute("aria-sort"));
        header.setAttribute("aria-sort", ascending ? "ascending" : "descending");
        rows.forEach((row) => tbody.appendChild(row));
      }

      header.tabIndex = 0;
      header.addEventListener("click", sortRows);
      header.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          sortRows();
        }
      });
    });
  });
})();
`;
