# Six Sigma KPI Studio

Editable Last Mile Six Sigma KPI Studio for DSP operations, Hessen delivery-area analysis, KPI defect modeling, Pareto prioritization, and live-generated graphics.

Live site: https://sigma-kpi-studio-20260623.workspace-vo-9242.chatgpt.site/

## What it does

- Models last-mile KPIs for delay, incomplete delivery, damage, lost bags, and accidents.
- Calculates defect rate, DPMO, sigma level, Pareto contribution, cumulative Pareto, and DMAIC action.
- Loads a Hessen / Germany Google Maps area panel.
- Generates Pareto and sigma graphics from the current KPI data.
- Provides 8 editable DSP firm slots with station, area, routes, drivers, contact, and status.
- Saves DSP firm edits in browser local storage.

## Main source

- `app/page.tsx` contains the interactive KPI studio.
- `app/globals.css` contains the dashboard styling.
- `app/layout.tsx` contains page metadata.

## Local development

Install dependencies and run the app with the project package manager, then build with:

```bash
pnpm run build
```

The deployed production version is hosted through OpenAI Sites.
