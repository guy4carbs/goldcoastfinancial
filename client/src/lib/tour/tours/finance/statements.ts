import type { TourConfig } from "../../types";

export const financeStatementsTour: TourConfig = {
  id: "finance.statements",
  role: "finance",
  page: "/finance/statements",
  label: "Statements",
  nextTourId: "finance.reports",
  nextCtaLabel: "Next: Reports →",
  steps: [
    {
      popover: {
        title: "Carrier statements",
        description:
          "Raw inbound data from each carrier — CSV exports, EDI files, or PDF commission statements. Every dollar the agency receives traces back to a line on one of these statements.",
      },
    },
    {
      popover: {
        title: "What this will handle",
        description:
          "CSV/EDI/PDF import per carrier, per statement period. Per-line attribution to an agent and policy. Discrepancy detection against expected commission. Archive for audit and compliance.",
      },
    },
    {
      popover: {
        title: "What to do today",
        description:
          "Placeholder — statement ingestion is handled manually. When a new carrier statement arrives (usually email, sometimes a portal download), ops saves the file to the shared drive under <em>/finance/statements/{carrier}/{YYYY-MM}</em> and logs the totals in the monthly finance spreadsheet. This page will automate that workflow.",
      },
    },
  ],
};
